import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AdConfigService {
  constructor() {
    this.cachedConfig = null;
    this.lastFetchTime = null;
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes cache
  }

  // Fetch ad configuration from backend
  async fetchAdConfig() {
    try {
      // Check if we have cached config that's still valid
      if (this.cachedConfig && this.lastFetchTime && 
          (Date.now() - this.lastFetchTime) < this.cacheExpiry) {
        console.log('Using cached ad config');
        return this.cachedConfig;
      }

      console.log('Fetching fresh ad config from backend...');
      // const response = await axios.get('https://peradox.in/api/mtc/getAdConfig');
       const response = await axios.post('https://peradox.in/api/usdtsmiulationad', {
        packgname: "com.usdt.mining.virtual.simulator"
      });
      
      if (response.data && response.data.status === 'success') {
        const config = this.transformApiResponse(response.data);
        
        // If activeNetwork is empty, return null immediately
        if (!config) {
          console.log('activeNetwork is empty - ads disabled by API');
          this.cachedConfig = null;
          await AsyncStorage.removeItem('adConfig');
          return null;
        }
        
        // Cache the config
        this.cachedConfig = config;
        this.lastFetchTime = Date.now();
        
        // Store in AsyncStorage for offline access
        await AsyncStorage.setItem('adConfig', JSON.stringify(config));
        
        console.log('Ad config fetched successfully:', config);
        return config;
      } else {
        throw new Error('Invalid response from ad config API');
      }
    } catch (error) {
      console.error('Error fetching ad config:', error);
      
      // Try to load from AsyncStorage as fallback
      const cachedConfig = await this.loadCachedConfig();
      if (cachedConfig) {
        console.log('Using stored ad config as fallback');
        // Check if cached config also has empty activeNetwork
        if (!cachedConfig.activeNetwork || cachedConfig.activeNetwork.trim() === '') {
          console.log('Cached config also has empty activeNetwork - ads disabled');
          return null;
        }
        return cachedConfig;
      }
      
      // If no config available, return null to indicate no ads
      console.log('No ad config available - ads will be disabled');
      return null;
    }
  }

  // Transform API response to internal format
  transformApiResponse(apiResponse) {
    console.log('Raw API response:', JSON.stringify(apiResponse));
    
    const ads = apiResponse.ads;
    
    if (!ads) {
      console.log('No ads object in API response');
      return null;
    }
    
    // If activeNetwork is empty or null, return null to disable ads
    if (!ads.activeNetwork || ads.activeNetwork.trim() === '') {
      console.log('activeNetwork is empty or null - ads disabled');
      return null;
    }

    console.log('activeNetwork from API:', ads.activeNetwork);

    const config = {
      activeNetwork: ads.activeNetwork,
      networks: {
        google: {
          enabled: ads.activeNetwork === 'google',
          interstitialId: ads.google?.interstitialId || null,
          rewardedId: ads.google?.rewardedId || null
        },
        facebook: {
          enabled: ads.activeNetwork === 'facebook',
          interstitialId: ads.facebook?.interstitialId || null,
          rewardedId: ads.facebook?.rewardedId || null
        },
        applovin: {
          enabled: ads.activeNetwork === 'applovin',
          sdkKey: ads.applovin?.sdkKey || null,
          interstitialId: ads.applovin?.interstitialId || null,
          rewardedId: ads.applovin?.rewardedId || null
        }
      }
    };
    
    console.log('Transformed config:', JSON.stringify(config));
    return config;
  }

  // Load cached config from AsyncStorage
  async loadCachedConfig() {
    try {
      const stored = await AsyncStorage.getItem('adConfig');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading cached ad config:', error);
    }
    return null;
  }

  // No default configuration - ads disabled if API fails
  getDefaultConfig() {
    console.log('No default config - ads will be disabled');
    return null;
  }

  // Get network priority order
  getNetworkPriorityOrder() {
    if (!this.cachedConfig) {
      return ['google', 'facebook', 'applovin'];
    }

    const networks = Object.entries(this.cachedConfig.networks || {})
      .filter(([_, config]) => config.enabled)
      .sort(([_, a], [__, b]) => (a.priority || 999) - (b.priority || 999))
      .map(([network, _]) => network);

    return networks.length > 0 ? networks : ['google'];
  }

  // Get specific network config
  getNetworkConfig(network) {
    if (!this.cachedConfig) {
      const defaultConfig = this.getDefaultConfig();
      return defaultConfig.networks[network];
    }

    return this.cachedConfig.networks?.[network] || null;
  }

  // Check if network is enabled
  isNetworkEnabled(network) {
    const config = this.getNetworkConfig(network);
    return config?.enabled || false;
  }

  // Get active network from config
  getActiveNetwork() {
    if (!this.cachedConfig) {
      return 'google';
    }

    return this.cachedConfig.activeNetwork || 'google';
  }

  // Force refresh config
  async refreshConfig() {
    this.cachedConfig = null;
    this.lastFetchTime = null;
    await AsyncStorage.removeItem('adConfig'); // Clear stored cache too
    return await this.fetchAdConfig();
  }

  // Clear cached config
  async clearCache() {
    this.cachedConfig = null;
    this.lastFetchTime = null;
    await AsyncStorage.removeItem('adConfig');
  }
}

// Singleton instance
const adConfigService = new AdConfigService();

export default adConfigService;
