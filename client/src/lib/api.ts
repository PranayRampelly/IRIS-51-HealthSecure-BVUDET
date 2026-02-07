import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

class ApiService {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        console.log('[API] JWT token:', token);
        console.log('[API] Request URL:', config.url);
        console.log('[API] Full URL:', `${config.baseURL}${config.url}`);
        // Temporarily disable authentication requirement for testing
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        console.log('[API] Response interceptor - Original response:', response);
        console.log('[API] Response data:', response.data);
        return response;
      },
      async (error) => {
        console.log('[API] Error in response interceptor:', error);
        console.log('[API] Error message:', error.message);
        console.log('[API] Error response:', error.response);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // HTTP methods that match the fetch API style used in services
  async get(url: string, config?: AxiosRequestConfig) {
    return this.instance.get(url, config);
  }

  async post(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.instance.post(url, data, config);
  }

  async put(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.instance.put(url, data, config);
  }

  async delete(url: string, config?: AxiosRequestConfig) {
    return this.instance.delete(url, config);
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Also export the class for TypeScript services that need to extend it
export { ApiService };

export const getWebAuthnRegistrationOptions = async () => {
  return apiService.post('/api/auth/webauthn/register/options');
};

export const verifyWebAuthnRegistration = async (attestationResponse: unknown) => {
  // attestationResponse should match the WebAuthn attestation response type
  return apiService.post('/api/auth/webauthn/register/verify', attestationResponse);
}; 