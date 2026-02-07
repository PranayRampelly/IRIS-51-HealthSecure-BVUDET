import ProofRequest from '../models/ProofRequest.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';

// Create a new proof request
export const createProofRequest = async (req, res) => {
  try {
    let {
      patientId,
      proofType,
      urgency,
      reason,
      dueDate,
      category,
      priority,
      notes,
      autoFollowUp,
      notifyPatient,
      documents,
      // aliases from doctor UI
      purpose,
      expiresAt
    } = req.body;

    // Normalize aliases from doctor-facing UI
    if (!reason && purpose) reason = purpose;
    if (!dueDate && expiresAt) dueDate = expiresAt;
    if (typeof urgency === 'string') {
      const u = urgency.toLowerCase();
      if (u === 'normal') urgency = 'Medium';
      else if (u === 'medium') urgency = 'Medium';
      else if (u === 'high') urgency = 'High';
      else if (u === 'low') urgency = 'Low';
    }

    // Resolve patient by email if patientId is not a valid ObjectId
    if (patientId && typeof patientId === 'string') {
      const isLikelyEmail = patientId.includes('@');
      const isObjectId = /^[a-fA-F0-9]{24}$/.test(patientId);
      if (!isObjectId && isLikelyEmail) {
        const patientByEmail = await Patient.findOne({ email: patientId });
        if (patientByEmail) patientId = patientByEmail._id.toString();
        else {
          return res.status(404).json({
            success: false,
            message: 'Patient not found for the provided email'
          });
        }
      } else if (!isObjectId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid patient identifier provided'
        });
      }
    }

    // Validate required fields
    if (!patientId || !proofType || !urgency || !reason || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: patientId, proofType, urgency, reason, dueDate'
      });
    }

    // If multipart, collect file metadata (optional)
    if (req.file) {
      documents = documents || [];
      documents.push({
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date()
      });
    }

    // Coerce dueDate to Date if string
    if (typeof dueDate === 'string') {
      const d = new Date(dueDate);
      if (!isNaN(d.getTime())) dueDate = d.toISOString();
    }

    // Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // If the requester is a doctor, constrain the scope: assign to self
    if (req.user?.role === 'doctor') {
      req.body.requestedBy = req.user._id;
    }

    // Create the proof request
    const proofRequest = new ProofRequest({
      patientId,
      proofType,
      urgency,
      reason,
      dueDate,
      category: category || 'General',
      priority: priority || 1,
      notes: notes || '',
      autoFollowUp: autoFollowUp || false,
      notifyPatient: notifyPatient || false,
      documents: documents || [],
      status: 'pending',
      requestedBy: req.user._id,
      requestedAt: new Date()
    });

    const savedRequest = await proofRequest.save();

    // Populate patient details for response
    await savedRequest.populate('patientId', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Proof request created successfully',
      data: savedRequest
    });

  } catch (error) {
    console.error('Error creating proof request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Doctor: list proof requests requested by the logged-in doctor
export const getDoctorRequestsForSelf = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { requestedBy: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [list, total] = await Promise.all([
      ProofRequest.find(filter)
        .populate('patientId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ProofRequest.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        requests: list,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching doctor proof requests:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get all proof requests with filtering
export const getProofRequests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      urgency,
      patientId,
      search
    } = req.query;

    const filter = {};

    // Apply filters
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (urgency) filter.urgency = urgency;
    if (patientId) filter.patientId = patientId;

    // Search functionality
    if (search) {
      filter.$or = [
        { proofType: { $regex: search, $options: 'i' } },
        { reason: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [proofRequests, total] = await Promise.all([
      ProofRequest.find(filter)
        .populate('patientId', 'firstName lastName email')
        .populate('requestedBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ProofRequest.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        proofRequests,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching proof requests:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get proof request by ID
export const getProofRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const proofRequest = await ProofRequest.findById(id)
      .populate('patientId', 'firstName lastName email phone dateOfBirth')
      .populate('requestedBy', 'firstName lastName email');

    if (!proofRequest) {
      return res.status(404).json({
        success: false,
        message: 'Proof request not found'
      });
    }

    res.json({
      success: true,
      data: proofRequest
    });

  } catch (error) {
    console.error('Error fetching proof request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update proof request
export const updateProofRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const proofRequest = await ProofRequest.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('patientId', 'firstName lastName email');

    if (!proofRequest) {
      return res.status(404).json({
        success: false,
        message: 'Proof request not found'
      });
    }

    res.json({
      success: true,
      message: 'Proof request updated successfully',
      data: proofRequest
    });

  } catch (error) {
    console.error('Error updating proof request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete proof request
export const deleteProofRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const proofRequest = await ProofRequest.findByIdAndDelete(id);

    if (!proofRequest) {
      return res.status(404).json({
        success: false,
        message: 'Proof request not found'
      });
    }

    res.json({
      success: true,
      message: 'Proof request deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting proof request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update proof request status
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const proofRequest = await ProofRequest.findByIdAndUpdate(
      id,
      { 
        status, 
        notes: notes || '',
        updatedAt: new Date() 
      },
      { new: true, runValidators: true }
    ).populate('patientId', 'firstName lastName email');

    if (!proofRequest) {
      return res.status(404).json({
        success: false,
        message: 'Proof request not found'
      });
    }

    res.json({
      success: true,
      message: 'Proof request status updated successfully',
      data: proofRequest
    });

  } catch (error) {
    console.error('Error updating proof request status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Patient: get pending proof-requests count
export const getPendingCountForPatient = async (req, res) => {
  try {
    const count = await ProofRequest.countDocuments({
      patientId: req.user._id,
      status: { $in: ['Pending', 'pending'] }
    });
    res.json({ success: true, pending: count });
  } catch (error) {
    console.error('Error counting pending proof requests:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Patient: list own proof-requests
export const getPatientProofRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { patientId: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [list, total] = await Promise.all([
      ProofRequest.find(filter)
        .populate('requestedBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ProofRequest.countDocuments(filter)
    ]);

    // Provide both legacy and new response shapes for compatibility
    res.json({
      success: true,
      requests: list,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: {
        proofRequests: list,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching patient proof requests:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export default {
  createProofRequest,
  getProofRequests,
  getProofRequestById,
  updateProofRequest,
  deleteProofRequest,
  updateStatus,
  getPendingCountForPatient,
  getPatientProofRequests,
  getDoctorRequestsForSelf
}; 