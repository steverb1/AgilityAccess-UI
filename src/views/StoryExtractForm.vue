<template>
  <div class="story-extract-form">
    <h2>Extract Stories</h2>

    <div v-if="status.message" :class="['status-message', status.type]">
      {{ status.message }}
    </div>

    <div class="form-container">
      <div class="form-group">
        <label for="url" class="required">V1 URL</label>
        <input
            id="url"
            v-model.lazy="formData['v1.url']"
            type="url"
            class="form-control"
            :class="{ 'is-invalid': urlError }"
            placeholder="https://www16.v1host.com/api-examples"
            @blur="validateUrl"
            required
        >
        <div v-if="urlError" class="invalid-feedback">
          {{ urlError }}
        </div>
      </div>

      <div class="form-group">
        <label for="token" class="required">V1 Token</label>
        <input
          id="token"
          v-model.lazy="formData['v1.token']"
          type="password"
          class="form-control"
          :class="{ 'is-invalid': tokenError }"
          placeholder="Enter your V1 token"
          @blur="validateToken"
          required
        >
        <div v-if="tokenError" class="invalid-feedback">
          {{ tokenError }}
        </div>
      </div>

      <div class="form-group" :class="{ 'is-invalid': scopeError }">
        <label class="required">Select Team(s)</label>
        <div class="scope-selection">
          <div class="radio-group">
            <input
              type="radio"
              id="planningLevel"
              name="scopeType"
              value="planningLevel"
              v-model="selectedScope"
            >
            <label for="planningLevel">Planning Level</label>
            <input
              v-if="selectedScope === 'planningLevel'"
              v-model.lazy="formData['v1.planningLevel']"
              type="text"
              class="form-control"
              placeholder="Scope:xxxx"
              @blur="validateScope"
            >
          </div>

          <div class="radio-group">
            <input
              type="radio"
              id="team"
              name="scopeType"
              value="team"
              v-model="selectedScope"
            >
            <label for="team">Single Team</label>
            <input
              v-if="selectedScope === 'team'"
              v-model.lazy="formData['v1.team']"
              type="text"
              class="form-control"
              placeholder="Team:xxxx"
              @blur="validateScope"
            >
          </div>
        </div>
        <div v-if="scopeError" class="invalid-feedback">
          {{ scopeError }}
        </div>
      </div>

      <div class="form-group">
        <label class="required">Work Item Type</label>
        <div class="radio-group">
          <input
            type="radio"
            id="story"
            name="workItemType"
            value="Story"
            v-model="formData.workItemType"
            checked
          >
          <label for="story">Story</label>

          <input
            type="radio"
            id="epic"
            name="workItemType"
            value="Epic"
            v-model="formData.workItemType"
          >
          <label for="epic">Epic</label>
        </div>
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
        <div class="states-header">
          <label class="required">States (drag to reorder)</label>
          <button
            type="button"
            @click="addStateField"
            class="add-state-button"
          >
            +
          </button>
        </div>
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
              :class="{ 'is-invalid': statesError && !state.value.trim() }"
              :placeholder="index === 0 ? 'Ready for Build' : index === 1 ? 'Done' : 'Enter state'"
              @blur="validateStates"
              required
            >
            <button
              v-if="canRemoveState && index >= 2"
              type="button"
              @click="removeStateField(index)"
              class="remove-state-button"
            >
              ×
            </button>
          </div>
        </draggable>
        <div v-if="statesError" class="invalid-feedback d-block">
          {{ statesError }}
        </div>
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
      selectedScope: 'planningLevel',
      formData: {
        'v1.token': '',
        'v1.url': '',
        'v1.planningLevel': '',
        'v1.team': '',
        workItemType: 'story',
        fromClosedDate: '',
        includeStoryPoints: 'true',
        includeTeamName: 'true'
      },
      stateFields: [
        { value: '' },
        { value: '' }
      ],
      status: {
        message: '',
        type: 'info'
      },
      urlError: '',
      tokenError: '',
      scopeError: '',
      statesError: ''
    };
  },
  computed: {
    canRemoveState() {
      return this.stateFields.length > 2;
    }
  },
  methods: {
    addStateField() {
      this.stateFields.push({ value: '' });
    },
    removeStateField(index) {
      if (this.canRemoveState) {
        this.stateFields.splice(index, 1);
      }
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
    validateUrl() {
      if (!this.formData['v1.url']) {
        this.urlError = 'V1 URL is required';
        return;
      }
      try {
        new URL(this.formData['v1.url']);
        this.urlError = '';
      } catch (e) {
        this.urlError = 'Invalid URL format';
      }
    },
    validateToken() {
      this.tokenError = this.formData['v1.token'].trim() === '' ? 'V1 Token is required' : '';
    },
    validateScope() {
      if (this.selectedScope === 'planningLevel' && !this.formData['v1.planningLevel'] ||
      this.selectedScope === 'team' && !this.formData['v1.team']) {
        this.scopeError = 'Team(s) selection is required';
      } else {
        this.scopeError = '';
      }
    },
    validateStates() {
      const filledStates = this.stateFields.filter(state => state.value.trim() !== '');
      if (filledStates.length < 2) {
        this.statesError = 'At least 2 states are required';
        return false;
      }
      this.statesError = '';
      return true;
    },

    async handleSubmit() {
      // Validate all fields
      this.validateUrl();
      this.validateToken();
      this.validateScope();
      this.validateStates();

      if (this.urlError || this.tokenError || this.scopeError || this.statesError) {
        this.status = {
          message: 'Required fields are missing or invalid',
          type: 'error'
        };
        return;
      }

      try {
        this.status = { message: 'Submitting...', type: 'info' };

        // Create a copy of formData without the unselected scope
        const formDataToSend = {
          ...this.formData,
          states: this.stateFields
            .map(state => state.value.trim())
            .filter(state => state !== '')
            .join(',')
        };

        // Remove the unselected scope field
        if (this.selectedScope === 'planningLevel') {
          delete formDataToSend['v1.team'];
        } else {
          delete formDataToSend['v1.planningLevel'];
        }

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

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

/* Add styling for required field asterisks */
.form-group > label.required::before {
  content: '* ';
  color: #a94442;
}

.form-group {
  margin-bottom: 15px;
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

.states-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.states-header label {
  margin-bottom: 0;
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

.scope-selection {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group.is-invalid .scope-selection {
  border-color: #a94442;
}

.radio-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.radio-group input[type="text"] {
  flex: 1;
}

.radio-group label {
  margin-bottom: 0;
  font-weight: normal;
}

.invalid-feedback {
  color: #a94442;
  font-size: 12px;
  margin-top: 5px;
}
</style>
