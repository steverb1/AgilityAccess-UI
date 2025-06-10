import apiClient from './api';

export const storyService = {
  extractStories(data) {
    console.log('Data being sent to API:', data);
    return apiClient.post('/api/stories/extract', data);
  }
};
