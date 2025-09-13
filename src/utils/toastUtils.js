import {ToastAndroid} from 'react-native';

/**
 * Utility functions for showing toast messages throughout the app
 * Uses native Android ToastAndroid for better performance
 */

export const showToast = {
  success: (title, message = '') => {
    const displayText = message ? `${title}: ${message}` : title;
    ToastAndroid.show(displayText, ToastAndroid.LONG);
  },

  error: (title, message = '') => {
    const displayText = message ? `${title}: ${message}` : title;
    ToastAndroid.show(displayText, ToastAndroid.LONG);
  },

  info: (title, message = '') => {
    const displayText = message ? `${title}: ${message}` : title;
    ToastAndroid.show(displayText, ToastAndroid.SHORT);
  },

  // For simple text-only messages
  show: (text, type = 'info') => {
    const duration = type === 'error' ? ToastAndroid.LONG : ToastAndroid.SHORT;
    ToastAndroid.show(text, duration);
  },
};

// Backwards compatibility with Alert.alert pattern
export const showAlert = (title, message, type = 'info') => {
  if (type === 'success' || title.toLowerCase().includes('success')) {
    showToast.success(title, message);
  } else if (type === 'error' || title.toLowerCase().includes('error')) {
    showToast.error(title, message);
  } else {
    showToast.info(title, message);
  }
};

export default showToast;
