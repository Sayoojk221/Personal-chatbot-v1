/**
 * Local Storage Service for Chat Persistence
 * Handles saving and loading chat data to/from browser localStorage
 */

const STORAGE_KEYS = {
  CHAT_HISTORY: 'personalChatbot_chatHistory',
  CHAT_MESSAGES: 'personalChatbot_chatMessages',
  APP_SETTINGS: 'personalChatbot_settings'
};

/**
 * Safely parse JSON from localStorage
 */
const safeJSONParse = (item, fallback = null) => {
  try {
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.warn('Failed to parse localStorage item:', error);
    return fallback;
  }
};

/**
 * Restore Date objects from stored messages
 */
const restoreDateObjects = (messages) => {
  if (!Array.isArray(messages)) return messages;
  
  return messages.map(message => ({
    ...message,
    timestamp: message.timestamp ? new Date(message.timestamp) : new Date()
  }));
};

/**
 * Safely stringify and save to localStorage
 */
const safeJSONStringify = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
};

/**
 * Chat History Management
 */
export const chatHistoryStorage = {
  /**
   * Save chat history list
   */
  save: (chatHistory) => {
    return safeJSONStringify(STORAGE_KEYS.CHAT_HISTORY, chatHistory);
  },

  /**
   * Load chat history list
   */
  load: () => {
    const stored = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
    return safeJSONParse(stored, []);
  },

  /**
   * Add a new chat to history
   */
  addChat: (newChat) => {
    const currentHistory = chatHistoryStorage.load();
    const updatedHistory = [newChat, ...currentHistory.filter(chat => chat.id !== newChat.id)];
    return chatHistoryStorage.save(updatedHistory);
  },

  /**
   * Update existing chat in history
   */
  updateChat: (chatId, updates) => {
    const currentHistory = chatHistoryStorage.load();
    const updatedHistory = currentHistory.map(chat => 
      chat.id === chatId ? { ...chat, ...updates } : chat
    );
    return chatHistoryStorage.save(updatedHistory);
  },

  /**
   * Delete chat from history
   */
  deleteChat: (chatId) => {
    const currentHistory = chatHistoryStorage.load();
    const updatedHistory = currentHistory.filter(chat => chat.id !== chatId);
    chatMessagesStorage.delete(chatId); // Also delete messages
    return chatHistoryStorage.save(updatedHistory);
  },

  /**
   * Clear all chat history
   */
  clear: () => {
    localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES);
    return true;
  }
};

/**
 * Chat Messages Management
 */
export const chatMessagesStorage = {
  /**
   * Save messages for a specific chat
   */
  save: (chatId, messages) => {
    const allMessages = chatMessagesStorage.loadAll();
    allMessages[chatId] = messages;
    return safeJSONStringify(STORAGE_KEYS.CHAT_MESSAGES, allMessages);
  },

  /**
   * Load messages for a specific chat
   */
  load: (chatId) => {
    const allMessages = chatMessagesStorage.loadAll();
    const messages = allMessages[chatId] || [];
    return restoreDateObjects(messages);
  },

  /**
   * Load all chat messages
   */
  loadAll: () => {
    const stored = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    return safeJSONParse(stored, {});
  },

  /**
   * Add message to a chat
   */
  addMessage: (chatId, message) => {
    const currentMessages = chatMessagesStorage.load(chatId);
    const updatedMessages = [...currentMessages, message];
    return chatMessagesStorage.save(chatId, updatedMessages);
  },

  /**
   * Update message in a chat
   */
  updateMessage: (chatId, messageId, updates) => {
    const currentMessages = chatMessagesStorage.load(chatId);
    const updatedMessages = currentMessages.map(msg => 
      msg.id === messageId ? { ...msg, ...updates } : msg
    );
    return chatMessagesStorage.save(chatId, updatedMessages);
  },

  /**
   * Delete messages for a specific chat
   */
  delete: (chatId) => {
    const allMessages = chatMessagesStorage.loadAll();
    delete allMessages[chatId];
    return safeJSONStringify(STORAGE_KEYS.CHAT_MESSAGES, allMessages);
  },

  /**
   * Clear all messages
   */
  clear: () => {
    localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES);
    return true;
  }
};

/**
 * App Settings Management
 */
export const appSettingsStorage = {
  /**
   * Save app settings
   */
  save: (settings) => {
    return safeJSONStringify(STORAGE_KEYS.APP_SETTINGS, settings);
  },

  /**
   * Load app settings
   */
  load: () => {
    const stored = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
    return safeJSONParse(stored, {
      selectedChatId: null,
      theme: 'auto',
      lastActiveTimestamp: Date.now()
    });
  },

  /**
   * Update specific setting
   */
  update: (key, value) => {
    const currentSettings = appSettingsStorage.load();
    const updatedSettings = { ...currentSettings, [key]: value };
    return appSettingsStorage.save(updatedSettings);
  }
};

/**
 * Storage utilities
 */
export const storageUtils = {
  /**
   * Get storage usage info
   */
  getStorageInfo: () => {
    try {
      const chatHistorySize = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY)?.length || 0;
      const chatMessagesSize = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES)?.length || 0;
      const settingsSize = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS)?.length || 0;
      
      return {
        chatHistory: chatHistorySize,
        chatMessages: chatMessagesSize,
        settings: settingsSize,
        total: chatHistorySize + chatMessagesSize + settingsSize
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { chatHistory: 0, chatMessages: 0, settings: 0, total: 0 };
    }
  },

  /**
   * Check if localStorage is available
   */
  isAvailable: () => {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Clear all app data from localStorage
   */
  clearAll: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      return false;
    }
  },

  /**
   * Export all data for backup
   */
  exportData: () => {
    try {
      const data = {
        chatHistory: chatHistoryStorage.load(),
        chatMessages: chatMessagesStorage.loadAll(),
        settings: appSettingsStorage.load(),
        exportTimestamp: Date.now()
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      return null;
    }
  },

  /**
   * Import data from backup
   */
  importData: (jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.chatHistory) {
        chatHistoryStorage.save(data.chatHistory);
      }
      
      if (data.chatMessages) {
        safeJSONStringify(STORAGE_KEYS.CHAT_MESSAGES, data.chatMessages);
      }
      
      if (data.settings) {
        appSettingsStorage.save(data.settings);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
};

export default {
  chatHistoryStorage,
  chatMessagesStorage,
  appSettingsStorage,
  storageUtils
};
