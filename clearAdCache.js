// Run this to clear ad cache and test fresh API response
import AsyncStorage from '@react-native-async-storage/async-storage';
import adConfigService from './src/services/adConfigService';

async function clearCacheAndTest() {
  try {
    console.log('Clearing ad cache...');
    
    // Clear all ad-related cache
    await AsyncStorage.removeItem('adConfig');
    await adConfigService.clearCache();
    
    console.log('Cache cleared. Fetching fresh config...');
    
    // Force fresh API call
    const config = await adConfigService.refreshConfig();
    
    console.log('Fresh config result:', config);
    
    if (!config) {
      console.log('✅ SUCCESS: No config returned - ads disabled as expected');
    } else {
      console.log('❌ ISSUE: Config returned when activeNetwork is empty');
      console.log('Config details:', JSON.stringify(config, null, 2));
    }
    
  } catch (error) {
    console.error('Error during cache clear test:', error);
  }
}

// Export for manual testing
export default clearCacheAndTest;

// Uncomment to run immediately
// clearCacheAndTest();
