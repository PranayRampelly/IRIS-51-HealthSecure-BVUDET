import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const getTemplates = () => API.get('/proof-templates');
export const createTemplate = (data) => API.post('/proof-templates', data);
export const updateTemplate = (id, data) => API.put(`/proof-templates/${id}`, data);
export const deleteTemplate = (id) => API.delete(`/proof-templates/${id}`); 