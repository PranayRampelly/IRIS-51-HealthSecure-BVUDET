import AmbulanceTransport from '../models/AmbulanceTransport.js';
import AmbulanceService from '../models/AmbulanceService.js';
import AmbulanceDriver from '../models/AmbulanceDriver.js';
import User from '../models/User.js';
import { v2 as cloudinary } from 'cloudinary';
import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Get all ambulance transports for a hospital
export const getAmbulanceTransports = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { status, transportType, startDate, endDate, page = 1, limit = 20 } = req.query;

    const query = { hospital: hospitalId };

    // Filters
    if (status && status !== 'all') {
      query.status = status;
    }
    if (transportType && transportType !== 'all') {
      query.transportType = transportType;
    }
    if (startDate || endDate) {
      query['scheduling.scheduledDateTime'] = {};
      if (startDate) query['scheduling.scheduledDateTime'].$gte = new Date(startDate);
      if (endDate) query['scheduling.scheduledDateTime'].$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transports = await AmbulanceTransport.find(query)
      .populate('dispatch.ambulanceService', 'name type vehicleNumber')
      .populate('dispatch.driver', 'firstName lastName phone licenseNumber')
      .populate('medicalTeam.paramedic', 'firstName lastName')
      .populate('medicalTeam.nurse', 'firstName lastName')
      .populate('medicalTeam.doctor', 'firstName lastName')
      .populate('medicalTeam.respiratoryTherapist', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .sort({ 'scheduling.scheduledDateTime': -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await AmbulanceTransport.countDocuments(query);

    // Calculate stats
    const stats = {
      total,
      scheduled: await AmbulanceTransport.countDocuments({ ...query, status: 'scheduled' }),
      dispatched: await AmbulanceTransport.countDocuments({ ...query, status: 'dispatched' }),
      in_transit: await AmbulanceTransport.countDocuments({ ...query, status: 'in_transit' }),
      completed: await AmbulanceTransport.countDocuments({ ...query, status: 'completed' })
    };

    res.json({
      success: true,
      data: transports,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      stats
    });
  } catch (error) {
    console.error('Error fetching ambulance transports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ambulance transports',
      error: error.message
    });
  }
};

// Get single ambulance transport by ID
export const getAmbulanceTransportById = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;

    const transport = await AmbulanceTransport.findOne({
      _id: id,
      hospital: hospitalId
    })
      .populate('dispatch.ambulanceService')
      .populate('dispatch.driver')
      .populate('medicalTeam.paramedic')
      .populate('medicalTeam.nurse')
      .populate('medicalTeam.doctor')
      .populate('medicalTeam.respiratoryTherapist')
      .populate('createdBy')
      .populate('updatedBy')
      .lean();

    if (!transport) {
      return res.status(404).json({
        success: false,
        message: 'Ambulance transport not found'
      });
    }

    res.json({
      success: true,
      data: transport
    });
  } catch (error) {
    console.error('Error fetching ambulance transport:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ambulance transport',
      error: error.message
    });
  }
};

