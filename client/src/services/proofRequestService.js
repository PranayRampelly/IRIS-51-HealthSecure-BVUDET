import axios from 'axios';

// Create axios instance with env-driven base URL; default to '/api' for dev proxy
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api'
});

// Always attach the freshest token prior to request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Map frontend form fields to backend controller expectations
export const createProofRequest = (data) => {
  const payload = {
    patientId: data.patientId,
    proofType: data.proofType || 'Custom',
    urgency: data.urgency,                // 'High' | 'Medium' | 'Low'
    reason: data.purpose || data.requestedProof,
    dueDate: data.expiresAt,              // ISO date string
    category: data.category,
    priority: data.priority,
    notes: data.customMessage,
    autoFollowUp: data.autoFollowUp,
    notifyPatient: data.notifyPatient
  };

  // Optional file upload support (keep multipart when file present)
  if (data.file) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    formData.append('file', data.file);
    return API.post('/proof-requests', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  return API.post('/proof-requests', payload);
};

export const getDoctorProofRequests = (params) => API.get('/proof-requests/doctor', { params });
export const cancelProofRequest = (id) => API.put(`/proof-requests/${id}/cancel`);