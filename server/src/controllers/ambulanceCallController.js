import AmbulanceCall from '../models/AmbulanceCall.js';
import AmbulanceService from '../models/AmbulanceService.js';
import AmbulanceDriver from '../models/AmbulanceDriver.js';
import User from '../models/User.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { v2 as cloudinary } from 'cloudinary';
import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Get all ambulance calls for a hospital
export const getAmbulanceCalls = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { status, priority, type, startDate, endDate, page = 1, limit = 20 } = req.query;

    const query = { hospital: hospitalId };

    // Filters
    if (status && status !== 'all') {
      query.status = status;
    }
    if (priority && priority !== 'all') {
      query['emergencyDetails.priority'] = priority;
    }
    if (type && type !== 'all') {
      query['emergencyDetails.type'] = type;
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const calls = await AmbulanceCall.find(query)
      .populate('dispatch.ambulanceService', 'name type vehicleNumber')
      .populate('dispatch.driver', 'firstName lastName phone licenseNumber')
      .populate('medicalTeam.paramedic', 'firstName lastName')
      .populate('medicalTeam.nurse', 'firstName lastName')
      .populate('medicalTeam.doctor', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await AmbulanceCall.countDocuments(query);

    // Calculate stats
    const stats = {
      total,
      pending: await AmbulanceCall.countDocuments({ ...query, status: 'pending' }),
      dispatched: await AmbulanceCall.countDocuments({ ...query, status: 'dispatched' }),
      en_route: await AmbulanceCall.countDocuments({ ...query, status: 'en_route' }),
      completed: await AmbulanceCall.countDocuments({ ...query, status: 'completed' }),
      critical: await AmbulanceCall.countDocuments({ ...query, 'emergencyDetails.priority': 'critical' })
    };

    res.json({
      success: true,
      data: calls,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      stats
    });
  } catch (error) {
    console.error('Error fetching ambulance calls:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ambulance calls',
      error: error.message
    });
  }
};

// Get single ambulance call by ID
export const getAmbulanceCallById = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;

    const call = await AmbulanceCall.findOne({
      _id: id,
      hospital: hospitalId
    })
      .populate('dispatch.ambulanceService')
      .populate('dispatch.driver')
      .populate('medicalTeam.paramedic')
      .populate('medicalTeam.nurse')
      .populate('medicalTeam.doctor')
      .populate('createdBy')
      .populate('updatedBy')
      .lean();

    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Ambulance call not found'
      });
    }

    res.json({
      success: true,
      data: call
    });
  } catch (error) {
    console.error('Error fetching ambulance call:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ambulance call',
      error: error.message
    });
  }
};

// Create new ambulance call
export const createAmbulanceCall = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const {
      caller,
      patient,
      emergencyDetails,
      destination,
      medicalTeam,
      notes
    } = req.body;

    // Validate required fields
    if (!caller || !emergencyDetails) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: caller and emergencyDetails are required'
      });
    }

    // Prepare patient data - schema expects an object with name and condition (required)
    let patientData = {
      name: caller?.name || 'Unknown Patient',
      condition: emergencyDetails?.description || emergencyDetails?.type || 'Emergency',
      symptoms: Array.isArray(emergencyDetails?.symptoms) 
        ? emergencyDetails.symptoms.join(', ') 
        : (typeof emergencyDetails?.symptoms === 'string' ? emergencyDetails.symptoms : '')
    };
    
    // If patient ID provided, try to get patient details
    if (patient) {
      try {
        const patientUser = await User.findById(patient);
        if (patientUser) {
          patientData.name = `${patientUser.firstName} ${patientUser.lastName}`;
          if (patientUser.phone) {
            // Store phone in medical history field if needed
            patientData.medicalHistory = `Phone: ${patientUser.phone}`;
          }
        }
      } catch (err) {
        console.log('Patient not found, using caller info');
      }
    }

    // Prepare caller location - required by schema (caller.location.address is required)
    const locationAddress = emergencyDetails?.location?.address || destination?.address || emergencyDetails?.description || 'Location not specified';
    const locationCoords = emergencyDetails?.location?.coordinates || destination?.coordinates || { lat: 0, lng: 0 };

    const call = new AmbulanceCall({
      hospital: hospitalId,
      caller: {
        name: caller.name || 'Unknown',
        phone: caller.phone || '',
        relationship: caller.relationship || 'self',
        location: {
          address: locationAddress,
          coordinates: locationCoords
        }
      },
      patient: patientData,
      emergencyDetails: {
        type: emergencyDetails.type || 'medical',
        priority: emergencyDetails.priority || 'medium',
        estimatedSeverity: emergencyDetails.severity === 'critical' ? 'critical' 
          : emergencyDetails.severity === 'high' ? 'severe'
          : emergencyDetails.severity === 'medium' ? 'moderate'
          : 'mild',
        description: emergencyDetails.description || notes || ''
      },
      destination: destination || { type: 'hospital' },
      medicalTeam: medicalTeam || {},
      notes: notes || '',
      status: 'pending',
      createdBy: hospitalId,
      updatedBy: hospitalId
    });

    await call.save();

    const populatedCall = await AmbulanceCall.findById(call._id)
      .populate('createdBy', 'firstName lastName')
      .populate('patient', 'firstName lastName phone')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Ambulance call created successfully',
      data: populatedCall
    });
  } catch (error) {
    console.error('Error creating ambulance call:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ambulance call',
      error: error.message
    });
  }
};