// Create new ambulance transport
export const createAmbulanceTransport = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const {
      patient,
      transportType,
      origin,
      destination,
      scheduling,
      medicalRequirements,
      medicalTeam,
      notes
    } = req.body;

    // Validate required fields
    if (!transportType || !origin || !destination || !scheduling) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: transportType, origin, destination, and scheduling are required'
      });
    }

    // Prepare patient data - schema expects an object with name (required)
    // Check if patient name is provided in medicalRequirements or notes
    const patientName = req.body.patientName || medicalRequirements?.patientName || 'Unknown Patient';
    
    let patientData = {
      name: patientName,
      patientId: patient || '',
      condition: 'stable'
    };
    
    if (patient) {
      try {
        const patientUser = await User.findById(patient);
        if (patientUser) {
          patientData.name = `${patientUser.firstName} ${patientUser.lastName}`;
          patientData.patientId = patient;
        }
      } catch (err) {
        // Use provided name if patient lookup fails
        patientData.name = patientName;
      }
    } else {
      // Use provided name if no patient ID
      patientData.name = patientName;
    }

    // Ensure origin and destination have all required fields
    const originData = {
      type: origin.type || 'hospital',
      name: origin.name || origin.address || 'Origin Location',
      address: origin.address || 'Address not specified',
      coordinates: origin.coordinates || { lat: 0, lng: 0 }
    };

    const destinationData = {
      type: destination.type || 'hospital',
      name: destination.name || destination.address || 'Destination Location',
      address: destination.address || 'Address not specified',
      coordinates: destination.coordinates || { lat: 0, lng: 0 }
    };

    // Map frontend transport types to schema enum values
    const transportTypeMap = {
      'emergency': 'emergency_transfer',
      'scheduled': 'appointment',
      'transfer': 'inter_facility',
      'discharge': 'discharge',
      'appointment': 'appointment',
      'return': 'rehabilitation'
    };
    
    const mappedTransportType = transportTypeMap[transportType] || transportType || 'other';

    const transport = new AmbulanceTransport({
      hospital: hospitalId,
      patient: patientData,
      transportType: mappedTransportType,
      origin: originData,
      destination: destinationData,
      scheduling: {
        scheduledDateTime: scheduling.scheduledDateTime ? new Date(scheduling.scheduledDateTime) : new Date(),
        estimatedDuration: scheduling.estimatedDuration || 30,
        flexible: scheduling.flexible || false
      },
      medicalRequirements: {
        mobility: medicalRequirements?.mobility || 'independent',
        oxygenRequired: medicalRequirements?.oxygenRequired || false,
        specialEquipment: medicalRequirements?.specialEquipment || [],
        notes: medicalRequirements?.medicalNotes || medicalRequirements?.notes || ''
      },
      medicalTeam: medicalTeam || {},
      notes: notes || '',
      status: 'scheduled',
      createdBy: hospitalId,
      updatedBy: hospitalId
    });

    await transport.save();

    const populatedTransport = await AmbulanceTransport.findById(transport._id)
      .populate('createdBy', 'firstName lastName')
      .populate('patient', 'firstName lastName phone')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Ambulance transport created successfully',
      data: populatedTransport
    });
  } catch (error) {
    console.error('Error creating ambulance transport:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ambulance transport',
      error: error.message
    });
  }
};

// Update ambulance transport
export const updateAmbulanceTransport = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;
    const updateData = req.body;

    const transport = await AmbulanceTransport.findOne({
      _id: id,
      hospital: hospitalId
    });

    if (!transport) {
      return res.status(404).json({
        success: false,
        message: 'Ambulance transport not found'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== 'hospital' && key !== 'transportId' && key !== 'createdAt') {
        if (typeof updateData[key] === 'object' && !Array.isArray(updateData[key])) {
          transport[key] = { ...transport[key], ...updateData[key] };
        } else {
          transport[key] = updateData[key];
        }
      }
    });

    transport.updatedBy = hospitalId;
    await transport.save();

    const updatedTransport = await AmbulanceTransport.findById(transport._id)
      .populate('dispatch.ambulanceService')
      .populate('dispatch.driver')
      .populate('medicalTeam.paramedic')
      .populate('medicalTeam.nurse')
      .populate('medicalTeam.doctor')
      .populate('updatedBy', 'firstName lastName')
      .lean();

    res.json({
      success: true,
      message: 'Ambulance transport updated successfully',
      data: updatedTransport
    });
  } catch (error) {
    console.error('Error updating ambulance transport:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ambulance transport',
      error: error.message
    });
  }
};

