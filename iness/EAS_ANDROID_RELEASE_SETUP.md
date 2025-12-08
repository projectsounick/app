# EAS Build - Android Release App Bundle Setup

## Your Keystore Info (from gradle.properties):
- **Keystore File**: `surjayan_iness_keystore.bak.jks`
- **Key Alias**: `a598efdb0aa4ff0255d3ad8c70777bf0`
- **Store Password**: `9a047b592e617ba0ac2090d4d7691d84`
- **Key Password**: `4512af596603a5fc1515995c5f93ac1d`

## Step 1: Upload Keystore to EAS

Run this command to configure your Android credentials:

```bash
eas credentials
```

Then:
1. Select **Android**
2. Select **production** (or preview/production)
3. Choose **Set up new credentials**
4. Choose **Upload a keystore**
5. Enter the path: `android/app/surjayan_iness_keystore.bak.jks`
6. Enter the credentials when prompted:
   - Key alias: `a598efdb0aa4ff0255d3ad8c70777bf0`
   - Store password: `9a047b592e617ba0ac2090d4d7691d84`
   - Key password: `4512af596603a5fc1515995c5f93ac1d`

EAS will store these securely and use them for all production builds.

## Step 2: Build Release App Bundle

```bash
# For production release
eas build --platform android --profile production

# Or for preview/testing
eas build --platform android --profile preview
```

The app-bundle will be generated and uploaded to EAS servers. You can download it from the EAS dashboard.

## Step 3: Download and Upload to Play Store

1. Go to: https://expo.dev/accounts/surjayan/projects/iness/builds
2. Download the `.aab` file
3. Upload to Google Play Console

---

## Option 2: Local Build (Alternative)

If you prefer to build locally:

```bash
cd android
./gradlew bundleRelease
```

The app-bundle will be at:
`android/app/build/outputs/bundle/release/app-release.aab`

**Note**: Make sure the keystore file is in `android/app/` directory (which it already is).

