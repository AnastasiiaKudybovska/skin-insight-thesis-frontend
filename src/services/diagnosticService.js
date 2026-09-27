import axios from 'axios';
import { handleApiError } from '../utils/errorHandler';
import { experimentService } from './experimentService';

const API_URL = process.env.REACT_APP_API_BASE_URL;

export const diagnosticService = {
  classifyImage: async (imageFile, token = null) => {
    if (token === null) token = localStorage.getItem('access_token');
    if (token) {
      const analysis = await experimentService.analyze(imageFile, ['swin'], true, false);
      const result = analysis.results?.find((item) => item.model_id === 'swin');
      if (!result) throw new Error('Swin result is missing');
      return { ...result, run_id: analysis.run_id, demo: analysis.demo, history_id: null, image_id: null };
    }

    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.post(`${API_URL}/api/classify/`, formData, {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getXAIExplanation: async (method, imageFile, historyId, runId = null, analysisResults = null, token = null) => {
    if (token === null) token = localStorage.getItem('access_token');
    if (token && runId) {
      const response = await experimentService.explain(runId, ['swin:deeplabv3plus'], [method]);
      const item = response.explanations?.find((value) => value.model_id === 'swin' && value.method === method);
      if (!item) throw new Error('Swin explanation is missing');
      return {
        predicted_class: analysisResults?.predicted_class,
        predicted_probs: Object.values(analysisResults?.probabilities || {}),
        demo: response.demo,
        explanations: {
          history_id: null,
          explanations: [{
            method,
            overlay_image_id: `data:image/png;base64,${item.overlay_image}`,
            heatmap_image_id: `data:image/png;base64,${item.heatmap_image}`,
          }],
        },
      };
    }

    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      if (historyId !== null && historyId !== undefined) {
        formData.append('history_id', historyId.toString());
      } 
      
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.post(`${API_URL}/api/xai/${method}`, formData, {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
};
