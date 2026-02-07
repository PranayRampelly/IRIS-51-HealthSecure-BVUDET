import api from './api';

export const emergencyServicesService = {
  async listHospitals(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params as any).toString();
    return api.get(`/patient/hospitals${query ? `?${query}` : ''}`);
  },
  async getHospitalDetails(hospitalId: string) {
    return api.get(`/patient/hospitals/${hospitalId}`);
  },

  async listAmbulances(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params as any).toString();
    return api.get(`/ambulance/services${query ? `?${query}` : ''}`);
  },
};

export default emergencyServicesService;


