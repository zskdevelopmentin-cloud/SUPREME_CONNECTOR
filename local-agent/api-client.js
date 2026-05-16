const axios = require('axios');

class ApiClient {
  constructor(baseUrl, apiKey) {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async uploadData(type, data) {
    try {
      const response = await this.client.post(`/api/sync/${type}`, { data });
      return response.data;
    } catch (error) {
      console.error(`API Upload Error (${type}):`, error.response?.data || error.message);
      throw error;
    }
  }

  async logSync(connectorId, status, records, error = null) {
    try {
      await this.client.post('/api/sync/logs', {
        connectorId,
        status,
        recordsProcessed: records,
        errorMessage: error
      });
    } catch (err) {
      console.error('Failed to log sync status:', err.message);
    }
  }
}

module.exports = ApiClient;
