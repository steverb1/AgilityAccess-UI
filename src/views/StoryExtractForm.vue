<template>
  <div class="story-extract-form">
    <h2>Extract Stories</h2>

    <!-- Add status messages -->
    <div v-if="status.message" :class="['status-message', status.type]">
      {{ status.message }}
    </div>

    <div class="form-container">
      <div class="form-group">
        <label for="token">V1 Token</label>
        <input
          id="token"
          v-model.lazy="formData['v1.token']"
          type="password"
          class="form-control"
          placeholder="Enter your V1 token"
          required
        >
      </div>

      <div class="form-group">
        <label for="url">V1 URL</label>
        <input
          id="url"
          v-model.lazy="formData['v1.url']"
          type="url"
          class="form-control"
          placeholder="https://www16.v1host.com/api-examples"
          required
        >
      </div>

      <div class="form-group">
        <label for="planningLevel">Planning Level</label>
        <input
          id="planningLevel"
          v-model.lazy="formData['v1.planningLevel']"
          type="text"
          class="form-control"
          placeholder="Scope:1005"
          required
        >
      </div>

      <div class="form-group">
        <label for="team">Team</label>
        <input
          id="team"
          v-model.lazy="formData['v1.team']"
          type="text"
          class="form-control"
          placeholder="Team:1889"
          required
        >
      </div>

      <div class="form-group">
        <label for="fromClosedDate">From Closed Date</label>
        <input
          id="fromClosedDate"
          v-model.lazy="formData.fromClosedDate"
          type="date"
          class="form-control"
          required
        >
      </div>

      <div class="form-group">
        <label for="states">States (comma-separated)</label>
        <input
          id="states"
          v-model.lazy="formData.states"
          type="text"
          class="form-control"
          placeholder="Ready for Build, Build, Done"
          required
        >
      </div>

      <div class="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            :checked="formData.includeStoryPoints === 'true'"
            @change="e => formData.includeStoryPoints = e.target.checked ? 'true' : 'false'"
          >
          Include Story Points
        </label>
      </div>

      <div class="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            :checked="formData.includeTeamName === 'true'"
            @change="e => formData.includeTeamName = e.target.checked ? 'true' : 'false'"
          >
          Include Team Name
        </label>
      </div>

      <button type="button" @click.prevent="handleSubmit" class="submit-button">Extract Stories</button>
    </div>
  </div>
</template>

<script>
import { storyService } from '@/services/storyService';

export default {
  name: 'StoryExtractForm',
  data() {
    return {
      formData: {
        'v1.token': '',
        'v1.url': '',
        'v1.planningLevel': '',
        'v1.team': '',
        fromClosedDate: '',
        states: '',
        includeStoryPoints: 'true',
        includeTeamName: 'true'
      },
      status: {
        message: '',
        type: 'info' // 'success', 'error', or 'info'
      }
    };
  },
  methods: {
    async handleSubmit() {
      try {
        this.status = { message: 'Submitting...', type: 'info' };

        console.log('Sending data:', this.formData);
        const response = await storyService.extractStories(this.formData);
        this.status = {
          message: 'Stories extracted successfully!',
          type: 'success'
        };
        console.log('Success:', response.data);
      } catch (error) {
        console.error('Full error:', error);
        let errorMessage = 'Failed to extract stories';

        if (error.response) {
          console.error('Server response:', error.response);
          errorMessage = `Server Error (${error.response.status}): ${error.response.data?.message || error.response.statusText}`;
          if (error.response.data?.details) {
            errorMessage += `\nDetails: ${error.response.data.details}`;
          }
        } else if (error.request) {
          errorMessage = 'No response received from server';
        } else {
          errorMessage = error.message;
        }

        this.status = {
          message: errorMessage,
          type: 'error'
        };
      }
    }
  }
};
</script>

<style scoped>
.story-extract-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.submit-button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.submit-button:hover {
  background-color: #45a049;
}

.checkbox-group {
  display: flex;
  align-items: center;
}

.checkbox-group input[type="checkbox"] {
  margin-right: 8px;
}

.status-message {
  margin: 10px 0;
  padding: 10px;
  border-radius: 4px;
}

.success {
  background-color: #dff0d8;
  color: #3c763d;
  border: 1px solid #d6e9c6;
}

.error {
  background-color: #f2dede;
  color: #a94442;
  border: 1px solid #ebccd1;
}

.info {
  background-color: #d9edf7;
  color: #31708f;
  border: 1px solid #bce8f1;
}
</style>
