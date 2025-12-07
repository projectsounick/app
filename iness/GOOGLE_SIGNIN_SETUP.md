# Google Sign-In Setup Guide for Local Testing

## Step 1: Create OAuth 2.0 Credentials in Google Cloud Console

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project (or create a new one)

2. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
   - Also enable "Google Identity Toolkit API"

3. **Create OAuth 2.0 Client ID**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - If prompted, configure the OAuth consent screen first:
     - User Type: External (for testing)
     - App name: Your app name
     - Support email: Your email
     - Developer contact: Your email
     - Save and continue through the scopes (you can skip for now)

4. **Create Web Application Client ID** (for Expo)
   - Application type: **Web application**
   - Name: "Iness Fitness - Web Client"
   - **Authorized redirect URIs**: Add these:
     ```
     exp://localhost:8081
     exp://127.0.0.1:8081
     exp://192.168.*:8081
     myapp://
     ```
   - Click "Create"
   - **Copy the Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)

5. **Create Android Client ID** (optional, for Android testing)
   - Application type: **Android**
   - Name: "Iness Fitness - Android"
   - Package name: `com.iness.fitness` (from your app.json)
   - SHA-1 certificate fingerprint: Get it using:
     ```bash
     cd android
     ./gradlew signingReport
     ```
     Look for SHA1 in the output under "Variant: debug"
   - Click "Create"

6. **Create iOS Client ID** (optional, for iOS testing)
   - Application type: **iOS**
   - Name: "Iness Fitness - iOS"
   - Bundle ID: `com.iness.fitness` (from your app.json)
   - Click "Create"

## Step 2: Configure Frontend (Expo App)

### Option A: Using .env file (Recommended for Development)

1. **Create `.env` file** in `/app/iness/`:
   ```env
   EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-web-client-id-here.apps.googleusercontent.com
   ```

2. **Restart Expo dev server**:
   ```bash
   npx expo start --clear
   ```

### Option B: Using app.json

1. **Update `app.json`**:
   ```json
   "extra": {
     "googleClientId": "your-web-client-id-here.apps.googleusercontent.com"
   }
   ```

2. **Restart Expo dev server**

## Step 3: Configure Backend

1. **Set Environment Variable** in your Azure Functions or local backend:
   ```env
   GOOGLE_CLIENT_ID=your-web-client-id-here.apps.googleusercontent.com
   ```

   **For Local Testing:**
   - If using Azure Functions Core Tools, add to `local.settings.json`:
     ```json
     {
       "Values": {
         "GOOGLE_CLIENT_ID": "your-web-client-id-here.apps.googleusercontent.com"
       }
     }
     ```

2. **Install Backend Dependencies** (if not already):
   ```bash
   cd backend
   npm install google-auth-library
   ```

## Step 4: Test Locally

### For Development Build (Expo Dev Client):

1. **Start Expo dev server**:
   ```bash
   npx expo start --dev-client
   ```

2. **Run on device/emulator**:
   ```bash
   # iOS
   npx expo run:ios
   
   # Android
   npx expo run:android
   ```

3. **Test Google Sign-In**:
   - Tap the Google sign-in button
   - Should open Google OAuth flow
   - After authentication, should redirect back to app

### For Expo Go (Limited Support):

- Expo Go has limited OAuth support
- **Recommended**: Use development build (`expo run:ios` or `expo run:android`)

## Step 5: Get Redirect URI for Testing

To see what redirect URI Expo is generating, add this temporarily in your code:

```typescript
const redirectUri = AuthSession.makeRedirectUri();
console.log("Redirect URI:", redirectUri);
```

Then add this URI to your Google Cloud Console OAuth credentials.

## Common Redirect URIs for Expo:

- **Development**: `exp://localhost:8081` or `exp://192.168.x.x:8081`
- **Custom Scheme**: `myapp://` (from your app.json scheme)
- **Production**: Will be different based on your app's final URL

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Check that the redirect URI in Google Console matches exactly what Expo generates
- Use `AuthSession.makeRedirectUri()` to see the actual URI
- Add all possible variations (localhost, 127.0.0.1, your local IP)

### Error: "invalid_client"
- Verify the Client ID is correct
- Make sure you're using the **Web Client ID** (not Android/iOS)
- Check that the Client ID is properly set in `.env` or `app.json`

### Error: "Cannot find native module 'ExpoCrypto'"
- Rebuild the native app:
  ```bash
  npx expo prebuild --clean
  npx expo run:ios
  # or
  npx expo run:android
  ```

### OAuth Flow Not Opening
- Make sure you're using a development build, not Expo Go
- Check that `expo-auth-session` and `expo-web-browser` are installed
- Verify the redirect URI is configured correctly

## Important Notes:

1. **Use Web Client ID**: For Expo, you need the **Web Application** OAuth client ID, not Android/iOS
2. **Redirect URIs**: Must match exactly what Expo generates
3. **Development vs Production**: You'll need different redirect URIs for production builds
4. **Backend Verification**: The backend uses the same Client ID to verify the token

## Quick Checklist:

- [ ] Created OAuth 2.0 Web Client ID in Google Cloud Console
- [ ] Added redirect URIs to Google Console
- [ ] Set `EXPO_PUBLIC_GOOGLE_CLIENT_ID` in `.env` or `app.json`
- [ ] Set `GOOGLE_CLIENT_ID` in backend environment
- [ ] Installed `google-auth-library` in backend
- [ ] Rebuilt native app (if using dev client)
- [ ] Tested sign-in flow

