import api from './api';

export interface ProfileCompletionStatus {
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
}

export interface ProfileData {
  bio?: string;
  languages?: string[];
  consultationFees?: {
    online: number;
    inPerson: number;
  };
  availability?: {
    workingDays: string[];
    startTime: string;
    endTime: string;
    appointmentDuration: number;
    lunchBreakStart: string;
    lunchBreakEnd: string;
  };
  location?: {
    city: string;
    state: string;
    pincode: string;
    address: string;
  };
  specialties?: string[];
  emergencyAvailable?: boolean;
  documents?: Array<{
    type: string;
    title: string;
    file: File;
  }>;
}

class DoctorProfileService {
  async getProfileCompletionStatus(): Promise<ProfileCompletionStatus> {
    const response = await api.get('/doctor/profile-completion');
    return response.data;
  }

  async completeProfile(profileData: ProfileData): Promise<{ message: string; user: any }> {
    const formData = new FormData();
    
    // Add profile data
    if (profileData.bio) formData.append('bio', profileData.bio);
    if (profileData.languages) formData.append('languages', JSON.stringify(profileData.languages));
    if (profileData.consultationFees) formData.append('consultationFees', JSON.stringify(profileData.consultationFees));
    if (profileData.availability) formData.append('availability', JSON.stringify(profileData.availability));
    if (profileData.location) formData.append('location', JSON.stringify(profileData.location));
    if (profileData.specialties) formData.append('specialties', JSON.stringify(profileData.specialties));
    if (profileData.emergencyAvailable !== undefined) formData.append('emergencyAvailable', profileData.emergencyAvailable.toString());

    // Add documents
    if (profileData.documents) {
      profileData.documents.forEach(doc => {
        formData.append(doc.type, doc.file);
      });
    }

    const response = await api.post('/doctor/complete-profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateProfile(profileData: Partial<ProfileData>): Promise<{ message: string; doctor: any }> {
    const response = await api.put('/doctor/settings', profileData);
    return response.data;
  }

  async getProfile(): Promise<any> {
    const response = await api.get('/doctor/settings');
    return response.data;
  }
}

export const doctorProfileService = new DoctorProfileService(); 