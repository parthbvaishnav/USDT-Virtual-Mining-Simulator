import analytics from '@react-native-firebase/analytics';

class AnalyticsService {
  constructor() {
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Enable analytics collection 
      await analytics().setAnalyticsCollectionEnabled(true);
      this.isInitialized = true;
      console.log('Firebase Analytics initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Firebase Analytics:', error);
    }
  }

  // User Authentication Events
  async logLogin(method = 'email') {
    if (!this.isInitialized) return;
    try {
      await analytics().logLogin({ method });
    } catch (error) {
      console.error('Analytics login error:', error);
    }
  }

  async logSignUp(method = 'email') {
    if (!this.isInitialized) return;
    try {
      await analytics().logSignUp({ method });
    } catch (error) {
      console.error('Analytics signup error:', error);
    }
  }

  // Mining Events
  async logMiningStarted(miningType = 'default') {
    if (!this.isInitialized) return;
    try {
      await analytics().logEvent('mining_started', {
        mining_type: miningType,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Analytics mining started error:', error);
    }
  }

  async logMiningCompleted(duration, coinsEarned, usdtEarned) {
    if (!this.isInitialized) return;
    try {
      await analytics().logEvent('mining_completed', {
        duration_seconds: duration,
        coins_earned: coinsEarned,
        usdt_earned: usdtEarned,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Analytics mining completed error:', error);
    }
  }

  // Reward Events
  async logDailyRewardClaimed(rewardAmount) {
    if (!this.isInitialized) return;
    try {
      await analytics().logEvent('daily_reward_claimed', {
        reward_amount: rewardAmount,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Analytics daily reward error:', error);
    }
  }

  async logFlipRewardClaimed(rewardAmount, flipResult) {
    if (!this.isInitialized) return;
    try {
      await analytics().logEvent('flip_reward_claimed', {
        reward_amount: rewardAmount,
        flip_result: flipResult,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Analytics flip reward error:', error);
    }
  }

  // Conversion Events
  async logCoinConversion(coinsConverted, usdtReceived) {
    if (!this.isInitialized) return;
    try {
      await analytics().logEvent('coin_conversion', {
        coins_converted: coinsConverted,
        usdt_received: usdtReceived,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Analytics coin conversion error:', error);
    }
  }

  // Screen Navigation Events
  async logScreenView(screenName, screenClass = null) {
    if (!this.isInitialized) return;
    try {
      // Use logEvent instead of deprecated logScreenView
      await analytics().logEvent('screen_view', {
        screen_name: screenName,
        screen_class: screenClass || screenName
      });
    } catch (error) {
      console.error('Analytics screen view error:', error);
    }
  }

  // User Properties
  async setUserProperties(userId, userProperties = {}) {
    if (!this.isInitialized) return;
    try {
      await analytics().setUserId(userId);
      
      // Set additional user properties
      for (const [key, value] of Object.entries(userProperties)) {
        await analytics().setUserProperty(key, String(value));
      }
    } catch (error) {
      console.error('Analytics user properties error:', error);
    }
  }

  // Ad Events
  async logAdViewed(adNetwork, adType, placement) {
    if (!this.isInitialized) return;
    try {
      await analytics().logEvent('ad_viewed', {
        ad_network: adNetwork,
        ad_type: adType,
        placement: placement,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Analytics ad viewed error:', error);
    }
  }

  async logAdClicked(adNetwork, adType, placement) {
    if (!this.isInitialized) return;
    try {
      await analytics().logEvent('ad_clicked', {
        ad_network: adNetwork,
        ad_type: adType,
        placement: placement,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Analytics ad clicked error:', error);
    }
  }

  // Referral Events
  async logReferralShared(referralCode) {
    if (!this.isInitialized) return;
    try {
      await analytics().logEvent('referral_shared', {
        referral_code: referralCode,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Analytics referral shared error:', error);
    }
  }

  // Custom Events
  async logCustomEvent(eventName, parameters = {}) {
    if (!this.isInitialized) return;
    try {
      await analytics().logEvent(eventName, {
        ...parameters,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error(`Analytics custom event ${eventName} error:`, error);
    }
  }

  // App Lifecycle Events
  async logAppOpened() {
    if (!this.isInitialized) return;
    try {
      await analytics().logEvent('app_opened', {
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Analytics app opened error:', error);
    }
  }

  async logAppBackgrounded() {
    if (!this.isInitialized) return;
    try {
      await analytics().logEvent('app_backgrounded', {
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Analytics app backgrounded error:', error);
    }
  }
}

export default new AnalyticsService();
