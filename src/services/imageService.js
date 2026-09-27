import axios from 'axios';

const API_URL = process.env.REACT_APP_API_BASE_URL;

export const ImageService = {
  getImage: async (imageId, isAuthenticated) => {
    if (!imageId) return null;
    if (imageId.startsWith('data:')) return imageId;
    if (isAuthenticated) {
      try {
        const response = await axios.get(`${API_URL}/api/xai/images/${imageId}`, {
          responseType: 'blob'
        });
        return URL.createObjectURL(response.data);
      } catch (error) {
        console.error('Error loading image:', error);
        return null;
      }
    } else {

        return `data:image/png;base64,${imageId}`;
    }
  },

  revokeImageUrl: (url) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }
};
