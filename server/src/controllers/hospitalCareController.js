import mongoose from 'mongoose';
import PatientAdmission from '../models/PatientAdmission.js';
import HospitalPatientRecord from '../models/HospitalPatientRecord.js';
import HospitalDischarge from '../models/HospitalDischarge.js';
import User from '../models/User.js';

const toTitleCase = (value = '') => value.replace(/\b\w/g, (char) => char.toUpperCase());

const buildName = (patient) => {
  if (!patient) return 'Unknown Patient';
  const first = patient.firstName || '';
  const last = patient.lastName || '';
  const fallback = patient.patientName || '';
  const name = `${first} ${last}`.trim() || fallback;
  return name || 'Unknown Patient';
};

const initialsAvatar = (name) => {
  const seed = encodeURIComponent(name || 'Patient');
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&radius=50`;
};

const formatRecord = (record) => ({
  id: record._id,
  patientId: record.patientId,
  patientName: record.patientName,
  recordType: record.recordType,
  department: record.department,
  physician: record.physician,
  date: record.date,
  diagnosis: record.diagnosis,
  treatment: record.treatment,
  medications: record.medications,
  vitalSigns: record.vitalSigns,
  labResults: record.labResults,
  imagingResults: record.imagingResults,
  notes: record.notes,
  attachments: record.attachments,
  status: record.status
});

const formatDischarge = (admission) => {
  const patientName = buildName(admission.patient);
  return {
    id: admission._id.toString(),
    admissionId: admission._id,
    patientId: admission.patient?.patientId || admission.patient?._id?.toString(),
    patientName,
    avatar: initialsAvatar(patientName),
    admissionDate: admission.admissionDate,
    dischargeDate: admission.dischargePlan?.dischargeDate || admission.actualDischargeDate,
    department: admission.department,
    primaryDiagnosis: admission.primaryDiagnosis,
    dischargeDiagnosis: admission.secondaryDiagnosis?.[0] || admission.primaryDiagnosis,
    dischargeType: admission.dischargePlan?.dischargeType || 'home',
    dischargeDestination: admission.dischargePlan?.destination || admission.dischargePlan?.dischargeType || 'home',
    dischargeInstructions: admission.dischargePlan?.homeCareInstructions,
    medications: admission.dischargePlan?.medications || [],
    followUpAppointment: admission.dischargePlan?.followUpAppointment,
    followUpPhysician: admission.dischargePlan?.followUpDoctor,
    notes: admission.dischargePlan?.notes || admission.progressNotes?.find(note => note.category === 'discharge')?.note,
    status: admission.dischargePlan?.status || (admission.status === 'discharged' ? 'completed' : 'pending'),
    assignedDoctor: admission.admittingDoctor ? `Dr. ${admission.admittingDoctor.firstName} ${admission.admittingDoctor.lastName}` : undefined
  };
};

const formatTrackingEntry = (admission) => {
  const patientName = buildName(admission.patient);
  return {
    patientId: admission.patient?._id?.toString() || admission.patientId || admission._id.toString(),
    patientName,
    avatar: initialsAvatar(patientName),
    currentLocation: admission.tracking?.currentLocation || admission.department || 'ward',
    department: admission.department,
    roomNumber: admission.tracking?.roomNumber || admission.room?.roomNumber || 'TBD',
    bedNumber: admission.tracking?.bedNumber || admission.bed?.bedNumber || 'TBD',
    status: admission.tracking?.status || mapAdmissionStatusToTracking(admission.status),
    lastSeen: admission.tracking?.lastSeen || admission.updatedAt,
    assignedNurse: admission.tracking?.assignedNurse || 'Unassigned',
    assignedDoctor: admission.tracking?.assignedDoctorName ||
      (admission.admittingDoctor ? `Dr. ${admission.admittingDoctor.firstName} ${admission.admittingDoctor.lastName}` : ''),
    vitalSigns: admission.tracking?.vitalSigns || admission.vitalSigns?.slice(-1)[0] || {},
    notes: admission.tracking?.notes || admission.progressNotes?.slice(-1)[0]?.note || '',
    alerts: [],
    patientExternalId: admission.patient?.patientId
  };
};

const mapAdmissionStatusToTracking = (status) => {
  switch (status) {
    case 'critical':
      return 'critical';
    case 'discharged':
    case 'ready-for-discharge':
      return 'discharged';
    case 'transferred':
      return 'transferred';
    default:
      return status === 'stable' ? 'stable' : 'active';
  }
};

const resolvePatientIdentifiers = async (patientId, patientName) => {
  if (!patientId) {
    return { patientId: patientName || 'unknown', patientName: patientName || 'Unknown Patient' };
  }

  let patient = null;
  if (mongoose.Types.ObjectId.isValid(patientId)) {
    patient = await User.findById(patientId).select('firstName lastName patientId');
  }

  if (!patient) {
    patient = await User.findOne({ patientId }).select('firstName lastName patientId');
  }

  if (patient) {
    return {
      patientId: patient.patientId || patient._id.toString(),
      patientName: buildName(patient),
      patientObjectId: patient._id
    };
  }

  return { patientId, patientName: patientName || patientId };
};

const findAdmissionByPatientIdentifier = async (hospitalId, identifier) => {
  if (!identifier) return null;

  const query = { hospital: hospitalId };
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    query.$or = [
      { patient: new mongoose.Types.ObjectId(identifier) },
      { _id: new mongoose.Types.ObjectId(identifier) }
    ];
  } else {
    query.$or = [{ patientExternalId: identifier }, { admissionNumber: identifier }];
  }

  return PatientAdmission.findOne(query)
    .populate('patient', 'firstName lastName patientId')
    .populate('admittingDoctor', 'firstName lastName specialization');
};

// Patient Records
export const getHospitalPatientRecords = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { search, recordType, department, limit = 200 } = req.query;

    const query = { hospitalId };
    if (recordType && recordType !== 'all') {
      query.recordType = recordType;
    }
    if (department && department !== 'all') {
      query.department = department;
    }
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { patientName: regex },
        { patientId: regex },
        { diagnosis: regex },
        { physician: regex }
      ];
    }

    const records = await HospitalPatientRecord.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit, 10));

    const totalRecords = await HospitalPatientRecord.countDocuments({ hospitalId });
    const typeBreakdown = await HospitalPatientRecord.aggregate([
      { $match: { hospitalId } },
      { $group: { _id: '$recordType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      records: records.map(formatRecord),
      stats: {
        totalRecords,
        typeBreakdown
      }
    });
  } catch (error) {
    console.error('Error fetching hospital patient records:', error);
    res.status(500).json({ message: 'Failed to load patient records' });
  }
};

export const createHospitalPatientRecord = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const {
      patientId,
      patientName,
      recordType = 'consultation',
      department,
      physician,
      date,
      diagnosis,
      treatment,
      medications,
      vitalSigns,
      labResults,
      imagingResults,
      notes
    } = req.body;

    if (!patientId && !patientName) {
      return res.status(400).json({ message: 'Patient information is required' });
    }

    if (!department || !physician) {
      return res.status(400).json({ message: 'Department and physician are required' });
    }

    const resolvedPatient = await resolvePatientIdentifiers(patientId, patientName);

    const record = await HospitalPatientRecord.create({
      hospitalId,
      patientId: resolvedPatient.patientId,
      patientObjectId: resolvedPatient.patientObjectId,
      patientName: resolvedPatient.patientName,
      recordType,
      department,
      physician,
      date: date ? new Date(date) : new Date(),
      diagnosis,
      treatment,
      medications,
      vitalSigns,
      labResults,
      imagingResults,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Patient record created successfully',
      record: formatRecord(record)
    });
  } catch (error) {
    console.error('Error creating hospital patient record:', error);
    res.status(500).json({ message: 'Failed to create patient record' });
  }
};

// Discharges
export const getHospitalDischarges = async (req, res) => {
  try {
    // Add logging for debugging
    console.log('GET /api/hospital/discharges - User:', req.user?._id, 'Role:', req.user?.role);
    
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const hospitalId = req.user._id;
    const { status, department } = req.query;

    // Get discharges from PatientAdmission records
    const admissions = await PatientAdmission.find({ hospital: hospitalId })
      .populate('patient', 'firstName lastName patientId')
      .populate('admittingDoctor', 'firstName lastName specialization')
      .sort({ updatedAt: -1 });

    let discharges = admissions
      .filter((admission) => admission.dischargePlan || admission.status === 'discharged')
      .map(formatDischarge);

    // Also get standalone HospitalDischarge records
    const query = { hospital: hospitalId };
    if (status && status !== 'all') {
      query.status = status;
    }
    if (department && department !== 'all') {
      query.department = department;
    }

    const standaloneDischarges = await HospitalDischarge.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Format standalone discharges to match the expected format
    const formattedStandalone = standaloneDischarges.map((discharge) => ({
      id: discharge._id.toString(),
      admissionId: discharge._id.toString(),
      patientId: discharge.patientId,
      patientName: discharge.patientName,
      avatar: initialsAvatar(discharge.patientName),
      admissionDate: discharge.admissionDate,
      dischargeDate: discharge.dischargeDate,
      department: discharge.department,
      primaryDiagnosis: discharge.primaryDiagnosis,
      dischargeDiagnosis: discharge.dischargeDiagnosis,
      dischargeType: discharge.dischargeType,
      dischargeDestination: discharge.dischargeDestination,
      dischargeInstructions: discharge.dischargeInstructions,
      medications: discharge.medications,
      followUpAppointment: discharge.followUpAppointment,
      followUpPhysician: discharge.followUpPhysician,
      homeCareNeeded: discharge.homeCareNeeded,
      homeCareDetails: discharge.homeCareDetails,
      transportationNeeded: discharge.transportationNeeded,
      transportationDetails: discharge.transportationDetails,
      dischargeSummary: discharge.dischargeSummary,
      notes: discharge.notes,
      status: discharge.status
    }));

    // Combine both types of discharges
    discharges = [...discharges, ...formattedStandalone];

    if (status && status !== 'all') {
      discharges = discharges.filter((discharge) => discharge.status === status);
    }

    if (department && department !== 'all') {
      discharges = discharges.filter((discharge) => discharge.department === department);
    }

    const stats = discharges.reduce((acc, discharge) => {
      acc.total += 1;
      acc[discharge.status] = (acc[discharge.status] || 0) + 1;
      return acc;
    }, { total: 0, pending: 0, approved: 0, discharged: 0, completed: 0 });

    const today = new Date();
    const todayDischarges = discharges.filter((discharge) => {
      if (!discharge.dischargeDate) return false;
      const dischargeDate = new Date(discharge.dischargeDate);
      return dischargeDate.toDateString() === today.toDateString();
    });

    res.json({
      success: true,
      discharges,
      stats,
      today: todayDischarges
    });
  } catch (error) {
    console.error('Error fetching hospital discharges:', error);
    res.status(500).json({ message: 'Failed to load discharges' });
  }
};

export const createHospitalDischargePlan = async (req, res) => {
  try {
    // Add logging for debugging
    console.log('POST /api/hospital/discharges - createHospitalDischargePlan called');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user?._id, 'Role:', req.user?.role);
    
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const hospitalId = req.user._id;
    const {
      admissionId,
      patientId,
      dischargeDate,
      department,
      dischargeType,
      dischargeDestination,
      dischargeInstructions,
      medications,
      followUpAppointment,
      followUpPhysician,
      notes
    } = req.body;

    let admission = null;

    if (admissionId && mongoose.Types.ObjectId.isValid(admissionId)) {
      admission = await PatientAdmission.findOne({ _id: admissionId, hospital: hospitalId })
        .populate('patient', 'firstName lastName patientId')
        .populate('admittingDoctor', 'firstName lastName specialization');
    }

    if (!admission && patientId) {
      admission = await PatientAdmission.findOne({
        hospital: hospitalId,
        $or: [
          { patient: mongoose.Types.ObjectId.isValid(patientId) ? new mongoose.Types.ObjectId(patientId) : undefined },
          { patientExternalId: patientId },
          { admissionNumber: patientId }
        ].filter(Boolean)
      })
        .populate('patient', 'firstName lastName patientId')
        .populate('admittingDoctor', 'firstName lastName specialization');
    }

    // If no admission found, create a standalone HospitalDischarge record
    // This allows creating discharge plans for patients who may not have a formal admission record
    if (!admission) {
      console.log('No admission found, creating standalone HospitalDischarge record');
      
      const {
        patientName,
        primaryDiagnosis,
        dischargeDiagnosis,
        homeCareNeeded,
        homeCareDetails,
        transportationNeeded,
        transportationDetails,
        dischargeSummary
      } = req.body;

      // Validate required fields for HospitalDischarge (allow empty strings to be treated as missing)
      const missingFields = [];
      if (!patientId || patientId.trim() === '') missingFields.push('patientId');
      if (!patientName || patientName.trim() === '') missingFields.push('patientName');
      if (!department || department.trim() === '') missingFields.push('department');
      if (!primaryDiagnosis || primaryDiagnosis.trim() === '') missingFields.push('primaryDiagnosis');
      
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}. Please provide all required information.`,
          missingFields: missingFields,
          required: ['patientId', 'patientName', 'department', 'primaryDiagnosis']
        });
      }

      // dischargeDiagnosis can default to primaryDiagnosis if not provided
      const finalDischargeDiagnosis = dischargeDiagnosis && dischargeDiagnosis.trim() !== '' 
        ? dischargeDiagnosis 
        : (primaryDiagnosis || 'Not specified');

      // Create HospitalDischarge record
      const dischargeData = {
        patientId: patientId.toString(),
        patientName,
        admissionDate: req.body.admissionDate ? new Date(req.body.admissionDate) : new Date(),
        dischargeDate: dischargeDate ? new Date(dischargeDate) : new Date(),
        department,
        primaryDiagnosis,
        dischargeDiagnosis: finalDischargeDiagnosis,
        dischargeType: dischargeType || 'regular',
        dischargeDestination: dischargeDestination || 'home',
        dischargeInstructions: dischargeInstructions || '',
        medications: medications || '',
        followUpAppointment: followUpAppointment ? new Date(followUpAppointment) : undefined,
        followUpPhysician: followUpPhysician || '',
        homeCareNeeded: homeCareNeeded || false,
        homeCareDetails: homeCareDetails || '',
        transportationNeeded: transportationNeeded || false,
        transportationDetails: transportationDetails || '',
        dischargeSummary: dischargeSummary || '',
        notes: notes || '',
        hospital: hospitalId,
        createdBy: hospitalId,
        status: 'pending'
      };

      const newDischarge = await HospitalDischarge.create(dischargeData);
      
      // Format the response to match the expected format
      const formatted = {
        id: newDischarge._id.toString(),
        admissionId: newDischarge._id.toString(),
        patientId: newDischarge.patientId,
        patientName: newDischarge.patientName,
        avatar: initialsAvatar(newDischarge.patientName),
        admissionDate: newDischarge.admissionDate,
        dischargeDate: newDischarge.dischargeDate,
        department: newDischarge.department,
        primaryDiagnosis: newDischarge.primaryDiagnosis,
        dischargeDiagnosis: newDischarge.dischargeDiagnosis,
        dischargeType: newDischarge.dischargeType,
        dischargeDestination: newDischarge.dischargeDestination,
        dischargeInstructions: newDischarge.dischargeInstructions,
        medications: newDischarge.medications,
        followUpAppointment: newDischarge.followUpAppointment,
        followUpPhysician: newDischarge.followUpPhysician,
        homeCareNeeded: newDischarge.homeCareNeeded,
        homeCareDetails: newDischarge.homeCareDetails,
        transportationNeeded: newDischarge.transportationNeeded,
        transportationDetails: newDischarge.transportationDetails,
        dischargeSummary: newDischarge.dischargeSummary,
        notes: newDischarge.notes,
        status: newDischarge.status
      };

      return res.status(201).json({
        success: true,
        message: 'Discharge plan created successfully',
        discharge: formatted
      });
    }

    admission.dischargePlan = {
      ...(admission.dischargePlan || {}),
      dischargeDate: dischargeDate ? new Date(dischargeDate) : admission.dischargePlan?.dischargeDate || new Date(),
      dischargeType: dischargeType || admission.dischargePlan?.dischargeType || 'home',
      destination: dischargeDestination || admission.dischargePlan?.destination || dischargeType || 'home',
      homeCareInstructions: dischargeInstructions,
      medications,
      followUpAppointment: followUpAppointment ? new Date(followUpAppointment) : admission.dischargePlan?.followUpAppointment,
      followUpDoctor: followUpPhysician || admission.dischargePlan?.followUpDoctor,
      notes,
      status: 'pending'
    };

    if (department) {
      admission.department = department;
    }

    admission.status = 'ready-for-discharge';
    await admission.save();

    const formatted = formatDischarge(admission);

    res.status(201).json({
      success: true,
      message: 'Discharge plan created successfully',
      discharge: formatted
    });
  } catch (error) {
    console.error('Error creating discharge plan:', error);
    res.status(500).json({ message: 'Failed to create discharge plan' });
  }
};

