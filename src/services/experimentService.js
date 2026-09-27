import axios from 'axios';
import { handleApiError } from '../utils/errorHandler';

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/api/diagnostics`;

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('access_token')}`,
});

export const experimentService = {
  capabilities: async () => {
    const response = await axios.get(`${API_URL}/capabilities`, { headers: authHeaders() });
    return response.data;
  },

  analyze: async (file, models, segmentationEnabled, compareSegmentations = true) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('models', JSON.stringify(models));
    formData.append('segmentation_enabled', String(segmentationEnabled));
    formData.append('compare_segmentations', String(compareSegmentations));

    try {
      const response = await axios.post(`${API_URL}/analyze`, formData, {
        headers: authHeaders(),
      });
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(typeof error.response?.data?.detail === 'string' ? error.response.data.detail : apiError.message);
    }
  },

  explain: async (runId, configurations, methods) => {
    try {
      const response = await axios.post(`${API_URL}/explain`, {
        run_id: runId,
        configurations,
        methods,
      }, {
        headers: authHeaders(),
      });
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(typeof error.response?.data?.detail === 'string' ? error.response.data.detail : apiError.message);
    }
  },
};
