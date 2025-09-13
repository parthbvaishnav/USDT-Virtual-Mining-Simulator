# Backend Ad Configuration API

## Endpoint: GET /api/mtc/getAdConfig

### Expected Response Format:

```json
{
  "status": "success",
  "data": {
    "activeNetwork": "google",
    "fallbackEnabled": true,
    "refreshInterval": 300000,
    "networks": {
      "google": {
        "enabled": true,
        "priority": 1,
        "interstitialId": "ca-app-pub-XXXXXXXX/XXXXXXXXX",
        "rewardedId": "ca-app-pub-XXXXXXXX/XXXXXXXXX",
        "bannerIds": {
          "small": "ca-app-pub-XXXXXXXX/XXXXXXXXX",
          "large": "ca-app-pub-XXXXXXXX/XXXXXXXXX"
        }
      },
      "facebook": {
        "enabled": true,
        "priority": 2,
        "interstitialId": "XXXXXXXXXXXXXXX_XXXXXXXXXXXXXXX",
        "rewardedId": "XXXXXXXXXXXXXXX_XXXXXXXXXXXXXXX",
        "bannerIds": {
          "small": "XXXXXXXXXXXXXXX_XXXXXXXXXXXXXXX",
          "large": "XXXXXXXXXXXXXXX_XXXXXXXXXXXXXXX"
        }
      },
      "applovin": {
        "enabled": false,
        "priority": 3,
        "sdkKey": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "interstitialId": "XXXXXXXXXXXXXXXX",
        "rewardedId": "XXXXXXXXXXXXXXXX",
        "bannerIds": {
          "small": "XXXXXXXXXXXXXXXX",
          "large": "XXXXXXXXXXXXXXXX"
        }
      }
    },
    "adFrequency": {
      "interstitial": {
        "minInterval": 60000,
        "maxPerSession": 5
      },
      "rewarded": {
        "minInterval": 30000,
        "maxPerSession": 10
      }
    }
  },
  "message": "success"
}
```

### Configuration Fields:

- **activeNetwork**: Primary ad network to use ("google", "facebook", "applovin")
- **fallbackEnabled**: Whether to try other networks if primary fails
- **refreshInterval**: How often to check for config updates (milliseconds)
- **networks**: Configuration for each ad network
  - **enabled**: Whether this network is active
  - **priority**: Order to try networks (1 = highest priority)
  - **Ad Unit IDs**: Specific IDs for each ad type
- **adFrequency**: Limits on how often ads can be shown
  - **minInterval**: Minimum time between ads of same type
  - **maxPerSession**: Maximum ads per app session

### Dynamic Network Switching:

The app will automatically switch between networks based on:
1. Backend configuration priority
2. Ad availability 
3. Network performance
4. Fallback mechanism if primary network fails

### Testing:

Use the AdDebugModal component to test different networks and monitor ad performance in development.