// Update ambulance call
export const updateAmbulanceCall = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;
    const updateData = req.body;

    const call = await AmbulanceCall.findOne({
      _id: id,
      hospital: hospitalId
    });

    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Ambulance call not found'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== 'hospital' && key !== 'callId' && key !== 'createdAt') {
        if (typeof updateData[key] === 'object' && !Array.isArray(updateData[key])) {
          call[key] = { ...call[key], ...updateData[key] };
        } else {
          call[key] = updateData[key];
        }
      }
    });

    call.updatedBy = hospitalId;
    await call.save();

    const updatedCall = await AmbulanceCall.findById(call._id)
      .populate('dispatch.ambulanceService')
      .populate('dispatch.driver')
      .populate('medicalTeam.paramedic')
      .populate('medicalTeam.nurse')
      .populate('medicalTeam.doctor')
      .populate('updatedBy', 'firstName lastName')
      .lean();

    res.json({
      success: true,
      message: 'Ambulance call updated successfully',
      data: updatedCall
    });
  } catch (error) {
    console.error('Error updating ambulance call:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ambulance call',
      error: error.message
    });
  }
};

// Dispatch ambulance for a call
export const dispatchAmbulance = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;
    const { ambulanceServiceId, driverId, estimatedArrival } = req.body;

    const call = await AmbulanceCall.findOne({
      _id: id,
      hospital: hospitalId
    });

    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Ambulance call not found'
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
      call.dispatch.ambulanceService = ambulanceServiceId;
      call.dispatch.vehicle = ambulanceServiceId;
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
      call.dispatch.driver = driverId;
    }

    call.dispatch.dispatchedAt = new Date();
    call.dispatch.estimatedArrival = estimatedArrival ? new Date(estimatedArrival) : new Date(Date.now() + 15 * 60000); // Default 15 minutes
    call.status = 'dispatched';
    call.updatedBy = hospitalId;

    await call.save();

    const updatedCall = await AmbulanceCall.findById(call._id)
      .populate('dispatch.ambulanceService')
      .populate('dispatch.driver')
      .lean();

    res.json({
      success: true,
      message: 'Ambulance dispatched successfully',
      data: updatedCall
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

// Update call status
export const updateCallStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;
    const { status, notes } = req.body;

    const validStatuses = ['pending', 'dispatched', 'en_route', 'arrived', 'in_transit', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const call = await AmbulanceCall.findOne({
      _id: id,
      hospital: hospitalId
    });

    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Ambulance call not found'
      });
    }

    // Update status-specific timestamps
    if (status === 'en_route' && !call.dispatch.enRouteAt) {
      call.dispatch.enRouteAt = new Date();
    }
    if (status === 'arrived' && !call.dispatch.arrivedAt) {
      call.dispatch.arrivedAt = new Date();
      call.dispatch.actualArrival = new Date();
    }

    call.status = status;
    call.updatedBy = hospitalId;
    if (notes) {
      call.notes = notes;
    }

    await call.save();

    const updatedCall = await AmbulanceCall.findById(call._id)
      .populate('dispatch.ambulanceService')
      .populate('dispatch.driver')
      .lean();

    res.json({
      success: true,
      message: 'Call status updated successfully',
      data: updatedCall
    });
  } catch (error) {
    console.error('Error updating call status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update call status',
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

    const call = await AmbulanceCall.findOne({
      _id: id,
      hospital: hospitalId
    });

    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Ambulance call not found'
      });
    }

    // File is already uploaded to Cloudinary via multer middleware
    // Use the file object directly
    const uploadResult = {
      secure_url: req.file.url || req.file.path,
      public_id: req.file.filename || req.file.public_id
    };

    // Add document to call
    call.documents.push({
      type: type || 'other',
      name: name || req.file.originalname,
      url: uploadResult.secure_url,
      cloudinaryId: uploadResult.public_id,
      uploadedBy: hospitalId
    });

    await call.save();

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

    const call = await AmbulanceCall.findOne({
      _id: id,
      hospital: hospitalId
    });

    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Ambulance call not found'
      });
    }

    const document = call.documents.id(docId);
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
    call.documents.pull(docId);
    await call.save();

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

