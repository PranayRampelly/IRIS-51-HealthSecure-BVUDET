class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    this.requestQueue = new Map();
    this.retryDelay = 1000; // Start with 1 second
    this.maxRetryDelay = 30000; // Max 30 seconds
  }

  // Generic HTTP methods
  async get(url, config = {}) {
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders(),
        ...config.headers
      }
    });
    return this.handleResponse(response);
  }

  async post(url, data = null, config = {}) {
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        ...config.headers
      },
      body: data ? (data instanceof FormData ? data : JSON.stringify(data)) : undefined
    });
    return this.handleResponse(response);
  }

  async put(url, data = null, config = {}) {
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'PUT',
      headers: {
        ...this.getAuthHeaders(),
        ...config.headers
      },
      body: data ? (data instanceof FormData ? data : JSON.stringify(data)) : undefined
    });
    return this.handleResponse(response);
  }

  async delete(url, config = {}) {
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'DELETE',
      headers: {
        ...this.getAuthHeaders(),
        ...config.headers
      }
    });
    return this.handleResponse(response);
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 429) {
        // Get retry delay from header or use exponential backoff
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : this.retryDelay;
        
        // Increase retry delay for next attempt (exponential backoff)
        this.retryDelay = Math.min(this.retryDelay * 2, this.maxRetryDelay);
        
        throw new Error('Rate limit exceeded. Retrying after ' + delay/1000 + ' seconds');
      }
      
      // Reset retry delay for non-rate-limit errors
      this.retryDelay = 1000;
      throw new Error(data.message || 'API request failed');
    }
    
    // Reset retry delay on success
    this.retryDelay = 1000;
    return data;
  }

  // Debounce requests to prevent rate limiting
  async debouncedRequest(key, requestFn, delay = 1000) {
    if (this.requestQueue.has(key)) {
      clearTimeout(this.requestQueue.get(key));
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(async () => {
        try {
          const result = await requestFn();
          this.requestQueue.delete(key);
          resolve(result);
        } catch (error) {
          if (error.message.includes('Rate limit exceeded')) {
            // If rate limited, retry with exponential backoff
            const retryDelay = parseInt(error.message.match(/\d+/)[0]) * 1000;
            setTimeout(() => {
              this.debouncedRequest(key, requestFn, retryDelay)
                .then(resolve)
                .catch(reject);
            }, retryDelay);
          } else {
            this.requestQueue.delete(key);
            reject(error);
          }
        }
      }, delay);

      this.requestQueue.set(key, timeoutId);
    });
  }

  // Authentication endpoints
  async register(userData) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    return this.handleResponse(response);
  }

  async login(credentials) {
    // Clear any existing token first
    this.clearToken();
    
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    });
    return this.handleResponse(response);
  }

  async login2FA(credentials) {
    const response = await fetch(`${this.baseURL}/auth/2fa/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    });
    return this.handleResponse(response);
  }

  async logout() {
    const response = await fetch(`${this.baseURL}/auth/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    this.removeToken();
    return this.handleResponse(response);
  }

  async getCurrentUser() {
    const response = await fetch(`${this.baseURL}/auth/me`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async updateProfile(profileData) {
    const response = await fetch(`${this.baseURL}/auth/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    return this.handleResponse(response);
  }

  // Health Records endpoints (Patient only)
  async getHealthRecords(params = {}) {
    const queryString = Object.entries(params)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    const url = `${this.baseURL}/health-records${queryString ? `?${queryString}` : ''}`;
    
    // If export is true, handle as file download
    if (params.export) {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
          'Accept': 'text/csv'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Return the blob directly
      const blob = await response.blob();
      return { blob };
    }

    // Regular JSON response
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async createHealthRecord(formData) {
    const response = await fetch(`${this.baseURL}/health-records`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: formData // For file uploads
    });
    return this.handleResponse(response);
  }

  async getHealthRecord(id) {
    const response = await fetch(`${this.baseURL}/health-records/${id}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async updateHealthRecord(id, recordData) {
    const response = await fetch(`${this.baseURL}/health-records/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(recordData)
    });
    return this.handleResponse(response);
  }

  async deleteHealthRecord(id) {
    const response = await fetch(`${this.baseURL}/health-records/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getHealthRecordStats() {
    return this.debouncedRequest(
      'health-records-stats',
      async () => {
        const response = await fetch(`${this.baseURL}/health-records/stats`, {
          headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
      }
    );
  }

  async exportHealthRecords(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/health-records/export?${queryString}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async shareHealthRecord(recordId, shareData) {
    const response = await fetch(`${this.baseURL}/health-records/${recordId}/share`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(shareData)
    });
    return this.handleResponse(response);
  }

  // Proofs endpoints (Patient only)
  async getProofs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/proofs?${queryString}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async createProof(proofData) {
    const response = await fetch(`${this.baseURL}/proofs`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(proofData)
    });
    return this.handleResponse(response);
  }

  async verifyProof(signature) {
    const response = await fetch(`${this.baseURL}/proofs/verify/${signature}`);
    return this.handleResponse(response);
  }

  async setProofExpiry(proofId, data) {
    const response = await fetch(`${this.baseURL}/proofs/${proofId}/set-expiry`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  }

  async getProofStats() {
    const response = await fetch(`${this.baseURL}/proofs/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  // Proof Requests endpoints
  async getProofRequests(type = 'patient') {
    const response = await fetch(`${this.baseURL}/proof-requests/${type}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async createProofRequest(requestData) {
    const response = await fetch(`${this.baseURL}/proof-requests`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestData)
    });
    return this.handleResponse(response);
  }

  async approveProofRequest(id, proofId) {
    const response = await fetch(`${this.baseURL}/proof-requests/${id}/approve`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ proofId })
    });
    return this.handleResponse(response);
  }

  async denyProofRequest(id, denialReason) {
    const response = await fetch(`${this.baseURL}/proof-requests/${id}/deny`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ denialReason })
    });
    return this.handleResponse(response);
  }

  // Doctor endpoints
  async getPatients(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/doctor/patients?${queryString}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getPatientDetail(id) {
    const response = await fetch(`${this.baseURL}/doctor/patients/${id}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async uploadPrescription(formData) {
    const response = await fetch(`${this.baseURL}/doctor/prescriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    return this.handleResponse(response);
  }

  async getDoctorDashboard() {
    const response = await fetch(`${this.baseURL}/doctor/dashboard`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  // Access Logs endpoints
  async getAccessLogs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.debouncedRequest(
      'access-logs-' + queryString,
      async () => {
        const response = await fetch(`${this.baseURL}/access-logs?${queryString}`, {
          headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
      }
    );
  }

  async getAccessLogStats(days = 7) {
    const response = await fetch(`${this.baseURL}/access-logs/stats?days=${days}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async exportAccessLogs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/access-logs/export?${queryString}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async deleteAccessLogs(logIds) {
    const response = await fetch(`${this.baseURL}/access-logs/bulk-delete`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ logIds })
    });
    return this.handleResponse(response);
  }

  // --- Account Settings Advanced Methods ---

  // Security-related methods
  async setup2FA() {
    const response = await fetch(`${this.baseURL}/auth/2fa/setup`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async verify2FA(code) {
    const response = await fetch(`${this.baseURL}/auth/2fa/verify`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ code })
    });
    return this.handleResponse(response);
  }

  async getSessions() {
    const response = await fetch(`${this.baseURL}/auth/sessions`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async revokeSession(sessionId) {
    const response = await fetch(`${this.baseURL}/auth/sessions/revoke`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ sessionId })
    });
    return this.handleResponse(response);
  }

  async logoutAll() {
    const response = await fetch(`${this.baseURL}/auth/logout-all`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    this.removeToken();
    return this.handleResponse(response);
  }

  async changePassword(currentPassword, newPassword) {
    const response = await fetch(`${this.baseURL}/auth/change-password`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return this.handleResponse(response);
  }

  // Download Health Data
  async downloadHealthData(format = 'zip') {
    const response = await fetch(`${this.baseURL}/health-records/export?format=${format}`, {
      headers: this.getAuthHeaders(),
    });
    return response;
  }

  // Download Access Logs
  async downloadAccessLogs(format = 'json') {
    const response = await fetch(`${this.baseURL}/access-logs/export?format=${format}`, {
      headers: this.getAuthHeaders(),
    });
    return response;
  }

  // Delete Account
  async deleteAccount() {
    const response = await fetch(`${this.baseURL}/auth/delete`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    this.removeToken();
    return this.handleResponse(response);
  }

  // Get Backup Codes (after 2FA enabled)
  async getBackupCodes() {
    const response = await fetch(`${this.baseURL}/auth/backup-codes`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Utility methods
  setToken(token) {
    localStorage.setItem('token', token);
    
    // Also update the token in user data if it exists
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        user.token = token;
        localStorage.setItem('user', JSON.stringify(user));
      } catch (error) {
        console.error('Failed to update token in user data:', error);
      }
    }
  }

  getToken() {
    // First try to get token from localStorage directly
    let token = localStorage.getItem('token');
    
    // If not found, try to get it from user data stored by AuthContext
    if (!token) {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          token = user.token;
        } catch (error) {
          console.error('Failed to parse user data:', error);
        }
      }
    }
    
    return token;
  }

  removeToken() {
    localStorage.removeItem('token');
    
    // Also remove token from user data if it exists
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        delete user.token;
        localStorage.setItem('user', JSON.stringify(user));
      } catch (error) {
        console.error('Failed to remove token from user data:', error);
      }
    }
  }

  clearToken() {
    localStorage.removeItem('token');
    
    // Also remove token from user data if it exists
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        delete user.token;
        localStorage.setItem('user', JSON.stringify(user));
      } catch (error) {
        console.error('Failed to clear token from user data:', error);
      }
    }
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  async requestAccess(proofId, reason) {
    const response = await fetch(`${this.baseURL}/proofs/${proofId}/request-access`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ reason })
    });
    return this.handleResponse(response);
  }
  async approveAccess(requestId) {
    const response = await fetch(`${this.baseURL}/proofs/access-request/${requestId}/approve`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }
  async denyAccess(requestId) {
    const response = await fetch(`${this.baseURL}/proofs/access-request/${requestId}/deny`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }
  async listAccessRequests(proofId) {
    const response = await fetch(`${this.baseURL}/proofs/${proofId}/access-requests`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async downloadWatermarkedProof(proofId) {
    const response = await fetch(`${this.baseURL}/proofs/${proofId}/download-watermarked`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to download watermarked proof');
    return await response.blob();
  }

  async downloadProof(proofId) {
    const response = await fetch(`${this.baseURL}/proofs/${proofId}/download`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to download proof');
    return await response.blob();
  }

  // Insurance Claims endpoints
  async getInsuranceClaims(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/insurance/claims?${queryString}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getInsuranceClaim(id) {
    const response = await fetch(`${this.baseURL}/insurance/claims/${id}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async createInsuranceClaim(claimData) {
    const response = await fetch(`${this.baseURL}/insurance/claims`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(claimData)
    });
    return this.handleResponse(response);
  }

  async updateInsuranceClaimStatus(id, statusData) {
    const response = await fetch(`${this.baseURL}/insurance/claims/${id}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(statusData)
    });
    return this.handleResponse(response);
  }

  async updateInsuranceClaim(claimId, updateData) {
    const response = await fetch(`${this.baseURL}/insurance/claims/${claimId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updateData)
    });
    return this.handleResponse(response);
  }

  async uploadInsuranceClaimDocument(claimId, formData) {
    const response = await fetch(`${this.baseURL}/insurance/claims/${claimId}/documents`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      },
      body: formData
    });
    return this.handleResponse(response);
  }

  async submitInsuranceClaim(claimId, claimData) {
    const response = await fetch(`${this.baseURL}/insurance/claims/${claimId}/submit`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: claimData ? JSON.stringify(claimData) : undefined
    });
    return this.handleResponse(response);
  }

  async uploadClaimDocuments(claimId, formData) {
    const response = await fetch(`${this.baseURL}/insurance/claims/${claimId}/documents`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      },
      body: formData
    });
    return this.handleResponse(response);
  }

  async deleteInsuranceClaimDocument(claimId, documentId) {
    const response = await fetch(`${this.baseURL}/insurance/claims/${claimId}/documents/${documentId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async removeClaimDocument(claimId, documentId) {
    const response = await fetch(`${this.baseURL}/insurance/claims/${claimId}/documents/${documentId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getInsuranceClaimStatistics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/insurance/claims/stats?${queryString}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async assignInsuranceClaim(claimId, assignedTo) {
    const response = await fetch(`${this.baseURL}/insurance/claims/${claimId}/assign`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ assignedTo })
    });
    return this.handleResponse(response);
  }

  async getInsuranceUsers() {
    const response = await fetch(`${this.baseURL}/auth/users?role=insurance`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getUserInsuranceClaims(params = {}) {
    const queryString = Object.entries(params)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    const url = `${this.baseURL}/insurance/claims${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getPatientInsuranceClaims(params = {}) {
    const queryString = Object.entries(params)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    const url = `${this.baseURL}/patient/insurance-claims${queryString ? `?${queryString}` : ''}`;
    console.log('🔍 Making request to:', url);
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    console.log('🔍 Response status:', response.status);
    const result = await this.handleResponse(response);
    console.log('🔍 API response result:', result);
    return result;
  }

  async getPatientInsuranceClaimExport(claimId) {
    const url = `${this.baseURL}/patient/insurance-claims/${claimId}/export`;
    console.log('🔍 Making export request to:', url);
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    console.log('🔍 Export response status:', response.status);
    const result = await this.handleResponse(response);
    console.log('🔍 Export API response result:', result);
    return result;
  }

  async getPatientAnalytics() {
    const url = `${this.baseURL}/patient/analytics`;
    console.log('🔍 Making analytics request to:', url);
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    console.log('🔍 Analytics response status:', response.status);
    const result = await this.handleResponse(response);
    console.log('🔍 Analytics API response result:', result);
    return result;
  }

  async getInsuranceClaimStats(year) {
    const url = `${this.baseURL}/insurance/claims/stats${year ? `?year=${year}` : ''}`;
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async deleteInsuranceClaim(claimId) {
    const response = await fetch(`${this.baseURL}/insurance/claims/${claimId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async trackInsuranceClaim(trackingNumber) {
    const response = await fetch(`${this.baseURL}/insurance/claims/track/${trackingNumber}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async exportInsuranceClaim(claimId) {
    const response = await fetch(`${this.baseURL}/insurance/claims/${claimId}/export`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  // Health Coach endpoints
  async getAvailableSymptoms() {
    const response = await fetch(`${this.baseURL}/health-coach/symptoms`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async createHealthAssessment(assessmentData) {
    const response = await fetch(`${this.baseURL}/health-coach/assessment`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(assessmentData)
    });
    return this.handleResponse(response);
  }

  async getHealthAssessment(id) {
    const response = await fetch(`${this.baseURL}/health-coach/assessment/${id}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getUserHealthAssessments(page = 1, limit = 10) {
    const response = await fetch(`${this.baseURL}/health-coach/assessments?page=${page}&limit=${limit}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async updateHealthAssessment(id, updateData) {
    const response = await fetch(`${this.baseURL}/health-coach/assessment/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updateData)
    });
    return this.handleResponse(response);
  }

  async deleteHealthAssessment(id) {
    const response = await fetch(`${this.baseURL}/health-coach/assessment/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getHealthAssessmentStats() {
    const response = await fetch(`${this.baseURL}/health-coach/stats`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }
}

export default new ApiService(); 