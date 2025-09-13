# Firebase Analytics Setup Instructions

This document provides step-by-step instructions to complete the Firebase Analytics setup for your MTC Mining app.

## Prerequisites

✅ **Already Completed:**
- Firebase SDK packages installed (`@react-native-firebase/app` and `@react-native-firebase/analytics`)
- Android and iOS build configurations updated
- Analytics service created and integrated into key screens
- User authentication, mining, rewards, and conversion tracking implemented

## Required Setup Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "MTC Mining Simulation")
4. Enable Google Analytics for your project
5. Choose or create a Google Analytics account
6. Click "Create project"

### 2. Add Android App

1. In Firebase Console, click "Add app" and select Android
2. Enter your Android package name: `com.mtcminingsimulation`
3. Enter app nickname (optional): "MTC Mining Android"
4. Enter SHA-1 certificate fingerprint (for release builds)
5. Click "Register app"
6. Download the `google-services.json` file
7. **Replace** the placeholder file at `android/app/google-services.json` with your downloaded file

### 3. Add iOS App

1. In Firebase Console, click "Add app" and select iOS
2. Enter your iOS bundle ID: `com.mtcminingsimulation`
3. Enter app nickname (optional): "MTC Mining iOS"
4. Enter App Store ID (optional)
5. Click "Register app"
6. Download the `GoogleService-Info.plist` file
7. **Replace** the placeholder file at `ios/MTCMiningSimulation/GoogleService-Info.plist` with your downloaded file

### 4. Update Configuration Files

Replace the placeholder values in your downloaded configuration files with actual Firebase project data:

**For Android (`google-services.json`):**
- `project_number`: Your Firebase project number
- `project_id`: Your Firebase project ID
- `mobilesdk_app_id`: Your Android app ID
- `api_key`: Your Android API key
- `client_id`: Your OAuth client ID

**For iOS (`GoogleService-Info.plist`):**
- `PROJECT_ID`: Your Firebase project ID
- `GOOGLE_APP_ID`: Your iOS app ID
- `API_KEY`: Your iOS API key
- `GCM_SENDER_ID`: Your project number
- `CLIENT_ID`: Your OAuth client ID

### 5. Build and Test

1. Clean your project:
   ```bash
   # For Android
   cd android && ./gradlew clean && cd ..
   
   # For iOS
   cd ios && rm -rf Pods && pod install && cd ..
   ```

2. Rebuild your app:
   ```bash
   # For Android
   npx react-native run-android
   
   # For iOS
   npx react-native run-ios
   ```

3. Test analytics in Firebase Console:
   - Go to Analytics > Events in Firebase Console
   - Use your app and perform actions (login, mining, rewards)
   - Events should appear in the console within 24 hours (real-time debugging available)

## Analytics Events Implemented

The following analytics events are automatically tracked:

### Authentication Events
- `login` - User login with method parameter
- `sign_up` - User registration with method parameter
- User properties: name, email, verification status, social type

### Mining Events
- `mining_started` - When user starts mining
- `mining_completed` - When mining session completes with duration and earnings
- Screen view tracking for MiningScreen

### Reward Events
- `daily_reward_claimed` - Daily bonus collection
- `flip_reward_claimed` - Flip game reward collection
- `mystery_box_claimed` - Mystery box reward collection

### Conversion Events
- `coin_conversion` - Super Coins to USDT conversion
- Screen view tracking for ConvertCoinScreen

### App Lifecycle Events
- `app_opened` - App launch and foreground
- `app_backgrounded` - App goes to background
- Screen view tracking for all major screens

### Referral Events
- `referral_shared` - When user shares referral code

## Debugging Analytics

### Enable Debug Mode (Development)

**For Android:**
```bash
adb shell setprop debug.firebase.analytics.app com.mtcminingsimulation
```

**For iOS:**
Add `-FIRAnalyticsDebugEnabled` to your scheme's launch arguments in Xcode.

### View Real-time Events

1. Go to Firebase Console > Analytics > DebugView
2. Enable debug mode on your device
3. Use the app - events will appear in real-time

## Troubleshooting

### Common Issues

1. **Events not appearing:**
   - Ensure configuration files are properly replaced with real Firebase data
   - Check that Analytics is enabled in Firebase Console
   - Wait up to 24 hours for events to appear (use DebugView for real-time)

2. **Build errors:**
   - Clean and rebuild project
   - Ensure all Firebase dependencies are properly installed
   - Check that configuration files are in correct locations

3. **iOS build issues:**
   - Run `cd ios && pod install`
   - Ensure GoogleService-Info.plist is added to Xcode project

### Support

If you encounter issues:
1. Check Firebase Console for any error messages
2. Review React Native Firebase documentation: https://rnfirebase.io/
3. Check device logs for Firebase-related errors

## Security Notes

- Never commit real Firebase configuration files to public repositories
- Use different Firebase projects for development and production
- Regularly review Analytics data retention settings
- Consider implementing user consent for analytics tracking per GDPR requirements

---

**Status:** Firebase Analytics integration is complete and ready for production use once you replace the placeholder configuration files with your actual Firebase project data.
