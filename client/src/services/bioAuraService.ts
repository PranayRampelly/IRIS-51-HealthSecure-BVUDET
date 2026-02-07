import apiService from '@/services/api';

const buildQuery = (params?: Record<string, string | number | boolean | undefined>) => {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

const bioAuraService = {
  async getDashboardOverview() {
    return apiService.get('/bioaura/overview');
  },

  async getHealthIndex(params?: { region?: string; timeRange?: string }) {
    const query = buildQuery(params);
    return apiService.get(`/bioaura/health-index${query}`);
  },

  async getMedicineDemandPatterns(filters?: { category?: string; region?: string; days?: number }) {
    const query = buildQuery(filters);
    return apiService.get(`/bioaura/demand-patterns${query}`);
  },

  async getPharmacyData(filters?: { region?: string; state?: string; limit?: number }) {
    const query = buildQuery(filters);
    return apiService.get(`/bioaura/pharmacy-network${query}`);
  },

  async getRegionalSalesTrends(filters?: { region?: string; days?: number }) {
    const query = buildQuery(filters);
    return apiService.get(`/bioaura/regional-sales${query}`);
  },

  async getRegionalStockAnalysis(filters?: { region?: string; category?: string }) {
    const query = buildQuery(filters);
    return apiService.get(`/bioaura/regional-stocks${query}`);
  },

  async getApiIntegrationStatus() {
    return apiService.get('/bioaura/api-integration');
  },

  // API Key Management
  async getApiKeys() {
    return apiService.get('/bioaura/api-keys');
  },

  async createApiKey(data: { name: string; permissions?: string[]; endpoints?: string[]; rateLimit?: number; expiresAt?: string }) {
    return apiService.post('/bioaura/api-keys', data);
  },

  async revokeApiKey(id: string) {
    return apiService.patch(`/bioaura/api-keys/${id}/revoke`);
  },

  async deleteApiKey(id: string) {
    return apiService.delete(`/bioaura/api-keys/${id}`);
  },

  // Webhook Management
  async getWebhooks() {
    return apiService.get('/bioaura/webhooks');
  },

  async createWebhook(data: { name: string; url: string; events?: string[]; headers?: Record<string, string> }) {
    return apiService.post('/bioaura/webhooks', data);
  },

  async testWebhook(id: string) {
    return apiService.post(`/bioaura/webhooks/${id}/test`);
  },

  async deleteWebhook(id: string) {
    return apiService.delete(`/bioaura/webhooks/${id}`);
  },

  // API Usage Statistics
  async getApiUsageStats(days?: number) {
    const query = days ? `?days=${days}` : '';
    return apiService.get(`/bioaura/api-usage${query}`);
  },

  // Environment Agent Methods
  async getAvailableRegions() {
    return apiService.get('/bioaura/environment/regions');
  },

  async getEnvironmentDashboard(params?: { region?: string; days?: number; forceRefresh?: boolean }) {
    const query = buildQuery({ ...params, forceRefresh: params?.forceRefresh });
    return apiService.get(`/bioaura/environment/dashboard${query}`);
  },

  async getAirQualityMonitoring(params?: { region?: string; days?: number; forceRefresh?: boolean }) {
    const query = buildQuery({ ...params, forceRefresh: params?.forceRefresh });
    return apiService.get(`/bioaura/environment/air-quality${query}`);
  },

  async getClimateAnalysis(params?: { region?: string; days?: number; forceRefresh?: boolean }) {
    const query = buildQuery({ ...params, forceRefresh: params?.forceRefresh });
    return apiService.get(`/bioaura/environment/climate${query}`);
  },

  async getPollutionTrends(params?: { region?: string; days?: number; forceRefresh?: boolean }) {
    const query = buildQuery({ ...params, forceRefresh: params?.forceRefresh });
    return apiService.get(`/bioaura/environment/pollution-trends${query}`);
  },

  async getRegionalEnvironmentMap(forceRefresh?: boolean) {
    const query = forceRefresh ? '?forceRefresh=true' : '';
    return apiService.get(`/bioaura/environment/regional-map${query}`);
  },

  async getEnvironmentAlerts(params?: { severity?: string; region?: string; forceRefresh?: boolean }) {
    const query = buildQuery({ ...params, forceRefresh: params?.forceRefresh });
    return apiService.get(`/bioaura/environment/alerts${query}`);
  },
};

export default bioAuraService;


