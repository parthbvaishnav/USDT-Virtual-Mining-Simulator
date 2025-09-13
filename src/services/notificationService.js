import {OneSignal} from 'react-native-onesignal';
import {Alert} from 'react-native';

class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.userId = null;
  }

  // Initialize OneSignal with your App ID
  initialize(appId) {
    if (this.isInitialized) return;

    try {
      // Initialize OneSignal
      OneSignal.initialize(appId);

      // Set up notification handlers
      this.setupNotificationHandlers();

      // Request notification permissions
      this.requestPermissions();

      this.isInitialized = true;
      console.log('OneSignal initialized successfully');
    } catch (error) {
      console.error('Error initializing OneSignal:', error);
    }
  }

  // Request notification permissions
  async requestPermissions() {
    try {
      const hasPermission = await OneSignal.Notifications.hasPermission();
      console.log('Has notification permission:', hasPermission);
      if (!hasPermission) {
        const permission = await OneSignal.Notifications.requestPermission(true);
        console.log('Permission request result:', permission);
        return permission;
      }
      return hasPermission;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  async getPermissionStatus() {
    try {
      const hasPermission = await OneSignal.Notifications.hasPermission();
      const permissionState = await OneSignal.Notifications.getPermissionAsync();
      
      return {
        hasPermission,
        permissionState,
        canRequest: permissionState !== 'denied'
      };
    } catch (error) {
      console.error('Error getting permission status:', error);
      return {
        hasPermission: false,
        permissionState: 'unknown',
        canRequest: true
      };
    }
  }

  // Set up notification event handlers
  setupNotificationHandlers() {
    // Handle notification received while app is in foreground
    OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
      console.log('OneSignal: notification will show in foreground:', event);
      const notification = event.getNotification();
      console.log('notification: ', notification);
      
      // Complete with null means don't show a notification
      // Complete with notification means show the notification
      event.getNotification().display();
    });

    // Handle notification opened/clicked
    OneSignal.Notifications.addEventListener('click', (event) => {
      console.log('OneSignal: notification clicked:', event);
      this.handleNotificationOpened(event);
    });

    // Handle subscription changes
    OneSignal.User.pushSubscription.addEventListener('change', (event) => {
      console.log('OneSignal: subscription changed: ', event);
      if (event.current.id) {
        this.userId = event.current.id;
      }
    });

    // Handle permission changes
    OneSignal.Notifications.addEventListener('permissionChange', (granted) => {
      console.log('OneSignal: permission changed:', granted);
    });
  }

  // Handle when notification is opened/clicked
  handleNotificationOpened(event) {
    try {
      const notification = event.result.notification;
      const data = notification.additionalData;
      
      console.log('Notification opened with data:', data);
      
      // Handle different notification types based on data
      if (data) {
        switch (data.type) {
          case 'mining_reward':
            this.handleMiningRewardNotification(data);
            break;
          case 'boost_available':
            this.handleBoostNotification(data);
            break;
          case 'daily_bonus':
            this.handleDailyBonusNotification(data);
            break;
          case 'referral_reward':
            this.handleReferralNotification(data);
            break;
          default:
            console.log('Unknown notification type:', data.type);
        }
      }
    } catch (error) {
      console.error('Error handling notification opened:', error);
    }
  }

  // Handle mining reward notifications
  handleMiningRewardNotification(data) {
    console.log('Handling mining reward notification:', data);
    // Navigate to mining screen or show reward modal
  }

  // Handle boost available notifications
  handleBoostNotification(data) {
    console.log('Handling boost notification:', data);
    // Navigate to boost screen or show boost modal
  }

  // Handle daily bonus notifications
  handleDailyBonusNotification(data) {
    console.log('Handling daily bonus notification:', data);
    // Navigate to daily bonus screen
  }

  // Handle referral notifications
  handleReferralNotification(data) {
    console.log('Handling referral notification:', data);
    // Navigate to referral screen
  }

  // Get user ID for targeting notifications
  async getUserId() {
    try {
      const onesignalId = OneSignal.User.onesignalId;
      return onesignalId;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  }

  // Set external user ID (for targeting specific users)
  setExternalUserId(externalId) {
    try {
      OneSignal.login(externalId);
      console.log('External user ID set:', externalId);
    } catch (error) {
      console.error('Error setting external user ID:', error);
    }
  }

  // Add tags for user segmentation
  sendTags(tags) {
    try {
      OneSignal.User.addTags(tags);
      console.log('Tags sent:', tags);
    } catch (error) {
      console.error('Error sending tags:', error);
    }
  }

  // Send notification to specific user (requires REST API)
  async sendNotificationToUser(userId, title, message, data = {}) {
    try {
      // This would typically be done from your backend
      // Here's the structure for reference
      const notificationData = {
        app_id: 'YOUR_ONESIGNAL_APP_ID',
        include_player_ids: [userId],
        headings: { en: title },
        contents: { en: message },
        data: data,
      };
      
      console.log('Notification data prepared:', notificationData);
      // You would send this to OneSignal REST API from your backend
      
    } catch (error) {
      console.error('Error preparing notification:', error);
    }
  }

  // Send notification to all users (requires REST API)
  async sendNotificationToAll(title, message, data = {}) {
    try {
      const notificationData = {
        app_id: 'YOUR_ONESIGNAL_APP_ID',
        included_segments: ['All'],
        headings: { en: title },
        contents: { en: message },
        data: data,
      };
      
      console.log('Broadcast notification data prepared:', notificationData);
      // You would send this to OneSignal REST API from your backend
      
    } catch (error) {
      console.error('Error preparing broadcast notification:', error);
    }
  }

  // Get notification permission status
  async getPermissionStatus() {
    try {
      const hasPermission = await OneSignal.Notifications.hasPermission();
      const isSubscribed = OneSignal.User.pushSubscription.optedIn;
      const userId = OneSignal.User.onesignalId;
      
      return {
        hasPermission,
        isSubscribed,
        userId,
      };
    } catch (error) {
      console.error('Error getting permission status:', error);
      return {
        hasPermission: false,
        isSubscribed: false,
        userId: null,
      };
    }
  }

  // Disable notifications
  disableNotifications() {
    try {
      OneSignal.User.pushSubscription.optOut();
      console.log('Notifications disabled');
    } catch (error) {
      console.error('Error disabling notifications:', error);
    }
  }

  // Enable notifications
  enableNotifications() {
    try {
      OneSignal.User.pushSubscription.optIn();
      console.log('Notifications enabled');
    } catch (error) {
      console.error('Error enabling notifications:', error);
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