export const approveHospitalDischarge = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { id } = req.params;

    // Try to find in PatientAdmission first
    let admission = await PatientAdmission.findOne({ _id: id, hospital: hospitalId })
      .populate('patient', 'firstName lastName patientId')
      .populate('admittingDoctor', 'firstName lastName specialization');

    // If not found, try HospitalDischarge
    let discharge = null;
    if (!admission) {
      discharge = await HospitalDischarge.findOne({ _id: id, hospital: hospitalId });
      
      if (!discharge) {
        return res.status(404).json({ message: 'Discharge plan not found' });
      }
      
      // Approve the HospitalDischarge
      if (discharge.status !== 'pending') {
        return res.status(400).json({ message: `Cannot approve discharge with status: ${discharge.status}` });
      }
      
      discharge.status = 'approved';
      discharge.approvedBy = hospitalId;
      discharge.approvedAt = new Date();
      await discharge.save();
      
      // Format response
      const formatted = {
        id: discharge._id.toString(),
        admissionId: discharge._id.toString(),
        patientId: discharge.patientId,
        patientName: discharge.patientName,
        avatar: initialsAvatar(discharge.patientName),
        admissionDate: discharge.admissionDate,
        dischargeDate: discharge.dischargeDate,
        department: discharge.department,
        primaryDiagnosis: discharge.primaryDiagnosis,
        dischargeDiagnosis: discharge.dischargeDiagnosis,
        dischargeType: discharge.dischargeType,
        dischargeDestination: discharge.dischargeDestination,
        dischargeInstructions: discharge.dischargeInstructions,
        medications: discharge.medications,
        followUpAppointment: discharge.followUpAppointment,
        followUpPhysician: discharge.followUpPhysician,
        homeCareNeeded: discharge.homeCareNeeded,
        homeCareDetails: discharge.homeCareDetails,
        transportationNeeded: discharge.transportationNeeded,
        transportationDetails: discharge.transportationDetails,
        dischargeSummary: discharge.dischargeSummary,
        notes: discharge.notes,
        status: discharge.status
      };
      
      return res.json({
        success: true,
        message: 'Discharge plan approved',
        discharge: formatted
      });
    }

    admission.dischargePlan = {
      ...(admission.dischargePlan || {}),
      status: 'approved',
      approvedBy: hospitalId,
      approvedAt: new Date()
    };
    admission.status = 'ready-for-discharge';

    await admission.save();

    res.json({
      success: true,
      message: 'Discharge plan approved',
      discharge: formatDischarge(admission)
    });
  } catch (error) {
    console.error('Error approving discharge plan:', error);
    res.status(500).json({ message: 'Failed to approve discharge plan' });
  }
};

