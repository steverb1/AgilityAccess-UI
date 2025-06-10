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

      <div class="states-container">
        <label>States (drag to reorder)</label>
        <draggable
          v-model="stateFields"
          handle=".drag-handle"
          class="state-fields-list"
        >
          <div v-for="(state, index) in stateFields" :key="index" class="state-field-group">
            <span class="drag-handle">☰</span>
            <input
              v-model.lazy="state.value"
              type="text"
              class="form-control"
              :placeholder="index === 0 ? 'Ready for Build' : 'Enter state'"
              required
            >
            <button
              v-if="index === stateFields.length - 1"
              type="button"
              @click="addStateField"
              class="add-state-button"
            >
              +
            </button>
            <button
              v-if="index !== 0"
              type="button"
              @click="removeStateField(index)"
              class="remove-state-button"
            >
              ×
            </button>
          </div>
        </draggable>
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
import draggable from 'vuedraggable';

export default {
  name: 'StoryExtractForm',
  components: {
    draggable
  },
  data() {
    return {
      formData: {
        'v1.token': '',
        'v1.url': '',
        'v1.planningLevel': '',
        'v1.team': '',
        fromClosedDate: '',
        includeStoryPoints: 'true',
        includeTeamName: 'true'
      },
      stateFields: [
        { value: '' }
      ],
      status: {
        message: '',
        type: 'info' // 'success', 'error', or 'info'
      }
    };
  },
  methods: {
    addStateField() {
      this.stateFields.push({ value: '' });
    },
    removeStateField(index) {
      this.stateFields.splice(index, 1);
    },
    downloadToFile(content, filename, contentType) {
      const blob = new Blob([content], { type: contentType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },

    async handleSubmit() {
      try {
        this.status = { message: 'Submitting...', type: 'info' };

        // Combine state fields into comma-separated string
        const formDataToSend = {
          ...this.formData,
          states: this.stateFields
            .map(state => state.value.trim())
            .filter(state => state !== '')
            .join(',')
        };

        console.log('Sending data:', formDataToSend);
        const response = await storyService.extractStories(formDataToSend);

        const filename = `stories.csv`;
        this.downloadToFile(response.data, filename, 'text/csv');

        this.status = {
          message: `Stories extracted successfully! Downloading as ${filename}`,
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

.states-container {
  margin-bottom: 15px;
}

.state-fields-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.drag-handle {
  cursor: move;
  padding: 8px;
  color: #666;
  user-select: none;
}

.drag-handle:hover {
  color: #333;
}

.state-field-group {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
  background: white;
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ddd;
}
</style>