// Dispatch ambulance for a transport
export const dispatchAmbulanceForTransport = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;
    const { ambulanceServiceId, driverId, estimatedArrival } = req.body;

    const transport = await AmbulanceTransport.findOne({
      _id: id,
      hospital: hospitalId
    });

    if (!transport) {
      return res.status(404).json({
        success: false,
        message: 'Ambulance transport not found'
      });
    }

    // Validate ambulance service
    if (ambulanceServiceId) {
      const ambulanceService = await AmbulanceService.findById(ambulanceServiceId);
      if (!ambulanceService || ambulanceService.hospital.toString() !== hospitalId.toString()) {
        return res.status(404).json({
          success: false,
          message: 'Ambulance service not found'
        });
      }
      transport.dispatch.ambulanceService = ambulanceServiceId;
      transport.dispatch.vehicle = ambulanceServiceId;
    }

    // Validate driver
    if (driverId) {
      const driver = await AmbulanceDriver.findById(driverId);
      if (!driver || driver.hospital.toString() !== hospitalId.toString()) {
        return res.status(404).json({
          success: false,
          message: 'Driver not found'
        });
      }
      transport.dispatch.driver = driverId;
    }

    transport.dispatch.dispatchedAt = new Date();
    transport.dispatch.estimatedArrival = estimatedArrival ? new Date(estimatedArrival) : transport.scheduling.scheduledDateTime;
    transport.status = 'dispatched';
    transport.updatedBy = hospitalId;

    await transport.save();

    const updatedTransport = await AmbulanceTransport.findById(transport._id)
      .populate('dispatch.ambulanceService')
      .populate('dispatch.driver')
      .lean();

    res.json({
      success: true,
      message: 'Ambulance dispatched successfully',
      data: updatedTransport
    });
  } catch (error) {
    console.error('Error dispatching ambulance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to dispatch ambulance',
      error: error.message
    });
  }
};

// Update transport status
export const updateTransportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;
    const { status, notes } = req.body;

    const validStatuses = ['scheduled', 'dispatched', 'en_route', 'arrived', 'loading', 'in_transit', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const transport = await AmbulanceTransport.findOne({
      _id: id,
      hospital: hospitalId
    });

    if (!transport) {
      return res.status(404).json({
        success: false,
        message: 'Ambulance transport not found'
      });
    }

    // Update status-specific timestamps
    if (status === 'en_route' && !transport.dispatch.enRouteAt) {
      transport.dispatch.enRouteAt = new Date();
    }
    if (status === 'arrived' && !transport.dispatch.arrivedAt) {
      transport.dispatch.arrivedAt = new Date();
      transport.dispatch.actualArrival = new Date();
    }
    if (status === 'loading' && !transport.dispatch.pickupTime) {
      transport.dispatch.pickupTime = new Date();
    }
    if (status === 'in_transit' && !transport.dispatch.departureTime) {
      transport.dispatch.departureTime = new Date();
    }
    if (status === 'completed' && !transport.dispatch.arrivalTime) {
      transport.dispatch.arrivalTime = new Date();
      // Calculate actual duration
      if (transport.dispatch.pickupTime && transport.dispatch.arrivalTime) {
        transport.scheduling.actualDuration = Math.round(
          (transport.dispatch.arrivalTime - transport.dispatch.pickupTime) / 60000
        );
      }
    }

    transport.status = status;
    transport.updatedBy = hospitalId;
    if (notes) {
      transport.notes = notes;
    }

    await transport.save();

    const updatedTransport = await AmbulanceTransport.findById(transport._id)
      .populate('dispatch.ambulanceService')
      .populate('dispatch.driver')
      .lean();

    res.json({
      success: true,
      message: 'Transport status updated successfully',
      data: updatedTransport
    });
  } catch (error) {
    console.error('Error updating transport status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update transport status',
      error: error.message
    });
  }
};

// Record vital signs
export const recordVitalSigns = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;
    const { stage, vitalSigns } = req.body; // stage: 'preTransport', 'duringTransport', 'postTransport'

    const transport = await AmbulanceTransport.findOne({
      _id: id,
      hospital: hospitalId
    });

    if (!transport) {
      return res.status(404).json({
        success: false,
        message: 'Ambulance transport not found'
      });
    }

    if (stage === 'preTransport') {
      transport.vitalSigns.preTransport = {
        ...vitalSigns,
        recordedAt: new Date()
      };
    } else if (stage === 'duringTransport') {
      transport.vitalSigns.duringTransport.push({
        ...vitalSigns,
        recordedAt: new Date()
      });
    } else if (stage === 'postTransport') {
      transport.vitalSigns.postTransport = {
        ...vitalSigns,
        recordedAt: new Date()
      };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid stage. Must be one of: preTransport, duringTransport, postTransport'
      });
    }

    transport.updatedBy = hospitalId;
    await transport.save();

    res.json({
      success: true,
      message: 'Vital signs recorded successfully',
      data: transport.vitalSigns
    });
  } catch (error) {
    console.error('Error recording vital signs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record vital signs',
      error: error.message
    });
  }
};

