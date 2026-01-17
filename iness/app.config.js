const fs = require("fs");
const path = require("path");

// Read app.json
const appJson = require("./app.json");

// Write google-services.json from environment variable (only during EAS builds)
// Skip this locally to avoid errors
if (process.env.GOOGLE_SERVICES_JSON) {
  const googleServicesPath = path.join(
    __dirname,
    "android",
    "app",
    "google-services.json"
  );
  
  // Create directory if it doesn't exist
  const dir = path.dirname(googleServicesPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Write the file
  fs.writeFileSync(googleServicesPath, process.env.GOOGLE_SERVICES_JSON);
  console.log("✅ google-services.json created from environment variable");
} else if (process.env.EAS_BUILD) {
  // Only warn during EAS builds, not locally
  console.warn("⚠️  GOOGLE_SERVICES_JSON environment variable not found during EAS build");
}

// Export the config with extra properties
module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,
    extra: {
      ...appJson.expo?.extra,
      // Google OAuth Client IDs
      // Get these from Google Cloud Console: https://console.cloud.google.com/apis/credentials
      googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID || "340636011235-mbdr1fc9p1260jaeh0ud7rik8qi340gu.apps.googleusercontent.com",
      googleIosClientId: process.env.GOOGLE_IOS_CLIENT_ID || "340636011235-env4nm4jkj7mb81g4dk5qb79hdu1l75o.apps.googleusercontent.com",
      googleAndroidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID || "340636011235-0o6medtg1lb9fkua9mop87kqgp2eil9k.apps.googleusercontent.com",
      // EAS Project ID (for push notifications)
      eas: {
        projectId: appJson.expo?.extra?.eas?.projectId || "87dfba75-ecf1-4c1c-9b9a-74df81667288",
      },
    },
  },
};
