/**
 * Storage Services Entry Point
 * Exports all storage-related services and utilities
 */

export {
  chatHistoryStorage,
  chatMessagesStorage,
  appSettingsStorage,
  storageUtils
} from './localStorage.js';

export { default as localStorage } from './localStorage.js';