// Upload document to Cloudinary
export const uploadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;
    const { type, name } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const transport = await AmbulanceTransport.findOne({
      _id: id,
      hospital: hospitalId
    });

    if (!transport) {
      return res.status(404).json({
        success: false,
        message: 'Ambulance transport not found'
      });
    }

    // File is already uploaded to Cloudinary via multer middleware
    // Use the file object directly
    const uploadResult = {
      secure_url: req.file.url || req.file.path,
      public_id: req.file.filename || req.file.public_id
    };

    // Add document to transport
    transport.documents.push({
      type: type || 'other',
      name: name || req.file.originalname,
      url: uploadResult.secure_url,
      cloudinaryId: uploadResult.public_id,
      uploadedBy: hospitalId
    });

    await transport.save();

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id
      }
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    });
  }
};

// Delete document
export const deleteDocument = async (req, res) => {
  try {
    const { id, docId } = req.params;
    const hospitalId = req.user._id;

    const transport = await AmbulanceTransport.findOne({
      _id: id,
      hospital: hospitalId
    });

    if (!transport) {
      return res.status(404).json({
        success: false,
        message: 'Ambulance transport not found'
      });
    }

    const document = transport.documents.id(docId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete from Cloudinary
    if (document.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(document.cloudinaryId);
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
      }
    }

    // Remove from array
    transport.documents.pull(docId);
    await transport.save();

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
};

// Get transport statistics
export const getTransportStats = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { startDate, endDate } = req.query;

    const query = { hospital: hospitalId };
    if (startDate || endDate) {
      query['scheduling.scheduledDateTime'] = {};
      if (startDate) query['scheduling.scheduledDateTime'].$gte = new Date(startDate);
      if (endDate) query['scheduling.scheduledDateTime'].$lte = new Date(endDate);
    }

    const [
      total,
      byStatus,
      byType,
      avgDuration
    ] = await Promise.all([
      AmbulanceTransport.countDocuments(query),
      AmbulanceTransport.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      AmbulanceTransport.aggregate([
        { $match: query },
        { $group: { _id: '$transportType', count: { $sum: 1 } } }
      ]),
      AmbulanceTransport.aggregate([
        {
          $match: {
            ...query,
            'scheduling.actualDuration': { $exists: true, $gt: 0 }
          }
        },
        {
          $group: {
            _id: null,
            avgDuration: { $avg: '$scheduling.actualDuration' }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        total,
        byStatus: byStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byType: byType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        avgDuration: avgDuration[0]?.avgDuration || 0
      }
    });
  } catch (error) {
    console.error('Error fetching transport stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transport statistics',
      error: error.message
    });
  }
};

// Export ambulance transports report
export const exportTransportsReport = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { format = 'pdf', startDate, endDate, status, transportType } = req.query;

    const query = { hospital: hospitalId };
    if (startDate || endDate) {
      query['scheduling.scheduledDateTime'] = {};
      if (startDate) query['scheduling.scheduledDateTime'].$gte = new Date(startDate);
      if (endDate) query['scheduling.scheduledDateTime'].$lte = new Date(endDate);
    }
    if (status && status !== 'all') query.status = status;
    if (transportType && transportType !== 'all') query.transportType = transportType;

    const transports = await AmbulanceTransport.find(query)
      .populate('dispatch.ambulanceService', 'name type vehicleNumber')
      .populate('dispatch.driver', 'firstName lastName phone')
      .populate('patient', 'firstName lastName phone')
      .sort({ 'scheduling.scheduledDateTime': -1 });

    if (format === 'csv') {
      const fields = [
        'transportId',
        'patientName',
        'patientPhone',
        'transportType',
        'status',
        'fromLocation',
        'toLocation',
        'scheduledDateTime',
        'ambulanceService',
        'driverName',
        'distance',
        'cost'
      ];
      
      const data = transports.map(transport => ({
        transportId: transport.transportId,
        patientName: transport.patient ? `${transport.patient.firstName} ${transport.patient.lastName}` : 'N/A',
        patientPhone: transport.patient?.phone || 'N/A',
        transportType: transport.transportType,
        status: transport.status,
        fromLocation: transport.origin?.address || 'N/A',
        toLocation: transport.destination?.address || 'N/A',
        scheduledDateTime: transport.scheduling?.scheduledDateTime?.toISOString() || 'N/A',
        ambulanceService: transport.dispatch?.ambulanceService?.name || 'N/A',
        driverName: transport.dispatch?.driver ? `${transport.dispatch.driver.firstName} ${transport.dispatch.driver.lastName}` : 'N/A',
        distance: transport.origin?.distance || 'N/A',
        cost: transport.billing?.cost || 0
      }));

      const parser = new Parser({ fields });
      const csv = parser.parse(data);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=ambulance-transports-${Date.now()}.csv`);
      res.send(csv);
    } else {
      // PDF export
      const doc = new PDFDocument({ margin: 40 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=ambulance-transports-${Date.now()}.pdf`);
      doc.pipe(res);

      // Header
      doc.fontSize(20).fillColor('#006d77').font('Helvetica-Bold')
        .text('Patient Transport Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).fillColor('black').font('Helvetica')
        .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(2);

      // Summary
      doc.fontSize(14).fillColor('#006d77').font('Helvetica-Bold').text('Summary');
      doc.fontSize(11).fillColor('black').font('Helvetica');
      doc.text(`Total Transports: ${transports.length}`);
      doc.text(`Scheduled: ${transports.filter(t => t.status === 'scheduled').length}`);
      doc.text(`In Progress: ${transports.filter(t => t.status === 'in-progress').length}`);
      doc.text(`Completed: ${transports.filter(t => t.status === 'completed').length}`);
      doc.moveDown(2);

      // Transports list
      doc.fontSize(14).fillColor('#006d77').font('Helvetica-Bold').text('Transport Details');
      doc.moveDown();

      transports.forEach((transport, index) => {
        if (doc.y > 700) {
          doc.addPage();
        }

        doc.fontSize(12).fillColor('#006d77').font('Helvetica-Bold')
          .text(`${index + 1}. Transport ID: ${transport.transportId}`);
        doc.fontSize(10).fillColor('black').font('Helvetica');
        doc.text(`Patient: ${transport.patient ? `${transport.patient.firstName} ${transport.patient.lastName}` : 'N/A'}`);
        doc.text(`Phone: ${transport.patient?.phone || 'N/A'}`);
        doc.text(`Type: ${transport.transportType}`);
        doc.text(`Status: ${transport.status}`);
        doc.text(`From: ${transport.origin?.address || 'N/A'}`);
        doc.text(`To: ${transport.destination?.address || 'N/A'}`);
        doc.text(`Scheduled: ${transport.scheduling?.scheduledDateTime?.toLocaleString() || 'N/A'}`);
        if (transport.dispatch?.ambulanceService) {
          doc.text(`Ambulance: ${transport.dispatch.ambulanceService.name}`);
        }
        if (transport.dispatch?.driver) {
          doc.text(`Driver: ${transport.dispatch.driver.firstName} ${transport.dispatch.driver.lastName}`);
        }
        doc.text(`Distance: ${transport.origin?.distance || 'N/A'} km`);
        doc.text(`Cost: $${transport.billing?.cost || 0}`);
        doc.moveDown();
      });

      doc.end();
    }
  } catch (error) {
    console.error('Error exporting transports report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report',
      error: error.message
    });
  }
};

