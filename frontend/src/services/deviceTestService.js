import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

const deviceTestService = {
  // Save test results
  saveResults: async (testData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/device-test/results`, testData);
      return response.data;
    } catch (error) {
      console.error('Error saving test results:', error);
      throw error;
    }
  },

  // Get latest test results
  getLatestTest: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/device-test/results/latest`);
      return response.data;
    } catch (error) {
      console.error('Error fetching latest test:', error);
      throw error;
    }
  },

  // Get test history
  getTestHistory: async (limit = 10) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/device-test/results/history`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching test history:', error);
      throw error;
    }
  },

  // Test network speed
  testNetworkSpeed: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/device-test/network-speed`);
      return response.data;
    } catch (error) {
      console.error('Error testing network speed:', error);
      throw error;
    }
  },

  // Save device settings
  saveSettings: async (settings) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/device-test/settings`, settings);
      return response.data;
    } catch (error) {
      console.error('Error saving device settings:', error);
      throw error;
    }
  },

  // Get device settings
  getSettings: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/device-test/settings`);
      return response.data;
    } catch (error) {
      console.error('Error fetching device settings:', error);
      throw error;
    }
  }
};

export default deviceTestService;