// Get call statistics
export const getCallStats = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { startDate, endDate } = req.query;

    const query = { hospital: hospitalId };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [
      total,
      byStatus,
      byPriority,
      byType,
      avgResponseTime
    ] = await Promise.all([
      AmbulanceCall.countDocuments(query),
      AmbulanceCall.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      AmbulanceCall.aggregate([
        { $match: query },
        { $group: { _id: '$emergencyDetails.priority', count: { $sum: 1 } } }
      ]),
      AmbulanceCall.aggregate([
        { $match: query },
        { $group: { _id: '$emergencyDetails.type', count: { $sum: 1 } } }
      ]),
      AmbulanceCall.aggregate([
        {
          $match: {
            ...query,
            'dispatch.dispatchedAt': { $exists: true },
            'dispatch.arrivedAt': { $exists: true }
          }
        },
        {
          $project: {
            responseTime: {
              $subtract: ['$dispatch.arrivedAt', '$dispatch.dispatchedAt']
            }
          }
        },
        {
          $group: {
            _id: null,
            avgResponseTime: { $avg: '$responseTime' }
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
        byPriority: byPriority.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byType: byType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        avgResponseTime: avgResponseTime[0]?.avgResponseTime || 0
      }
    });
  } catch (error) {
    console.error('Error fetching call stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch call statistics',
      error: error.message
    });
  }
};

// Export ambulance calls report
export const exportCallsReport = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { format = 'pdf', startDate, endDate, status, priority } = req.query;

    const query = { hospital: hospitalId };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query['emergencyDetails.priority'] = priority;

    const calls = await AmbulanceCall.find(query)
      .populate('dispatch.ambulanceService', 'name type vehicleNumber')
      .populate('dispatch.driver', 'firstName lastName phone')
      .populate('patient', 'firstName lastName phone')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      const fields = [
        'callId',
        'patientName',
        'patientPhone',
        'emergencyType',
        'priority',
        'status',
        'location',
        'createdAt',
        'ambulanceService',
        'driverName',
        'responseTime'
      ];
      
      const data = calls.map(call => ({
        callId: call.callId,
        patientName: call.patient ? `${call.patient.firstName} ${call.patient.lastName}` : call.caller?.name || 'N/A',
        patientPhone: call.patient?.phone || call.caller?.phone || 'N/A',
        emergencyType: call.emergencyDetails?.type || 'N/A',
        priority: call.emergencyDetails?.priority || 'N/A',
        status: call.status,
        location: call.emergencyDetails?.location?.address || 'N/A',
        createdAt: call.createdAt.toISOString(),
        ambulanceService: call.dispatch?.ambulanceService?.name || 'N/A',
        driverName: call.dispatch?.driver ? `${call.dispatch.driver.firstName} ${call.dispatch.driver.lastName}` : 'N/A',
        responseTime: call.timeline?.dispatchedAt && call.timeline?.receivedAt 
          ? Math.round((new Date(call.timeline.dispatchedAt) - new Date(call.timeline.receivedAt)) / 1000 / 60) + ' min'
          : 'N/A'
      }));

      const parser = new Parser({ fields });
      const csv = parser.parse(data);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=ambulance-calls-${Date.now()}.csv`);
      res.send(csv);
    } else {
      // PDF export
      const doc = new PDFDocument({ margin: 40 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=ambulance-calls-${Date.now()}.pdf`);
      doc.pipe(res);

      // Header
      doc.fontSize(20).fillColor('#006d77').font('Helvetica-Bold')
        .text('Ambulance Calls Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).fillColor('black').font('Helvetica')
        .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(2);

      // Summary
      doc.fontSize(14).fillColor('#006d77').font('Helvetica-Bold').text('Summary');
      doc.fontSize(11).fillColor('black').font('Helvetica');
      doc.text(`Total Calls: ${calls.length}`);
      doc.text(`Pending: ${calls.filter(c => c.status === 'pending').length}`);
      doc.text(`Dispatched: ${calls.filter(c => c.status === 'dispatched').length}`);
      doc.text(`Completed: ${calls.filter(c => c.status === 'completed').length}`);
      doc.moveDown(2);

      // Calls list
      doc.fontSize(14).fillColor('#006d77').font('Helvetica-Bold').text('Call Details');
      doc.moveDown();

      calls.forEach((call, index) => {
        if (doc.y > 700) {
          doc.addPage();
        }

        doc.fontSize(12).fillColor('#006d77').font('Helvetica-Bold')
          .text(`${index + 1}. Call ID: ${call.callId}`);
        doc.fontSize(10).fillColor('black').font('Helvetica');
        doc.text(`Patient: ${call.patient ? `${call.patient.firstName} ${call.patient.lastName}` : call.caller?.name || 'N/A'}`);
        doc.text(`Phone: ${call.patient?.phone || call.caller?.phone || 'N/A'}`);
        doc.text(`Type: ${call.emergencyDetails?.type || 'N/A'}`);
        doc.text(`Priority: ${call.emergencyDetails?.priority || 'N/A'}`);
        doc.text(`Status: ${call.status}`);
        doc.text(`Location: ${call.emergencyDetails?.location?.address || 'N/A'}`);
        doc.text(`Created: ${call.createdAt.toLocaleString()}`);
        if (call.dispatch?.ambulanceService) {
          doc.text(`Ambulance: ${call.dispatch.ambulanceService.name}`);
        }
        if (call.dispatch?.driver) {
          doc.text(`Driver: ${call.dispatch.driver.firstName} ${call.dispatch.driver.lastName}`);
        }
        doc.moveDown();
      });

      doc.end();
    }
  } catch (error) {
    console.error('Error exporting calls report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report',
      error: error.message
    });
  }
};

