/**
 * Ollama API Configuration
 * Manages connection settings and model configurations for Ollama
 */

export const OLLAMA_CONFIG = {
  // Default Ollama server configuration
  baseURL: 'http://localhost:11434',
  
  // API endpoints
  endpoints: {
    chat: '/api/chat',
    generate: '/api/generate',
    models: '/api/tags',
    pull: '/api/pull',
    show: '/api/show'
  },
  
  // Default model settings
  defaultModel: 'qwen3:14b',
  
  // Request configuration
  timeout: 30000, // 30 seconds
  
  // Default generation parameters
  defaultParams: {
    temperature: 0.7,
    top_p: 0.9,
    top_k: 40,
    repeat_penalty: 1.1,
    max_tokens: 2048,
    stream: true
  }
};

/**
 * Model-specific configurations
 */
export const MODEL_CONFIGS = {
  'qwen3:14b': {
    name: 'Qwen3 14B',
    description: 'Qwen2.5 14B parameter model - higher quality responses',
    contextLength: 32768,
    params: {
      temperature: 0.6,
      top_p: 0.85,
      max_tokens: 2048
    }
  }
};

/**
 * Environment-based configuration
 */
export const getOllamaConfig = () => {
  return {
    ...OLLAMA_CONFIG,
    baseURL: import.meta.env.VITE_OLLAMA_BASE_URL || OLLAMA_CONFIG.baseURL,
    defaultModel: import.meta.env.VITE_OLLAMA_DEFAULT_MODEL || OLLAMA_CONFIG.defaultModel
  };
};

/**
 * Validate Ollama configuration
 */
export const validateConfig = (config = OLLAMA_CONFIG) => {
  const errors = [];
  
  if (!config.baseURL) {
    errors.push('Base URL is required');
  }
  
  if (!config.defaultModel) {
    errors.push('Default model is required');
  }
  
  try {
    new URL(config.baseURL);
  } catch (error) {
    errors.push('Invalid base URL format', error);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
