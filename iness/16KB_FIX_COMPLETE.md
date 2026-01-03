# Complete 16 KB Page Size Fix for Play Store

## Changes Made

### 1. ✅ Upgraded NDK to r27.1+
- **app.json**: Updated NDK from `26.1.10909125` to `27.1.12297006`
- **android/build.gradle**: Updated NDK version to match
- **Why**: NDK r27+ supports 16 KB page size with proper configuration

### 2. ✅ Added CMake Configuration
- Added `ANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES=ON` flag
- This enables 16 KB ELF alignment for native libraries

### 3. ✅ Existing Configuration (Already Correct)
- `expo.useLegacyPackaging=false` ✅
- `useLegacyPackaging = false` in build.gradle ✅
- Target SDK: 35 (Android 15) ✅

## Next Steps

### 1. Install NDK r27.1

**Using Android Studio:**
1. Open Android Studio
2. Tools → SDK Manager
3. SDK Tools tab
4. Check "Show Package Details"
5. Expand "NDK (Side by side)"
6. Check version `27.1.12297006`
7. Apply and install

**Using Command Line:**
```bash
# Check if you have sdkmanager
which sdkmanager

# Install NDK r27.1
sdkmanager "ndk;27.1.12297006"
```

### 2. Clean and Rebuild

**Important**: You MUST clean and rebuild after these changes:

```bash
cd android

# Clean all previous builds
./gradlew clean

# Remove build folders
rm -rf app/build
rm -rf build

# Rebuild release bundle
./gradlew bundleRelease
```

**Using EAS Build:**
```bash
# Clean cache and rebuild
eas build --platform android --profile production --clear-cache
```

### 3. Verify the Bundle

After building, verify alignment:

```bash
# Install bundletool if not installed
# Download from: https://github.com/google/bundletool/releases

# Check alignment
bundletool dump config --bundle=android/app/build/outputs/bundle/release/app-release.aab | grep alignment
```

You should see: `PAGE_ALIGNMENT_16K`

### 4. Upload to Play Console

1. Upload the new `.aab` file
2. Wait for processing (30-60 minutes)
3. Check for any remaining warnings
4. The "page60kb" error should be resolved

## What Changed

### Before (NDK r26):
- Required manual linker flags for 16 KB alignment
- More complex configuration needed
- Some libraries might not align properly

### After (NDK r27.1):
- ✅ Native libraries compile with 16 KB alignment by default
- ✅ Proper ELF segment alignment
- ✅ Compatible with AGP 8.5.1+ requirements
- ✅ Works with uncompressed shared libraries

## Verification Checklist

- [ ] NDK r27.1.12297006 installed
- [ ] Clean build completed
- [ ] Bundle built successfully
- [ ] bundletool shows `PAGE_ALIGNMENT_16K`
- [ ] Uploaded to Play Console
- [ ] No "page60kb" error
- [ ] No 16 KB page size warnings

## Troubleshooting

### If bundletool shows PAGE_ALIGNMENT_4K:
1. Verify NDK version: `ls $ANDROID_HOME/ndk/`
2. Check build.gradle has correct NDK version
3. Clean and rebuild: `./gradlew clean bundleRelease`

### If error persists:
1. Check Play Console for specific error details
2. Verify AGP version (should be 8.5.1+)
3. Check all native dependencies are updated
4. Review Google's 16 KB page size documentation

## Notes

- This fix is **backward compatible** with 4 KB page size devices
- No code changes required
- All React Native and Expo libraries support 16 KB pages
- The app will work on both 4 KB and 16 KB devices

## References

- [Google's 16 KB Page Size Guide](https://developer.android.com/guide/practices/page-sizes)
- [NDK Release Notes](https://developer.android.com/ndk/downloads/revision_history)
- [AGP 8.5.1 Release Notes](https://developer.android.com/build/releases/gradle-plugin)










