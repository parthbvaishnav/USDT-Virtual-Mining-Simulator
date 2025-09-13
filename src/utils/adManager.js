import mobileAds, {
  InterstitialAd,
  RewardedAd,
  TestIds,
  AdEventType,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';

class AdManager {
  constructor() {
    this.interstitialAd = null;
    this.rewardedAd = null;
    this.isTestMode = __DEV__; // Use test ads in development

    this.adUnitIds = {
      interstitial: this.isTestMode
        ? TestIds.INTERSTITIAL
        : 'ca-app-pub-3940256099942544/1033173712',
      rewarded: this.isTestMode
        ? TestIds.REWARDED
        : 'ca-app-pub-3940256099942544/5224354917',
    };

    this.initializeAds();
  }

  async initializeAds() {
    try {
      await mobileAds().initialize();
      console.log('AdMob initialized successfully');
      this.loadInterstitialAd();
      this.loadRewardedAd();
    } catch (error) {
      console.error('Failed to initialize AdMob:', error);
    }
  }

  loadInterstitialAd() {
    try {
      this.interstitialAd = InterstitialAd.createForAdRequest(
        this.adUnitIds.interstitial
      );

      this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
        console.log('Interstitial ad loaded');
      });

      this.interstitialAd.addAdEventListener(AdEventType.ERROR, error => {
        console.error('Interstitial ad failed to load:', error);
        setTimeout(() => this.loadInterstitialAd(), 5000);
      });

      this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('Interstitial ad closed');
        this.loadInterstitialAd();
      });

      this.interstitialAd.load();
    } catch (error) {
      console.error('Error creating interstitial ad:', error);
    }
  }

  loadRewardedAd() {
    try {
      this.rewardedAd = RewardedAd.createForAdRequest(this.adUnitIds.rewarded);

      this.rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, reward => {
        console.log('Rewarded ad loaded with reward:', reward);
      });

      this.rewardedAd.addAdEventListener(AdEventType.ERROR, error => {
        console.error('Rewarded ad failed to load:', error);
        setTimeout(() => this.loadRewardedAd(), 5000);
      });

      this.rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('Rewarded ad closed');
        this.loadRewardedAd(); // reload for next time
      });

      this.rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, reward => {
        console.log('User earned reward:', reward);
      });

      this.rewardedAd.load();
    } catch (error) {
      console.error('Error creating rewarded ad:', error);
    }
  }

  async showInterstitialAd() {
    try {
      if (this.interstitialAd && this.interstitialAd.loaded) {
        await this.interstitialAd.show();
        return true;
      } else {
        console.log('Interstitial ad not loaded yet');
        this.loadInterstitialAd();
        return false;
      }
    } catch (error) {
      console.error('Error showing interstitial ad:', error);
      return false;
    }
  }

  async showRewardedAd() {
    return new Promise(resolve => {
      try {
        if (!this.rewardedAd || !this.rewardedAd.loaded) {
          console.log('Rewarded ad not loaded yet');
          this.loadRewardedAd();
          resolve({ success: false, reward: null });
          return;
        }

        let earned = false;

        // Listen for reward
        const rewardListener = this.rewardedAd.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD,
          reward => {
            console.log('User earned reward:', reward);
            earned = true;
            resolve({ success: true, reward });
          }
        );

        // Listen for ad closed
        const closedListener = this.rewardedAd.addAdEventListener(
          AdEventType.CLOSED,
          () => {
            if (!earned) resolve({ success: false, reward: null });
            // Remove listeners
            rewardListener();
            closedListener();
          }
        );

        this.rewardedAd.show();
      } catch (error) {
        console.error('Error showing rewarded ad:', error);
        resolve({ success: false, reward: null });
      }
    });
  }

  isInterstitialReady() {
    return this.interstitialAd && this.interstitialAd.loaded;
  }

  isRewardedReady() {
    return this.rewardedAd && this.rewardedAd.loaded;
  }
}

// Singleton instance
const adManager = new AdManager();

export default adManager;
