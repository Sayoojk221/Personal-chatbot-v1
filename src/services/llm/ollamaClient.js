/**
 * Ollama API Client
 * Handles communication with Ollama server for LLM operations
 */

import { getOllamaConfig, MODEL_CONFIGS } from './config.js';

class OllamaClient {
  constructor() {
    this.config = getOllamaConfig();
  }

  /**
   * Test connection to Ollama server
   */
  async testConnection() {
    try {
      const response = await fetch(`${this.config.baseURL}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout for connection test
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        models: data.models || [],
        message: 'Connected to Ollama successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to connect to Ollama server'
      };
    }
  }

  /**
   * Get available models from Ollama
   */
  async getAvailableModels() {
    try {
      const response = await fetch(`${this.config.baseURL}/api/tags`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }

      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Error fetching models:', error);
      throw new Error('Failed to fetch available models');
    }
  }

  /**
   * Check if a specific model is available
   */
  async isModelAvailable(modelName) {
    try {
      const models = await this.getAvailableModels();
      return models.some(model => model.name === modelName);
    } catch (error) {
      console.error('Error checking model availability:', error);
      return false;
    }
  }

  /**
   * Pull a model if it's not available
   */
  async pullModel(modelName, onProgress = null) {
    try {
      const response = await fetch(`${this.config.baseURL}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: modelName })
      });

      if (!response.ok) {
        throw new Error(`Failed to pull model: ${response.status}`);
      }

      // Handle streaming response for progress updates
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (onProgress) {
              onProgress(data);
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }

      return { success: true, message: `Model ${modelName} pulled successfully` };
    } catch (error) {
      console.error('Error pulling model:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate chat completion using Ollama
   */
  async generateChatCompletion(messages, options = {}) {
    try {
      const modelName = options.model || this.config.defaultModel;
      const modelConfig = MODEL_CONFIGS[modelName] || {};
      
      // Ensure model is available
      const isAvailable = await this.isModelAvailable(modelName);
      if (!isAvailable) {
        throw new Error(`Model ${modelName} is not available. Please pull it first.`);
      }

      // Add system message for thinking process if not present
      const systemMessage = {
        role: 'system',
        content: `You are a helpful AI assistant who helps the user with their questions.
        User can ask you anything and you will respond with a helpful answer. When responding, you must thoroughly think through the answer and provide a detailed response.
        The first you can thinking about the answer with a detailed manner, once you have the answer, you can respond with answer in a tag called <answer>. Make sure to add final response in this answer tag.

        Example:
        User: What is the capital of France?
        Assistant: <think>
        The capital of France is Paris.
        </think>
        <answer>
        The capital of France is Paris.
        </answer>

        User: Who is the president of the United States?
        Assistant: <think>
        The president of the United States is Joe Biden.
        </think>
        <answer>
        The president of the United States is Joe Biden.
        </answer>
        `
      };

      // Check if system message already exists, if not add it
      const hasSystemMessage = messages.some(msg => msg.role === 'system');
      const processedMessages = hasSystemMessage ? messages : [systemMessage, ...messages];

      const requestBody = {
        model: modelName,
        messages: processedMessages,
        stream: options.stream !== false,
        options: {
          ...this.config.defaultParams,
          ...modelConfig.params,
          ...options.params
        }
      };

      const response = await fetch(`${this.config.baseURL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: options.signal
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      if (requestBody.stream) {
        return this._handleStreamingResponse(response);
      } else {
        const data = await response.json();
        return {
          success: true,
          message: data.message,
          model: data.model,
          created_at: data.created_at,
          done: data.done
        };
      }
    } catch (error) {
      console.error('Error generating chat completion:', error);
      throw error;
    }
  }

  /**
   * Handle streaming response from Ollama
   */
  async _handleStreamingResponse(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    return {
      success: true,
      stream: async function* () {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim());

            for (const line of lines) {
              try {
                const data = JSON.parse(line);
                yield data;
              } catch (e) {
                // Skip invalid JSON lines
                console.warn('Invalid JSON in stream:', line);
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      }
    };
  }

  /**
   * Generate simple text completion (non-chat format)
   */
  async generateCompletion(prompt, options = {}) {
    try {
      const modelName = options.model || this.config.defaultModel;
      
      const requestBody = {
        model: modelName,
        prompt: prompt,
        stream: options.stream !== false,
        options: {
          ...this.config.defaultParams,
          ...options.params
        }
      };

      const response = await fetch(`${this.config.baseURL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: options.signal
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      if (requestBody.stream) {
        return this._handleStreamingResponse(response);
      } else {
        const data = await response.json();
        return {
          success: true,
          response: data.response,
          model: data.model,
          created_at: data.created_at,
          done: data.done
        };
      }
    } catch (error) {
      console.error('Error generating completion:', error);
      throw error;
    }
  }

  /**
   * Get model information
   */
  async getModelInfo(modelName) {
    try {
      const response = await fetch(`${this.config.baseURL}/api/show`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: modelName })
      });

      if (!response.ok) {
        throw new Error(`Failed to get model info: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting model info:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
export const ollamaClient = new OllamaClient();
export default ollamaClient;
