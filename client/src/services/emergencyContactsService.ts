import api from './api';

export interface EmergencyContactDTO {
  _id?: string;
  name: string;
  number: string;
  email?: string;
  type?: 'emergency' | 'doctor' | 'family' | 'hospital' | 'pharmacy' | 'insurance';
  relationship?: string;
  notes?: string;
  isFavorite?: boolean;
  isEmergency?: boolean;
  address?: string;
  specialty?: string;
  availability?: string;
  isPrimary?: boolean;
  lastContacted?: string;
}

export const emergencyContactsService = {
  async list() {
    return api.get('/patient/emergency-contacts');
  },
  async create(contact: EmergencyContactDTO) {
    // Backend expects phone field; ensure compatibility
    const payload: any = { ...contact };
    if (!payload.phone && contact.number) payload.phone = contact.number;
    return api.post('/patient/emergency-contacts', payload);
  },
  async update(contactId: string, updates: Partial<EmergencyContactDTO>) {
    const payload: any = { ...updates };
    if (!payload.phone && updates.number) payload.phone = updates.number;
    return api.put(`/patient/emergency-contacts/${contactId}`, payload);
  },
  async remove(contactId: string) {
    return api.delete(`/patient/emergency-contacts/${contactId}`);
  }
};

export default emergencyContactsService;


