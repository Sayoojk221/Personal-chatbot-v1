/**
 * LLM Services Entry Point
 * Exports all LLM-related services and utilities
 */

export { ollamaClient } from './ollamaClient.js';
export { OLLAMA_CONFIG, MODEL_CONFIGS, getOllamaConfig, validateConfig } from './config.js';

// Main LLM service interface
import { ollamaClient } from './ollamaClient.js';
import { MODEL_CONFIGS } from './config.js';

/**
 * High-level LLM service that provides a unified interface
 * for different LLM operations
 */
export class LLMService {
  constructor() {
    this.client = ollamaClient;
    this.currentModel = null;
  }

  /**
   * Initialize the LLM service
   */
  async initialize(modelName = null) {
    try {
      // Test connection first
      const connectionTest = await this.client.testConnection();
      if (!connectionTest.success) {
        throw new Error(connectionTest.message);
      }

      // Set up default model
      if (modelName) {
        await this.setModel(modelName);
      }

      return {
        success: true,
        message: 'LLM service initialized successfully',
        availableModels: connectionTest.models
      };
    } catch (error) {
      console.error('Failed to initialize LLM service:', error);
      throw error;
    }
  }

  /**
   * Set the current model to use
   */
  async setModel(modelName) {
    try {
      const isAvailable = await this.client.isModelAvailable(modelName);
      
      if (!isAvailable) {
        // Try to pull the model
        const pullResult = await this.client.pullModel(modelName);
        
        if (!pullResult.success) {
          throw new Error(`Failed to pull model ${modelName}: ${pullResult.error}`);
        }
      }

      this.currentModel = modelName;
      return { success: true, model: modelName };
    } catch (error) {
      console.error('Error setting model:', error);
      throw error;
    }
  }

  /**
   * Send a chat message and get response
   */
  async sendMessage(messages, options = {}) {
    try {
      if (!Array.isArray(messages)) {
        messages = [{ role: 'user', content: messages }];
      }

      const response = await this.client.generateChatCompletion(messages, {
        model: this.currentModel,
        ...options
      });

      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Get available models
   */
  async getModels() {
    return await this.client.getAvailableModels();
  }

  /**
   * Get model configurations
   */
  getModelConfigs() {
    return MODEL_CONFIGS;
  }

  /**
   * Check service health
   */
  async healthCheck() {
    return await this.client.testConnection();
  }
}

// Create and export singleton instance
export const llmService = new LLMService();
export default llmService;
