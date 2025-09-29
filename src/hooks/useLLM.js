/**
 * Custom React hook for LLM interactions
 * Provides a simple interface for chat operations with Ollama
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { llmService } from '../services/llm/index.js';

export const useLLM = (initialModel = 'qwen3:14b') => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentModel, setCurrentModel] = useState(initialModel);
  const [availableModels, setAvailableModels] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  const abortControllerRef = useRef(null);

  /**
   * Initialize the LLM service
   */
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setConnectionStatus('connecting');

      const result = await llmService.initialize(initialModel);
      
      if (result.success) {
        setIsInitialized(true);
        setAvailableModels(result.availableModels);
        setCurrentModel(initialModel);
        setConnectionStatus('connected');
      }
    } catch (err) {
      console.error('Failed to initialize LLM service:', err);
      setError(err.message);
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
    }
  }, [initialModel]);

  /**
   * Send a message to the LLM
   */
  const sendMessage = useCallback(async (messages, options = {}) => {
    if (!isInitialized) {
      throw new Error('LLM service not initialized');
    }

    try {
      setIsLoading(true);
      setError(null);

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      const response = await llmService.sendMessage(messages, {
        ...options,
        signal: abortControllerRef.current.signal
      });

      return response;
    } catch (err) {
      if (err.name === 'AbortError') {
        return null;
      }
      
      console.error('Error sending message:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [isInitialized]);

  /**
   * Parse thinking and answer sections from response
   */
  const parseThinkingAndAnswer = (content) => {
    // First, check if we have any structured tags at all
    const hasThinkingTag = content.includes('<think>');
    const hasAnswerTag = content.includes('<answer>');
    
    // If we have structured format, parse it properly
    if (hasThinkingTag || hasAnswerTag) {
      const thinkingMatch = content.match(/<think>([\s\S]*?)<\/think>/);
      const answerMatch = content.match(/<answer>([\s\S]*?)<\/answer>/);
      
      // For partial content (streaming), handle incomplete tags
      const partialThinking = content.match(/<think>([\s\S]*?)(?:<\/think>|$)/);
      const partialAnswer = content.match(/<answer>([\s\S]*?)(?:<\/answer>|$)/);
      
      const result = {
        thinking: (thinkingMatch ? thinkingMatch[1] : (partialThinking ? partialThinking[1] : '')).trim(),
        answer: (answerMatch ? answerMatch[1] : (partialAnswer ? partialAnswer[1] : '')).trim()
      };
      
      return result;
    }
    
    // No structured format detected - be conservative about what we show as answer
    const trimmedContent = content.trim();
    
    // For unstructured content, we need to be careful:
    // - During streaming, early content might be thinking process
    // - Only show as answer when it looks like a complete final response
    
    // If content is very short, likely still building up - put in thinking
    if (trimmedContent.length < 20) {
      return {
        thinking: trimmedContent,
        answer: ''
      };
    }
    
    // For unstructured content, we need balanced logic:
    // - During streaming, early content is usually thinking
    // - Final complete responses should show as answers
    // - Use content analysis to determine the right classification
    
    const lowerContent = trimmedContent.toLowerCase();
    
    // Thinking indicators - content that suggests reasoning process
    const thinkingIndicators = [
      'let me think',
      'i need to',
      'let me consider',
      'i should',
      'first,',
      'step 1',
      'step by step',
      'let me work',
      'thinking about',
      'analyzing',
      'considering'
    ];
    
    // Answer indicators - content that suggests final response
    const answerIndicators = [
      'final answer',
      'equals',
      'is equal to', 
      'the result is',
      'therefore',
      'in conclusion',
      'finally',
      '=',
      'is:',
      'answer:'
    ];
    
    const hasThinkingIndicators = thinkingIndicators.some(indicator => 
      lowerContent.includes(indicator)
    );
    
    const hasAnswerIndicators = answerIndicators.some(indicator => 
      lowerContent.includes(indicator)
    );
    
    // Decision logic:
    // 1. If has answer indicators → definitely answer
    // 2. If has thinking indicators but no answer indicators → thinking  
    // 3. If very short (< 20 chars) → likely still building, put in thinking
    // 4. If longer and no clear indicators → check if it looks complete
    
    if (hasAnswerIndicators) {
      const result = { thinking: '', answer: trimmedContent };
      return result;
    }
    
    if (hasThinkingIndicators) {
      const result = { thinking: trimmedContent, answer: '' };
      return result;
    }
    
    // For content without clear indicators, be conservative during streaming
    // Short content likely still building → thinking
    // Longer content that looks complete → answer
    if (trimmedContent.length < 30) {
      const result = { thinking: trimmedContent, answer: '' };
      return result;
    }
    
    // Longer content without thinking indicators → probably final answer
    const result = { thinking: '', answer: trimmedContent };
    return result;
  };

  /**
   * Send message with streaming response
   */
  const sendMessageStream = useCallback(async (messages, onChunk, options = {}) => {
    if (!isInitialized) {
      throw new Error('LLM service not initialized');
    }

    try {
      setIsLoading(true);
      setError(null);

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      const response = await llmService.sendMessage(messages, {
        ...options,
        stream: true,
        signal: abortControllerRef.current.signal
      });

      if (response.success && response.stream) {
        let fullContent = '';
        
        for await (const chunk of response.stream()) {
          if (chunk.message && chunk.message.content) {
            fullContent += chunk.message.content;
            
            // Parse thinking and answer sections
            const parsed = parseThinkingAndAnswer(fullContent);
            
            onChunk(chunk.message.content, fullContent, parsed.thinking, parsed.answer, chunk.done);
          }
          
          if (chunk.done) {
            break;
          }
        }
        
        const finalParsed = parseThinkingAndAnswer(fullContent);
        return { 
          success: true, 
          content: fullContent,
          thinking: finalParsed.thinking,
          answer: finalParsed.answer
        };
      }

      return response;
    } catch (err) {
      if (err.name === 'AbortError') {
        return null;
      }
      
      console.error('Error in streaming message:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [isInitialized]);

  /**
   * Change the current model
   */
  const changeModel = useCallback(async (modelName) => {
    try {
      setIsLoading(true);
      setError(null);

      await llmService.setModel(modelName);
      setCurrentModel(modelName);
    } catch (err) {
      console.error('Error changing model:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Abort current request
   */
  const abortRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  /**
   * Refresh available models
   */
  const refreshModels = useCallback(async () => {
    try {
      const models = await llmService.getModels();
      setAvailableModels(models);
      return models;
    } catch (err) {
      console.error('Error refreshing models:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Check connection health
   */
  const checkHealth = useCallback(async () => {
    try {
      const health = await llmService.healthCheck();
      setConnectionStatus(health.success ? 'connected' : 'error');
      return health;
    } catch (err) {
      setConnectionStatus('error');
      throw err;
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // State
    isInitialized,
    isLoading,
    error,
    currentModel,
    availableModels,
    connectionStatus,
    
    // Actions
    initialize,
    sendMessage,
    sendMessageStream,
    changeModel,
    abortRequest,
    refreshModels,
    checkHealth,
    
    // Utilities
    clearError: () => setError(null)
  };
};
