import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api'
});

// Add request interceptor to dynamically add auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper function to get auth headers (kept for backward compatibility)
const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

class ProofService {
  async getProofs(filters = {}) {
    try {
      const response = await API.get('/proofs', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching proofs:', error);
      throw error;
    }
  }

  async getProofById(proofId) {
    try {
      const response = await API.get(`/proofs/${proofId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching proof by ID:', error);
      throw error;
    }
  }

  async createProof(proofData) {
    try {
      const response = await API.post('/proofs', proofData);
      return response.data;
    } catch (error) {
      console.error('Error creating proof:', error);
      throw error;
    }
  }

  async updateProof(proofId, updateData) {
    try {
      const response = await API.put(`/proofs/${proofId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating proof:', error);
      throw error;
    }
  }

  async revokeProof(proofId) {
    try {
      const response = await API.patch(`/proofs/${proofId}/revoke`);
      return response.data;
    } catch (error) {
      console.error('Error revoking proof:', error);
      throw error;
    }
  }

  async verifyProof(signature) {
    try {
      const response = await API.post('/proofs/verify', { signature });
      return response.data;
    } catch (error) {
      console.error('Error verifying proof:', error);
      throw error;
    }
  }

  async getProofStats() {
    try {
      const response = await API.get('/proofs/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching proof stats:', error);
      throw error;
    }
  }

  async downloadProof(proofId) {
    try {
      const response = await API.get(`/proofs/${proofId}/download`, {
        responseType: 'blob',
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading proof:', error);
      throw error;
    }
  }

  async shareProof(proofId, recipientEmail, message = '') {
    try {
      const response = await API.post(`/proofs/${proofId}/share`, {
        recipientEmail,
        message
      });
      return response.data;
    } catch (error) {
      console.error('Error sharing proof:', error);
      throw error;
    }
  }

  async setProofExpiry(proofId, data) {
    try {
      const response = await API.patch(`/proofs/${proofId}/expiry`, data);
      return response.data;
    } catch (error) {
      console.error('Error setting proof expiry:', error);
      throw error;
    }
  }

  async requestAccess(proofId, reason = '') {
    try {
      const response = await API.post(`/proofs/${proofId}/access-request`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error requesting access:', error);
      throw error;
    }
  }

  async approveAccess(requestId) {
    try {
      const response = await API.patch(`/proofs/access-requests/${requestId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving access:', error);
      throw error;
    }
  }

  async denyAccess(requestId) {
    try {
      const response = await API.patch(`/proofs/access-requests/${requestId}/deny`);
      return response.data;
    } catch (error) {
      console.error('Error denying access:', error);
      throw error;
    }
  }

  async listAccessRequests(proofId) {
    try {
      const response = await API.get(`/proofs/${proofId}/access-requests`);
      return response.data;
    } catch (error) {
      console.error('Error listing access requests:', error);
      throw error;
    }
  }

  async downloadWatermarkedProof(proofId) {
    try {
      const response = await API.get(`/proofs/${proofId}/download-watermarked`, {
        responseType: 'blob',
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading watermarked proof:', error);
      throw error;
    }
  }

  // Additional utility methods
  async getProofTemplates() {
    try {
      const response = await API.get('/proof-templates');
      return response.data;
    } catch (error) {
      console.error('Error fetching proof templates:', error);
      throw error;
    }
  }

  async createProofFromTemplate(templateId, data) {
    try {
      const response = await API.post(`/proof-templates/${templateId}/create-proof`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating proof from template:', error);
      throw error;
    }
  }

  async validateProof(proofId) {
    try {
      const response = await API.post(`/proofs/${proofId}/validate`);
      return response.data;
    } catch (error) {
      console.error('Error validating proof:', error);
      throw error;
    }
  }

  async getProofHistory(proofId) {
    try {
      const response = await API.get(`/proofs/${proofId}/history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching proof history:', error);
      throw error;
    }
  }

  async exportProofs(format = 'json', filters = {}) {
    try {
      const response = await API.get('/proofs/export', {
        params: { format, ...filters },
        responseType: 'blob',
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting proofs:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const proofService = new ProofService();
export default proofService;