export const completeHospitalDischarge = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { id } = req.params;

    // Try to find in PatientAdmission first
    let admission = await PatientAdmission.findOne({ _id: id, hospital: hospitalId })
      .populate('patient', 'firstName lastName patientId')
      .populate('admittingDoctor', 'firstName lastName specialization');

    // If not found, try HospitalDischarge
    let discharge = null;
    if (!admission) {
      discharge = await HospitalDischarge.findOne({ _id: id, hospital: hospitalId });
      
      if (!discharge) {
        return res.status(404).json({ message: 'Discharge plan not found' });
      }
      
      // Complete the HospitalDischarge
      if (discharge.status !== 'approved') {
        return res.status(400).json({ 
          message: `Cannot complete discharge with status: ${discharge.status}. Must be approved first.` 
        });
      }
      
      discharge.status = 'completed';
      discharge.completedBy = hospitalId;
      discharge.completedAt = new Date();
      await discharge.save();
      
      // Format response
      const formatted = {
        id: discharge._id.toString(),
        admissionId: discharge._id.toString(),
        patientId: discharge.patientId,
        patientName: discharge.patientName,
        avatar: initialsAvatar(discharge.patientName),
        admissionDate: discharge.admissionDate,
        dischargeDate: discharge.dischargeDate,
        department: discharge.department,
        primaryDiagnosis: discharge.primaryDiagnosis,
        dischargeDiagnosis: discharge.dischargeDiagnosis,
        dischargeType: discharge.dischargeType,
        dischargeDestination: discharge.dischargeDestination,
        dischargeInstructions: discharge.dischargeInstructions,
        medications: discharge.medications,
        followUpAppointment: discharge.followUpAppointment,
        followUpPhysician: discharge.followUpPhysician,
        homeCareNeeded: discharge.homeCareNeeded,
        homeCareDetails: discharge.homeCareDetails,
        transportationNeeded: discharge.transportationNeeded,
        transportationDetails: discharge.transportationDetails,
        dischargeSummary: discharge.dischargeSummary,
        notes: discharge.notes,
        status: discharge.status
      };
      
      return res.json({
        success: true,
        message: 'Discharge completed successfully',
        discharge: formatted
      });
    }

    admission.dischargePlan = {
      ...(admission.dischargePlan || {}),
      status: 'completed',
      completedAt: new Date()
    };
    admission.status = 'discharged';
    admission.actualDischargeDate = admission.dischargePlan.dischargeDate || new Date();

    await admission.save();

    res.json({
      success: true,
      message: 'Discharge completed',
      discharge: formatDischarge(admission)
    });
  } catch (error) {
    console.error('Error completing discharge plan:', error);
    res.status(500).json({ message: 'Failed to complete discharge plan' });
  }
};

