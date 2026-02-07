import api from '@/lib/api';

export interface HospitalPatientRecord {
  id: string;
  patientId: string;
  patientName: string;
  recordType: string;
  department: string;
  physician: string;
  date: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string;
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
    oxygenSaturation?: string;
    weight?: string;
  };
  labResults?: string;
  imagingResults?: string;
  notes?: string;
  status?: string;
}

export interface HospitalDischarge {
  id: string;
  admissionId: string;
  patientId?: string;
  patientName: string;
  avatar?: string;
  admissionDate?: string;
  dischargeDate?: string;
  department: string;
  primaryDiagnosis?: string;
  dischargeDiagnosis?: string;
  dischargeType?: string;
  dischargeDestination?: string;
  dischargeInstructions?: string;
  medications?: Array<Record<string, string>> | string;
  followUpAppointment?: string;
  followUpPhysician?: string;
  dischargeSummary?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'discharged' | 'completed';
}

export interface PatientTrackingEntry {
  patientId: string;
  patientName: string;
  avatar?: string;
  patientExternalId?: string;
  currentLocation: string;
  department: string;
  roomNumber?: string;
  bedNumber?: string;
  status: 'active' | 'critical' | 'stable' | 'transferred' | 'discharged';
  lastSeen?: string;
  assignedNurse?: string;
  assignedDoctor?: string;
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
    oxygenSaturation?: string;
  };
  notes?: string;
  alerts?: Array<{
    type: string;
    message: string;
    timestamp: string;
  }>;
}

class HospitalCareService {
  async getPatientRecords(params?: Record<string, string>) {
    const response = await api.get('/hospital/patient-records', { params });
    return response.data as {
      success: boolean;
      records: HospitalPatientRecord[];
      stats?: any;
    };
  }

  async createPatientRecord(payload: Partial<HospitalPatientRecord>) {
    const response = await api.post('/hospital/patient-records', payload);
    return response.data as {
      success: boolean;
      message: string;
      record: HospitalPatientRecord;
    };
  }

  async getDischarges(params?: Record<string, string>) {
    const response = await api.get('/hospital/discharges', { params });
    return response.data as {
      success: boolean;
      discharges: HospitalDischarge[];
      stats?: Record<string, number>;
      today?: HospitalDischarge[];
    };
  }

  async createDischargePlan(payload: Partial<HospitalDischarge>) {
    const response = await api.post('/hospital/discharges', payload);
    return response.data as {
      success: boolean;
      discharge: HospitalDischarge;
      message: string;
    };
  }

  async approveDischarge(dischargeId: string) {
    const response = await api.put(`/hospital/discharges/${dischargeId}/approve`);
    return response.data as {
      success: boolean;
      discharge: HospitalDischarge;
      message: string;
    };
  }

  async completeDischarge(dischargeId: string) {
    const response = await api.put(`/hospital/discharges/${dischargeId}/complete`);
    return response.data as {
      success: boolean;
      discharge: HospitalDischarge;
      message: string;
    };
  }

  async getPatientTracking(params?: Record<string, string>) {
    const response = await api.get('/hospital/patient-tracking', { params });
    return response.data as {
      success: boolean;
      patients: PatientTrackingEntry[];
      stats?: Record<string, number>;
      locationStats?: Record<string, number>;
    };
  }

  async updatePatientTracking(patientId: string, payload: Partial<PatientTrackingEntry>) {
    const response = await api.put(`/hospital/patient-tracking/${patientId}`, payload);
    return response.data as {
      success: boolean;
      patient: PatientTrackingEntry;
      message: string;
    };
  }
}

export default new HospitalCareService();

