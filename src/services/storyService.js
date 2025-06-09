import apiClient from './api';

export const storyService = {
  extractStories(data) {
    return apiClient.post('/api/stories/extract', data);
  }
};

export default storyService;