// Patient Tracking
export const getHospitalPatientTracking = async (req, res) => {
  try {
    const hospitalId = req.user._id;

    const admissions = await PatientAdmission.find({ hospital: hospitalId })
      .populate('patient', 'firstName lastName patientId')
      .populate('admittingDoctor', 'firstName lastName specialization')
      .sort({ updatedAt: -1 });

    const patients = admissions.map(formatTrackingEntry);

    const stats = patients.reduce((acc, patient) => {
      acc.total += 1;
      acc[patient.status] = (acc[patient.status] || 0) + 1;
      return acc;
    }, { total: 0 });

    const locationStats = patients.reduce((acc, patient) => {
      const location = patient.currentLocation || 'ward';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      patients,
      stats,
      locationStats
    });
  } catch (error) {
    console.error('Error fetching patient tracking data:', error);
    res.status(500).json({ message: 'Failed to load patient tracking data' });
  }
};

export const updateHospitalPatientTracking = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { patientId } = req.params;
    const {
      patientName,
      currentLocation,
      department,
      roomNumber,
      bedNumber,
      status,
      assignedNurse,
      assignedDoctor,
      vitalSigns,
      notes
    } = req.body;

    let admission = await findAdmissionByPatientIdentifier(hospitalId, patientId);

    if (!admission && patientName) {
      admission = await PatientAdmission.findOne({
        hospital: hospitalId
      })
        .populate('patient', 'firstName lastName patientId')
        .populate('admittingDoctor', 'firstName lastName specialization');
    }

    if (!admission) {
      return res.status(404).json({ message: 'Patient not found for tracking update' });
    }

    admission.tracking = {
      ...(admission.tracking || {}),
      currentLocation: currentLocation || admission.tracking?.currentLocation || admission.department,
      department: department || admission.tracking?.department || admission.department,
      roomNumber: roomNumber || admission.tracking?.roomNumber || admission.room?.roomNumber,
      bedNumber: bedNumber || admission.tracking?.bedNumber || admission.bed?.bedNumber,
      status: status || admission.tracking?.status || mapAdmissionStatusToTracking(admission.status),
      assignedNurse: assignedNurse || admission.tracking?.assignedNurse,
      assignedDoctor: assignedDoctor || admission.tracking?.assignedDoctor,
      assignedDoctorName: assignedDoctor,
      vitalSigns: vitalSigns || admission.tracking?.vitalSigns,
      notes: notes || admission.tracking?.notes,
      lastSeen: new Date()
    };

    if (status) {
      switch (status) {
        case 'critical':
          admission.status = 'critical';
          break;
        case 'discharged':
          admission.status = 'discharged';
          admission.actualDischargeDate = new Date();
          break;
        case 'transferred':
          admission.status = 'transferred';
          break;
        case 'stable':
          admission.status = 'stable';
          break;
        default:
          admission.status = 'admitted';
      }
    }

    if (vitalSigns) {
      admission.vitalSigns.push({
        ...vitalSigns,
        timestamp: new Date(),
        recordedBy: req.user._id
      });
    }

    await admission.save();
    await admission.populate('patient', 'firstName lastName patientId');
    await admission.populate('admittingDoctor', 'firstName lastName specialization');

    res.json({
      success: true,
      message: 'Patient tracking updated successfully',
      patient: formatTrackingEntry(admission)
    });
  } catch (error) {
    console.error('Error updating patient tracking:', error);
    res.status(500).json({ message: 'Failed to update patient tracking' });
  }
};

