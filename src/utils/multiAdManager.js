import mobileAds, {
  InterstitialAd,
  RewardedAd,
  TestIds,
  AdEventType,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';
// import {
//   InterstitialAd as FBInterstitialAd,
//   RewardedVideoAd as FBRewardedAd,
//   AdSettings,
// } from 'react-native-fbads';

import * as FacebookAds from 'react-native-fbads';
const { InterstitialAd:FBInterstitialAd } = FacebookAds;
const { RewardedAd: FBRewardedAd } = FacebookAds;
const { AdSettings } = FacebookAds;
import {
  MaxInterstitialAd,
  MaxRewardedAd,
  MaxAdView,
} from 'react-native-applovin-max';
import adConfigService from '../services/adConfigService';

const AD_NETWORKS = {
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
  APPLOVIN: 'applovin',
};

class MultiAdManager {
  constructor() {
    this.currentNetwork = null; // No default network
    this.adConfig = null;
    this.isInitialized = false;
    
    // Google Ads instances
    this.googleInterstitial = null;
    this.googleRewarded = null;
    
    // Facebook Ads instances
    this.facebookInterstitial = null;
    this.facebookRewarded = null;
    
    // AppLovin instances
    this.appLovinInterstitial = null;
    this.appLovinRewarded = null;
    
    this.isTestMode = __DEV__;
  }

  // Initialize ads based on activeNetwork from API
  async initializeAds() {
    if (this.isInitialized) return;

    try {
      // Fetch ad configuration from backend using adConfigService
      this.adConfig = await adConfigService.fetchAdConfig();
      
      // If config is null or activeNetwork is empty, disable ads
      if (!this.adConfig || !this.adConfig.activeNetwork || this.adConfig.activeNetwork.trim() === '') {
        console.log('activeNetwork is empty or null - ads disabled');
        this.isInitialized = false;
        this.currentNetwork = null;
        return;
      }

      this.currentNetwork = this.adConfig.activeNetwork;
      
      console.log('Ad config loaded:', this.adConfig);
      console.log('Active network:', this.currentNetwork);
      
      // Only initialize the active network specified by API
      if (this.currentNetwork === AD_NETWORKS.GOOGLE && this.adConfig.networks.google?.enabled) {
        await this.initializeGoogleAds();
        this.isInitialized = true;
      } else if (this.currentNetwork === AD_NETWORKS.FACEBOOK && this.adConfig.networks.facebook?.enabled) {
        await this.initializeFacebookAds();
        this.isInitialized = true;
      } else if (this.currentNetwork === AD_NETWORKS.APPLOVIN && this.adConfig.networks.applovin?.enabled) {
        await this.initializeAppLovinAds();
        this.isInitialized = true;
      } else {
        // activeNetwork doesn't match any supported network or network not enabled
        console.log(`activeNetwork '${this.currentNetwork}' is not supported or enabled - ads disabled`);
        this.isInitialized = false;
        this.currentNetwork = null;
        return;
      }
      
      console.log(`Ad network initialized: ${this.currentNetwork}`);
    } catch (error) {
      console.error('Error initializing ad networks:', error);
      console.log('Ad initialization failed - no ads will be shown');
      this.isInitialized = false;
      this.currentNetwork = null;
    }
  }


  // Initialize Google Ads
  async initializeGoogleAds() {
    try {
      await mobileAds().initialize();
      console.log('Google Ads initialized');
      this.loadGoogleInterstitial();
      this.loadGoogleRewarded();
    } catch (error) {
      console.error('Error initializing Google Ads:', error);
    }
  }

  // Initialize Facebook Ads
  async initializeFacebookAds() {
    try {
      if (this.isTestMode) {
        AdSettings.addTestDevice(AdSettings.currentDeviceHash);
      }
      
      this.loadFacebookInterstitial();
      this.loadFacebookRewarded();
      console.log('Facebook Ads initialized');
    } catch (error) {
      console.error('Error initializing Facebook Ads:', error);
    }
  }

  // Initialize AppLovin Ads
  async initializeAppLovinAds() {
    try {
      const sdkKey = this.adConfig?.networks?.applovin?.sdkKey;
      if (sdkKey) {
        // AppLovin initialization would be done here
        console.log('AppLovin Ads initialized with SDK key:', sdkKey);
        this.loadAppLovinInterstitial();
        this.loadAppLovinRewarded();
      } else {
        console.log('No AppLovin SDK key provided');
      }
    } catch (error) {
      console.error('Error initializing AppLovin Ads:', error);
    }
  }

  // Google Ads Methods
  loadGoogleInterstitial() {
    try {
      const adUnitId = this.adConfig?.networks?.google?.interstitialId;
      
      if (!adUnitId) {
        console.log('No Google interstitial ad unit ID from API');
        return;
      }
      
      this.googleInterstitial = InterstitialAd.createForAdRequest(adUnitId);
      
      this.googleInterstitial.addAdEventListener(AdEventType.LOADED, () => {
        console.log('Google Interstitial ad loaded');
      });
      
      this.googleInterstitial.addAdEventListener(AdEventType.ERROR, error => {
        console.error('Google Interstitial ad failed to load:', error);
        setTimeout(() => this.loadGoogleInterstitial(), 5000);
      });
      
      this.googleInterstitial.addAdEventListener(AdEventType.CLOSED, () => {
        this.loadGoogleInterstitial();
      });
      
      this.googleInterstitial.load();
    } catch (error) {
      console.error('Error loading Google interstitial:', error);
    }
  }

  loadGoogleRewarded() {
    try {
      const adUnitId = this.adConfig?.networks?.google?.rewardedId;
      
      if (!adUnitId) {
        console.log('No Google rewarded ad unit ID from API');
        return;
      }
      
      this.googleRewarded = RewardedAd.createForAdRequest(adUnitId);
      
      this.googleRewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
        console.log('Google Rewarded ad loaded');
      });
      
      this.googleRewarded.addAdEventListener(AdEventType.ERROR, error => {
        console.error('Google Rewarded ad failed to load:', error);
        setTimeout(() => this.loadGoogleRewarded(), 5000);
      });
      
      this.googleRewarded.addAdEventListener(AdEventType.CLOSED, () => {
        this.loadGoogleRewarded();
      });
      
      this.googleRewarded.load();
    } catch (error) {
      console.error('Error loading Google rewarded:', error);
    }
  }

  // Facebook Ads Methods
  loadFacebookInterstitial() {
    try {
      const adUnitId = this.adConfig?.networks?.facebook?.interstitialId;
      
      if (!adUnitId) {
        console.log('No Facebook interstitial ad unit ID from API');
        return;
      }
     if (FBInterstitialAd) {
  const ad = new FBInterstitialAd(adUnitId);
  ad.loadAd();
} else {
  console.error('FBInterstitialAd is undefined – module likely broken.');
}

    } catch (error) {
      console.error('Error loading Facebook interstitial:', error);
    }
  }

  loadFacebookRewarded() {
    try {
      const adUnitId = this.adConfig?.networks?.facebook?.rewardedId;
      
      if (!adUnitId) {
        console.log('No Facebook rewarded ad unit ID from API');
        return;
      }
if (InterstitialAd) {
  const ad = new InterstitialAd(adUnitId);
  ad.loadAd();
} else {
  console.error('FBInterstitialAd is undefined – module likely broken.');
}
    } catch (error) {
      console.error('Error loading Facebook rewarded:', error);
    }
  }

  // AppLovin Ads Methods
  loadAppLovinInterstitial() {
    try {
      const adUnitId = this.adConfig?.networks?.applovin?.interstitialId;
      
      if (!adUnitId) {
        console.log('No AppLovin interstitial ad unit ID from API');
        return;
      }
      
      this.appLovinInterstitial = new MaxInterstitialAd(adUnitId);
      
      // Add event listeners
      this.appLovinInterstitial.setAdLoadListener({
        onAdLoaded: () => {
          console.log('AppLovin Interstitial ad loaded');
        },
        onAdLoadFailed: (error) => {
          console.error('AppLovin Interstitial ad failed to load:', error);
          setTimeout(() => this.loadAppLovinInterstitial(), 5000);
        }
      });
      
      this.appLovinInterstitial.setAdDisplayListener({
        onAdDisplayed: () => {
          console.log('AppLovin Interstitial ad displayed');
        },
        onAdHidden: () => {
          console.log('AppLovin Interstitial ad hidden');
          this.loadAppLovinInterstitial(); // Preload next ad
        }
      });
      
      this.appLovinInterstitial.loadAd();
      console.log('AppLovin Interstitial ad loading...');
    } catch (error) {
      console.error('Error loading AppLovin interstitial:', error);
    }
  }

  loadAppLovinRewarded() {
    try {
      const adUnitId = this.adConfig?.networks?.applovin?.rewardedId;
      
      if (!adUnitId) {
        console.log('No AppLovin rewarded ad unit ID from API');
        return;
      }
      
      this.appLovinRewarded = new MaxRewardedAd(adUnitId);
      
      // Add event listeners
      this.appLovinRewarded.setAdLoadListener({
        onAdLoaded: () => {
          console.log('AppLovin Rewarded ad loaded');
        },
        onAdLoadFailed: (error) => {
          console.error('AppLovin Rewarded ad failed to load:', error);
          setTimeout(() => this.loadAppLovinRewarded(), 5000);
        }
      });
      
      this.appLovinRewarded.setAdDisplayListener({
        onAdDisplayed: () => {
          console.log('AppLovin Rewarded ad displayed');
        },
        onAdHidden: () => {
          console.log('AppLovin Rewarded ad hidden');
          this.loadAppLovinRewarded(); // Preload next ad
        }
      });
      
      this.appLovinRewarded.loadAd();
      console.log('AppLovin Rewarded ad loading...');
    } catch (error) {
      console.error('Error loading AppLovin rewarded:', error);
    }
  }

  // Universal show interstitial method
  async showInterstitial() {
    if (!this.isInitialized || !this.currentNetwork) {
      console.log('Ad manager not initialized or activeNetwork is empty - no ads available');
      return true;
    }
    try {
      switch (this.currentNetwork) {
        case AD_NETWORKS.GOOGLE:
          return await this.showGoogleInterstitial();
        case AD_NETWORKS.FACEBOOK:
          return await this.showFacebookInterstitial();
        case AD_NETWORKS.APPLOVIN:
          return await this.showAppLovinInterstitial();
        default:
          console.log('No valid ad network configured');
          return false;
      }
    } catch (error) {
      console.error('Error showing interstitial ad:', error);
      return false;
    }
  }

  // Universal show rewarded method
  async showRewardedAd() {
    try {
      if (!this.isInitialized || !this.currentNetwork) {
        console.log('Ad manager not initialized or activeNetwork is empty - no ads available');
        return { success: true, reward: null };
      }

      switch (this.currentNetwork) {
        case AD_NETWORKS.GOOGLE:
          return await this.showGoogleRewarded();
        case AD_NETWORKS.FACEBOOK:
          return await this.showFacebookRewarded();
        case AD_NETWORKS.APPLOVIN:
          return await this.showAppLovinRewarded();
        default:
          console.log('No valid ad network configured');
          return { success: false, reward: null };
      }
    } catch (error) {
      console.error('Error showing rewarded ad:', error);
      return { success: false, reward: null };
    }
  }

  // Google Ad Show Methods
  async showGoogleInterstitial() {
    try {
      if (this.googleInterstitial && this.googleInterstitial.loaded) {
        await this.googleInterstitial.show();
        return true;
      } else {
        console.log('Google Interstitial ad not loaded');
        this.loadGoogleInterstitial();
        return false;
      }
    } catch (error) {
      console.error('Error showing Google interstitial:', error);
      return false;
    }
  }

  async showGoogleRewarded() {
    return new Promise(resolve => {
      try {
        if (!this.googleRewarded || !this.googleRewarded.loaded) {
          console.log('Google Rewarded ad not loaded');
          this.loadGoogleRewarded();
          resolve({ success: false, reward: null });
          return;
        }

        let earned = false;

        const rewardListener = this.googleRewarded.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD,
          reward => {
            earned = true;
            resolve({ success: true, reward, network: 'google' });
          }
        );

        const closedListener = this.googleRewarded.addAdEventListener(
          AdEventType.CLOSED,
          () => {
            if (!earned) resolve({ success: false, reward: null });
            rewardListener();
            closedListener();
          }
        );

        this.googleRewarded.show();
      } catch (error) {
        console.error('Error showing Google rewarded ad:', error);
        resolve({ success: false, reward: null });
      }
    });
  }

  // Facebook Ad Show Methods
  async showFacebookInterstitial() {
    return new Promise(resolve => {
      try {
        if (!this.facebookInterstitial) {
          this.loadFacebookInterstitial();
          resolve(false);
          return;
        }

        this.facebookInterstitial.showAd()
          .then(() => {
            console.log('Facebook Interstitial ad shown');
            resolve(true);
          })
          .catch(error => {
            console.error('Error showing Facebook interstitial:', error);
            resolve(false);
          });
      } catch (error) {
        console.error('Error with Facebook interstitial:', error);
        resolve(false);
      }
    });
  }

  async showFacebookRewarded() {
    return new Promise(resolve => {
      try {
        if (!this.facebookRewarded) {
          this.loadFacebookRewarded();
          resolve({ success: false, reward: null });
          return;
        }

        this.facebookRewarded.showAd()
          .then(() => {
            console.log('Facebook Rewarded ad completed');
            resolve({ success: true, reward: { amount: 1, type: 'coins' }, network: 'facebook' });
          })
          .catch(error => {
            console.error('Error showing Facebook rewarded:', error);
            resolve({ success: false, reward: null });
          });
      } catch (error) {
        console.error('Error with Facebook rewarded:', error);
        resolve({ success: false, reward: null });
      }
    });
  }

  // AppLovin Ad Show Methods
  async showAppLovinInterstitial() {
    return new Promise(resolve => {
      try {
        if (!this.appLovinInterstitial) {
          this.loadAppLovinInterstitial();
          resolve(false);
          return;
        }

        this.appLovinInterstitial.showAd()
          .then(() => {
            console.log('AppLovin Interstitial ad shown');
            resolve(true);
          })
          .catch(error => {
            console.error('Error showing AppLovin interstitial:', error);
            resolve(false);
          });
      } catch (error) {
        console.error('Error with AppLovin interstitial:', error);
        resolve(false);
      }
    });
  }

  async showAppLovinRewarded() {
    return new Promise(resolve => {
      try {
        if (!this.appLovinRewarded || !this.appLovinRewarded.isReady()) {
          console.log('AppLovin Rewarded ad not ready');
          this.loadAppLovinRewarded();
          resolve({ success: false, reward: null });
          return;
        }

        let earned = false;

        // Set reward listener
        this.appLovinRewarded.setRewardListener({
          onUserRewarded: (reward) => {
            earned = true;
            console.log('AppLovin Rewarded ad completed with reward:', reward);
            resolve({ success: true, reward: { amount: 1, type: 'coins' }, network: 'applovin' });
          }
        });

        // Set display listener for close event
        this.appLovinRewarded.setAdDisplayListener({
          onAdHidden: () => {
            if (!earned) {
              console.log('AppLovin Rewarded ad closed without reward');
              resolve({ success: false, reward: null });
            }
          }
        });

        this.appLovinRewarded.showAd();
      } catch (error) {
        console.error('Error with AppLovin rewarded:', error);
        resolve({ success: false, reward: null });
      }
    });
  }

  // Update ad network from backend
  async updateAdNetwork() {
    try {
      await this.fetchAdConfig();
      
      // Reload ads for the new network
      switch (this.currentNetwork) {
        case AD_NETWORKS.GOOGLE:
          this.loadGoogleInterstitial();
          this.loadGoogleRewarded();
          break;
        case AD_NETWORKS.FACEBOOK:
          this.loadFacebookInterstitial();
          this.loadFacebookRewarded();
          break;
        case AD_NETWORKS.APPLOVIN:
          this.loadAppLovinInterstitial();
          this.loadAppLovinRewarded();
          break;
      }
      
      console.log('Ad network updated to:', this.currentNetwork);
    } catch (error) {
      console.error('Error updating ad network:', error);
    }
  }

  // Check if ads are ready
  isInterstitialReady() {
    if (!this.isInitialized || !this.currentNetwork) {
      return false;
    }
    
    switch (this.currentNetwork) {
      case AD_NETWORKS.GOOGLE:
        return this.googleInterstitial && this.googleInterstitial.loaded;
      case AD_NETWORKS.FACEBOOK:
        return this.facebookInterstitial !== null;
      case AD_NETWORKS.APPLOVIN:
        return this.appLovinInterstitial && this.appLovinInterstitial.isReady();
      default:
        return false;
    }
  }

  isRewardedReady() {
    if (!this.isInitialized || !this.currentNetwork) {
      return false;
    }
    
    switch (this.currentNetwork) {
      case AD_NETWORKS.GOOGLE:
        return this.googleRewarded && this.googleRewarded.loaded;
      case AD_NETWORKS.FACEBOOK:
        return this.facebookRewarded !== null;
      case AD_NETWORKS.APPLOVIN:
        return this.appLovinRewarded && this.appLovinRewarded.isReady();
      default:
        return false;
    }
  }

  isRewardedReady() {
    if (!this.isInitialized || !this.currentNetwork) {
      return false;
    }
    
    switch (this.currentNetwork) {
      case AD_NETWORKS.GOOGLE:
        return this.googleRewarded && this.googleRewarded.loaded;
      case AD_NETWORKS.FACEBOOK:
        return this.facebookRewarded !== null;
      case AD_NETWORKS.APPLOVIN:
        return this.appLovinRewarded && this.appLovinRewarded.isReady();
      default:
        return false;
    }
  }

  // Get current network info
  getCurrentNetwork() {
    return {
      network: this.currentNetwork,
      config: this.adConfig,
      isReady: {
        interstitial: this.isInterstitialReady(),
        rewarded: this.isRewardedReady(),
      },
    };
  }

  // Manually switch network (for testing)
  switchNetwork(network) {
    if (Object.values(AD_NETWORKS).includes(network)) {
      this.currentNetwork = network;
      console.log('Manually switched to network:', network);
      
      // Reload ads for new network
      this.updateAdNetwork();
    } else {
      console.error('Invalid network:', network);
    }
  }

  // Fallback mechanism - try different networks if current fails
  async showInterstitialWithFallback() {
    const networks = [this.currentNetwork, ...Object.values(AD_NETWORKS).filter(n => n !== this.currentNetwork)];
    
    for (const network of networks) {
      try {
        this.currentNetwork = network;
        const result = await this.showInterstitialAd();
        if (result) {
          console.log(`Interstitial ad shown successfully with ${network}`);
          return true;
        }
      } catch (error) {
        console.log(`Failed to show interstitial with ${network}, trying next...`);
      }
    }
    
    console.log('All interstitial ad networks failed');
    return false;
  }

  async showRewardedWithFallback() {
    const networks = [this.currentNetwork, ...Object.values(AD_NETWORKS).filter(n => n !== this.currentNetwork)];
    
    for (const network of networks) {
      try {
        this.currentNetwork = network;
        const result = await this.showRewardedAd();
        if (result.success) {
          console.log(`Rewarded ad shown successfully with ${network}`);
          return result;
        }
      } catch (error) {
        console.log(`Failed to show rewarded ad with ${network}, trying next...`);
      }
    }
    
    console.log('All rewarded ad networks failed');
    return { success: false, reward: null };
  }
}

// Singleton instance
const multiAdManager = new MultiAdManager();

export default multiAdManager;
