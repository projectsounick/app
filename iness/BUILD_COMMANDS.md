# Android Build/Assemble Commands

## Quick Commands

### Debug APK (for testing)
```bash
cd app/iness/android
./gradlew assembleDebug
```
Output: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK (requires signing)
```bash
cd app/iness/android
./gradlew assembleRelease
```
Output: `android/app/build/outputs/apk/release/app-release.apk`

### Release AAB (for Play Store)
```bash
cd app/iness/android
./gradlew bundleRelease
```
Output: `android/app/build/outputs/bundle/release/app-release.aab`

## Using EAS Build (Recommended)

### Development Build
```bash
cd app/iness
eas build --platform android --profile development
```

### Preview Build
```bash
cd app/iness
eas build --platform android --profile preview
```

### Production Build (Play Store)
```bash
cd app/iness
eas build --platform android --profile production
```

## Clean Build
```bash
cd app/iness/android
./gradlew clean
./gradlew assembleDebug
```

## Install on Connected Device
```bash
cd app/iness/android
./gradlew installDebug
```

## Build with Specific Variant
```bash
cd app/iness/android
./gradlew assembleDebug --variant=debug
```
