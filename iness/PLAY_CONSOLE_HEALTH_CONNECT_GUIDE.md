# Play Console Health Connect Permission Declarations

## Where to Find This in Play Console

1. Go to **Google Play Console**
2. Select your app: **iness**
3. Navigate to: **Policy** → **App content** → **Health Connect permissions**
4. You'll see two permissions that need declarations:
   - **StepsCadence/Steps**
   - **SleepSession**

## For Each Permission, Fill Out:

### StepsCadence/Steps Permission

#### Permission Purpose (Required):
```
The iness fitness app requests read access to Steps data from Health Connect to automatically sync users' daily step count. This feature eliminates the need for manual data entry and provides users with accurate, real-time step tracking in their fitness dashboard.
```

#### User Benefits (Required):
```
- Automatic step tracking: Users' daily steps are automatically displayed in the app without manual entry
- Accurate data: Steps are synced directly from Health Connect, ensuring accuracy
- Convenience: Users can view their step count alongside other fitness metrics in one place
- Time-saving: No need to manually enter step data every day
```

#### How it's used in-app (Required):
```
When users enable Health Connect sync in Settings, the app reads their daily step count from Health Connect and displays it in the fitness tracking dashboard. The data is synced automatically in the background and combined with other fitness metrics to provide a comprehensive health overview. The app only reads data and never writes to Health Connect.
```

---

### SleepSession Permission

#### Permission Purpose (Required):
```
The iness fitness app requests read access to SleepSession data from Health Connect to automatically sync users' sleep duration. This feature allows users to track their sleep patterns alongside their fitness activities without manual data entry.
```

#### User Benefits (Required):
```
- Automatic sleep tracking: Users' sleep duration is automatically displayed in the app without manual entry
- Complete health picture: Sleep data is combined with fitness metrics to show overall health status
- Accurate data: Sleep data is synced directly from Health Connect, ensuring accuracy
- Convenience: Users can view their sleep duration alongside other health metrics in one place
```

#### How it's used in-app (Required):
```
When users enable Health Connect sync in Settings, the app reads their sleep duration from Health Connect and displays it in the fitness tracking dashboard. The data is synced automatically in the background and helps users understand the relationship between sleep and their fitness activities. The app only reads data and never writes to Health Connect.
```

---

## Important Points to Emphasize:

1. **Read-only access**: The app ONLY reads data, never writes
2. **User control**: Users can enable/disable at any time
3. **Optional feature**: Not required for app functionality
4. **Clear purpose**: Automatic syncing to eliminate manual entry
5. **User benefit**: Convenience and accuracy

## After Submitting:

1. Wait for Google's review (usually 1-3 days)
2. If rejected again, check the feedback and refine the descriptions
3. Make sure your app description in Play Store also mentions Health Connect integration

## App Store Listing Update:

Also update your **Play Store listing** → **Store presence** → **Main store listing**:

### Short Description:
Add: "with Health Connect integration"

### Full Description:
Add this section:
```
Health Connect Integration:
- Automatically sync your daily steps from Health Connect
- Automatically sync your sleep duration from Health Connect
- View all your health data in one place
- No manual data entry required

The app requests read-only access to Steps and Sleep data from Health Connect to provide automatic tracking. You can enable or disable this feature at any time in Settings.
```
