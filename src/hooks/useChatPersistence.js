/**
 * Custom React hook for chat persistence
 * Manages saving and loading chat data to/from localStorage
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  chatHistoryStorage, 
  chatMessagesStorage, 
  appSettingsStorage 
} from '../services/storage/index.js';

export const useChatPersistence = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [storageError, setStorageError] = useState(null);

  /**
   * Initialize and load data from localStorage
   */
  const initializeStorage = useCallback(async () => {
    try {
      setStorageError(null);
      
      // Load saved data
      const savedChatHistory = chatHistoryStorage.load();
      const savedSettings = appSettingsStorage.load();
      
      setIsLoaded(true);
      
      return {
        chatHistory: savedChatHistory,
        settings: savedSettings
      };
    } catch (error) {
      console.error('Failed to initialize storage:', error);
      setStorageError(error.message);
      setIsLoaded(true);
      return {
        chatHistory: [],
        settings: { selectedChatId: null }
      };
    }
  }, []);

  /**
   * Save chat history
   */
  const saveChatHistory = useCallback((chatHistory) => {
    try {
      const success = chatHistoryStorage.save(chatHistory);
      if (!success) {
        throw new Error('Failed to save chat history');
      }
      setStorageError(null);
      return true;
    } catch (error) {
      console.error('Error saving chat history:', error);
      setStorageError(error.message);
      return false;
    }
  }, []);

  /**
   * Load chat history
   */
  const loadChatHistory = useCallback(() => {
    try {
      const chatHistory = chatHistoryStorage.load();
      setStorageError(null);
      return chatHistory;
    } catch (error) {
      console.error('Error loading chat history:', error);
      setStorageError(error.message);
      return [];
    }
  }, []);

  /**
   * Add new chat to history
   */
  const addChatToHistory = useCallback((newChat) => {
    try {
      const success = chatHistoryStorage.addChat(newChat);
      if (!success) {
        throw new Error('Failed to add chat to history');
      }
      setStorageError(null);
      return true;
    } catch (error) {
      console.error('Error adding chat to history:', error);
      setStorageError(error.message);
      return false;
    }
  }, []);

  /**
   * Update existing chat in history
   */
  const updateChatInHistory = useCallback((chatId, updates) => {
    try {
      const success = chatHistoryStorage.updateChat(chatId, updates);
      if (!success) {
        throw new Error('Failed to update chat in history');
      }
      setStorageError(null);
      return true;
    } catch (error) {
      console.error('Error updating chat in history:', error);
      setStorageError(error.message);
      return false;
    }
  }, []);

  /**
   * Delete chat from history
   */
  const deleteChatFromHistory = useCallback((chatId) => {
    try {
      const success = chatHistoryStorage.deleteChat(chatId);
      if (!success) {
        throw new Error('Failed to delete chat from history');
      }
      setStorageError(null);
      return true;
    } catch (error) {
      console.error('Error deleting chat from history:', error);
      setStorageError(error.message);
      return false;
    }
  }, []);

  /**
   * Save messages for a chat
   */
  const saveChatMessages = useCallback((chatId, messages) => {
    try {
      const success = chatMessagesStorage.save(chatId, messages);
      if (!success) {
        throw new Error('Failed to save chat messages');
      }
      setStorageError(null);
      return true;
    } catch (error) {
      console.error('Error saving chat messages:', error);
      setStorageError(error.message);
      return false;
    }
  }, []);

  /**
   * Load messages for a chat
   */
  const loadChatMessages = useCallback((chatId) => {
    try {
      const messages = chatMessagesStorage.load(chatId);
      setStorageError(null);
      return messages;
    } catch (error) {
      console.error('Error loading chat messages:', error);
      setStorageError(error.message);
      return [];
    }
  }, []);

  /**
   * Add message to a chat
   */
  const addMessageToChat = useCallback((chatId, message) => {
    try {
      const success = chatMessagesStorage.addMessage(chatId, message);
      if (!success) {
        throw new Error('Failed to add message to chat');
      }
      setStorageError(null);
      return true;
    } catch (error) {
      console.error('Error adding message to chat:', error);
      setStorageError(error.message);
      return false;
    }
  }, []);

  /**
   * Update message in a chat
   */
  const updateMessageInChat = useCallback((chatId, messageId, updates) => {
    try {
      const success = chatMessagesStorage.updateMessage(chatId, messageId, updates);
      if (!success) {
        throw new Error('Failed to update message in chat');
      }
      setStorageError(null);
      return true;
    } catch (error) {
      console.error('Error updating message in chat:', error);
      setStorageError(error.message);
      return false;
    }
  }, []);

  /**
   * Save app settings
   */
  const saveSettings = useCallback((settings) => {
    try {
      const success = appSettingsStorage.save(settings);
      if (!success) {
        throw new Error('Failed to save settings');
      }
      setStorageError(null);
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      setStorageError(error.message);
      return false;
    }
  }, []);

  /**
   * Update specific setting
   */
  const updateSetting = useCallback((key, value) => {
    try {
      const success = appSettingsStorage.update(key, value);
      if (!success) {
        throw new Error('Failed to update setting');
      }
      setStorageError(null);
      return true;
    } catch (error) {
      console.error('Error updating setting:', error);
      setStorageError(error.message);
      return false;
    }
  }, []);

  /**
   * Load app settings
   */
  const loadSettings = useCallback(() => {
    try {
      const settings = appSettingsStorage.load();
      setStorageError(null);
      return settings;
    } catch (error) {
      console.error('Error loading settings:', error);
      setStorageError(error.message);
      return { selectedChatId: null };
    }
  }, []);

  /**
   * Clear all data
   */
  const clearAllData = useCallback(() => {
    try {
      const success = chatHistoryStorage.clear();
      if (!success) {
        throw new Error('Failed to clear all data');
      }
      setStorageError(null);
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      setStorageError(error.message);
      return false;
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeStorage();
  }, [initializeStorage]);

  return {
    // State
    isLoaded,
    storageError,
    
    // Initialization
    initializeStorage,
    
    // Chat History
    saveChatHistory,
    loadChatHistory,
    addChatToHistory,
    updateChatInHistory,
    deleteChatFromHistory,
    
    // Chat Messages
    saveChatMessages,
    loadChatMessages,
    addMessageToChat,
    updateMessageInChat,
    
    // Settings
    saveSettings,
    updateSetting,
    loadSettings,
    
    // Utilities
    clearAllData
  };
};
