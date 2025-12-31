# Fix for Play Store "page60kb" Error (16 KB Page Size Requirement)

## Issue
Google Play Store is rejecting your app bundle with a "page60kb" error. This is related to the **16 KB memory page size requirement** for apps targeting Android 15+ (API 35).

## Solution

### 1. Verify Current Configuration ✅

Your configuration is already mostly correct:
- ✅ `expo.useLegacyPackaging=false` in `gradle.properties`
- ✅ NDK Version: `26.1.10909125` (supports 16 KB)
- ✅ Target SDK: `35` (Android 15)
- ✅ `useLegacyPackaging = false` in `build.gradle`

### 2. Clean and Rebuild

**Important**: You MUST rebuild your app bundle after these changes:

```bash
# Navigate to android folder
cd android

# Clean previous builds
./gradlew clean

# Build new release bundle
./gradlew bundleRelease

# The bundle will be at:
# android/app/build/outputs/bundle/release/app-release.aab
```

### 3. Using EAS Build (Recommended)

If you're using EAS Build:

```bash
# Clean local build cache
eas build:configure

# Build production bundle
eas build --platform android --profile production
```

### 4. Verify the Bundle

After building, verify the bundle:

1. **Check bundle size**: Should be reasonable (not unusually large)
2. **Upload to Play Console**: The error should be resolved
3. **Use Play Console's App Bundle Explorer**: Check for any warnings

### 5. Additional Checks

#### Verify NDK Version
Make sure you have NDK 26.1.10909125 installed:
```bash
# Check installed NDK versions
ls $ANDROID_HOME/ndk/
```

If not installed, install it via Android Studio SDK Manager or:
```bash
sdkmanager "ndk;26.1.10909125"
```

#### Check Native Libraries
Your app uses native libraries (React Native, Hermes, etc.). These should be automatically aligned with AGP 8.1+ when `useLegacyPackaging=false`.

### 6. If Error Persists

If you still get the error after rebuilding:

1. **Check Play Console Error Details**: 
   - Go to Play Console → Your App → Release → Production
   - Check the exact error message and which libraries are causing issues

2. **Update Dependencies**:
   ```bash
   npm update
   cd android
   ./gradlew clean
   ```

3. **Verify AGP Version**:
   Check `android/build.gradle` - should use AGP 8.1+ (automatically handled by Expo)

4. **Check for Third-Party Native Libraries**:
   - Review all native dependencies
   - Ensure they support 16 KB page sizes
   - Update to latest versions if needed

### 7. Testing

Before uploading to Play Store:

1. **Test on Android 15 Emulator**:
   ```bash
   # Create Android 15 emulator in Android Studio
   # Or use command line:
   avdmanager create avd -n test15 -k "system-images;android-35;google_apis;x86_64"
   ```

2. **Install and Test**:
   ```bash
   # Install release APK
   adb install android/app/build/outputs/apk/release/app-release.apk
   
   # Test all app functionality
   ```

### 8. Common Issues

#### Issue: "Native library not aligned"
**Solution**: Ensure `useLegacyPackaging=false` in both:
- `gradle.properties`: `expo.useLegacyPackaging=false`
- `build.gradle`: `packaging { jniLibs { useLegacyPackaging = false } }`

#### Issue: "NDK version incompatible"
**Solution**: Use NDK 26.1.10909125 or later (already configured)

#### Issue: "AGP version too old"
**Solution**: Expo automatically uses compatible AGP version (8.1+)

### 9. Final Steps

1. ✅ Clean build: `cd android && ./gradlew clean`
2. ✅ Rebuild bundle: `./gradlew bundleRelease`
3. ✅ Upload to Play Console
4. ✅ Wait for processing (may take 30-60 minutes)
5. ✅ Check for any remaining warnings

## Notes

- This fix is **backward compatible** with 4 KB page size devices
- No code changes required - only build configuration
- All React Native and Expo native libraries support 16 KB pages
- The error should be resolved after rebuilding with the correct configuration

## Verification

After uploading to Play Console, check:
- ✅ No "16 KB page size" warnings
- ✅ No "page60kb" errors
- ✅ App bundle accepted successfully
- ✅ Ready for review

