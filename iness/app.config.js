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

// Export the config
module.exports = appJson;
