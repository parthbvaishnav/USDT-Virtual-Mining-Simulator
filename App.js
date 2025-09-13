import React, {useEffect} from 'react';
import {LogBox, AppState} from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import {AuthProvider} from './src/context/AuthContext';
import notificationService from './src/services/notificationService';
import multiAdManager from './src/utils/multiAdManager';
import analyticsService from './src/services/analyticsService';

export default function App() {
  useEffect(() => {
    LogBox.ignoreAllLogs();

    // Initialize Firebase Analytics
    analyticsService.initialize();

    // Initialize Enhanced Ad Manager (supports Google, Facebook, AppLovin)
    multiAdManager.initializeAds();

    // Initialize OneSignal notifications
    // Replace 'YOUR_ONESIGNAL_APP_ID' with your actual OneSignal App ID
    notificationService.initialize('f7e64952-2dc0-4e11-9487-088657609018');

    // Log app opened event
    analyticsService.logAppOpened();

    // Handle app state changes for analytics
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'background') {
        analyticsService.logAppBackgrounded();
      } else if (nextAppState === 'active') {
        analyticsService.logAppOpened();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
