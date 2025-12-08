# Android Release Checklist for Google Play Store

## ✅ Required Changes Made

### 1. Target SDK Version
- ✅ **Current**: API 35 (Android 15)
- ✅ **Status**: Compliant (required for new apps after August 31, 2025)

### 2. Permissions Updated
- ✅ **Media Permissions**: Added Android 13+ (API 33+) scoped media permissions
  - `READ_MEDIA_IMAGES`
  - `READ_MEDIA_VIDEO`
  - `READ_MEDIA_AUDIO`
- ✅ **Legacy Permissions**: Added `maxSdkVersion` for deprecated storage permissions
  - `READ_EXTERNAL_STORAGE` (maxSdkVersion: 32)
  - `WRITE_EXTERNAL_STORAGE` (maxSdkVersion: 29)
- ✅ **Camera Permission**: Explicitly declared
- ✅ **Audio Permission**: Already declared

### 3. Version Updates
- ✅ **App Version**: Updated to 1.0.35
- ✅ **Version Code**: Updated to 24
- ✅ **Build Number**: Updated to 1.0.35

### 4. Privacy Policy
- ✅ **Privacy Policy URL**: Added to app.json (`https://iness.fitness/policy`)

## 📋 Google Play Console Requirements

### Data Safety Section (Required)
You must complete the Data Safety section in Google Play Console:

1. **Go to**: Google Play Console → Your App → Policy → App content → Data safety

2. **Declare Data Collection**:
   - ✅ Personal info: Name, Email, Phone number
   - ✅ Health & fitness data
   - ✅ Photos and videos (for profile pictures)
   - ✅ Audio files (if recording features)

3. **Declare Data Sharing**:
   - Specify if data is shared with third parties
   - List data shared with service providers

4. **Security Practices**:
   - Data encryption in transit
   - Data encryption at rest (if applicable)

### Permission Justifications (Required)
In Google Play Console, provide justifications for sensitive permissions:

1. **Camera**:
   - Purpose: "Allow users to upload profile pictures and share progress photos"
   - Usage: "Only used when user explicitly chooses to take/upload photos"

2. **Storage/Media**:
   - Purpose: "Allow users to save workout plans, progress images, and download content"
   - Usage: "Only accessed when user explicitly saves or downloads content"

3. **Microphone/Audio**:
   - Purpose: "Allow users to record audio for video content or voice notes"
   - Usage: "Only used when user explicitly records audio"

4. **Notifications**:
   - Purpose: "Send workout reminders, progress updates, and important notifications"
   - Usage: "User can disable in app settings"

### Privacy Policy Requirements
- ✅ **URL**: Must be publicly accessible
- ✅ **Content**: Must include:
  - What data you collect
  - How you use the data
  - How you share the data
  - User rights (data deletion, access, etc.)
  - Contact information

### App Content Rating
Complete the content rating questionnaire:
- Age rating
- Content descriptors
- Interactive elements

## 🔧 Additional Recommendations

### 1. Test on Android 15 Devices
- Test on devices running Android 15 (API 35)
- Verify all permissions work correctly
- Test scoped storage functionality

### 2. 16KB Page Size Compatibility
- ✅ **Current NDK**: 26.1.10909125 (should support 16KB pages)
- **Action**: Test app on devices with 16KB page sizes
- Use Android Studio's 16KB page size checks

### 3. Runtime Permissions
Ensure your app properly requests runtime permissions:
- Camera
- Storage/Media
- Microphone
- Notifications (Android 13+)

### 4. Foreground Services
If using foreground services:
- Use specific service types (e.g., `mediaProcessing`)
- Respect runtime limits
- Consider `WorkManager` for background tasks

### 5. File Integrity (Optional)
If handling sensitive documents:
- Consider implementing `FileIntegrityManager` API
- Verify file authenticity using `fs-verity`

## 📝 Pre-Release Checklist

Before submitting to Google Play:

- [ ] Test app on Android 15 (API 35) device
- [ ] Complete Data Safety section in Play Console
- [ ] Add permission justifications in Play Console
- [ ] Verify privacy policy URL is accessible
- [ ] Test all permission flows
- [ ] Test scoped storage functionality
- [ ] Complete content rating questionnaire
- [ ] Update app screenshots and descriptions
- [ ] Test app bundle build (`eas build --platform android --profile production`)
- [ ] Review and accept Play Console policies

## 🚀 Build Command

To build for production:
```bash
eas build --platform android --profile production
```

## 📚 Resources

- [Android 15 Migration Guide](https://developer.android.com/about/versions/15/migration)
- [Google Play Data Safety](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Permission Declarations](https://developer.android.com/training/permissions/declaring)

