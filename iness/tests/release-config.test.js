const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

test("Android, iOS, and JavaScript release versions stay aligned", () => {
  const packageJson = JSON.parse(read("package.json"));
  const appJson = JSON.parse(read("app.json"));
  const gradle = read("android/app/build.gradle");
  const gradleVersionCode = gradle.match(/versionCode\s+(\d+)/)?.[1];

  assert.equal(packageJson.version, appJson.expo.version);
  assert.match(gradle, new RegExp(`versionName ["']${packageJson.version}["']`));
  assert.ok(gradleVersionCode, "Android Gradle versionCode is missing");
  assert.equal(appJson.expo.android.versionCode, Number(gradleVersionCode));
  assert.equal(appJson.expo.ios.buildNumber, "87");
});

test("Android production bundles keep R8 obfuscation and resource shrinking enabled", () => {
  const appJson = JSON.parse(read("app.json"));
  const gradleProperties = read("android/gradle.properties");
  const buildGradle = read("android/app/build.gradle");
  const optimizationPlugin = read(
    "plugins/withAndroidReleaseOptimization.js"
  );
  const buildProperties = appJson.expo.plugins.find(
    (plugin) => Array.isArray(plugin) && plugin[0] === "expo-build-properties"
  )?.[1]?.android;

  assert.equal(buildProperties?.enableMinifyInReleaseBuilds, true);
  assert.equal(buildProperties?.enableShrinkResourcesInReleaseBuilds, true);
  assert.ok(
    appJson.expo.plugins.includes("./plugins/withAndroidReleaseOptimization")
  );
  assert.match(
    gradleProperties,
    /^android\.enableMinifyInReleaseBuilds=true$/m
  );
  assert.match(
    gradleProperties,
    /^android\.enableShrinkResourcesInReleaseBuilds=true$/m
  );
  assert.match(
    gradleProperties,
    /^android\.r8\.optimizedResourceShrinking=false$/m
  );
  assert.match(buildGradle, /minifyEnabled enableMinifyInReleaseBuilds/);
  assert.match(buildGradle, /shrinkResources .*enableShrinkResources/);
  assert.match(buildGradle, /proguard-android-optimize\.txt/);
  assert.match(optimizationPlugin, /value: "false"/);
});

test("Android media selection uses the system picker without broad storage access", () => {
  const packageJson = JSON.parse(read("package.json"));
  const appJson = JSON.parse(read("app.json"));
  const manifest = read("android/app/src/main/AndroidManifest.xml");
  const mediaSources = [
    "src/modules/Imagepicker.tsx",
    "app/(tabs)/dashboard/transformationImage.tsx",
    "src/Modals/CommunitPostModal.tsx",
  ].map(read).join("\n");
  const blockedPermissions = new Set(
    appJson.expo.android.blockedPermissions || []
  );
  const forbiddenPermissions = [
    "android.permission.READ_MEDIA_IMAGES",
    "android.permission.READ_MEDIA_VIDEO",
    "android.permission.READ_MEDIA_AUDIO",
    "android.permission.READ_MEDIA_VISUAL_USER_SELECTED",
    "android.permission.READ_EXTERNAL_STORAGE",
    "android.permission.WRITE_EXTERNAL_STORAGE",
  ];

  for (const permission of forbiddenPermissions) {
    assert.ok(blockedPermissions.has(permission));
    assert.match(
      manifest,
      new RegExp(
        `<uses-permission android:name=["']${permission}["'] tools:node=["']remove["']\\s*/>`
      )
    );
  }

  assert.doesNotMatch(mediaSources, /requestMediaLibraryPermissionsAsync/);
  assert.equal(packageJson.dependencies["expo-media-library"], undefined);
  assert.ok(packageJson.dependencies["expo-image-picker"]);
});

test("dashboard shortcut actions close safely and tolerate malformed API data", () => {
  const shortcut = read("src/modules/Imagepicker.tsx");
  const calendar = read(
    "src/Components/SessionCalendar/SessionCalendarContent.tsx"
  );
  const dietPlan = read("src/Modals/PdfBottomSheet.tsx");

  assert.match(shortcut, /const closeMenu = useCallback/);
  assert.match(shortcut, /const pickImage[\s\S]*?closeMenu\(\)/);
  assert.match(
    shortcut,
    /key: "calendar"[\s\S]*?closeMenu\(\);[\s\S]*?setCalendarSheetOpen\(true\)/
  );
  assert.match(shortcut, /const openDietPlanModal[\s\S]*?closeMenu\(\)/);
  assert.match(shortcut, /onRequestClose=\{cancelCaptureType\}/);
  assert.match(shortcut, /runSingleAction\("dashboard-shortcut"/);
  assert.match(calendar, /Array\.isArray\(sessionData\)/);
  assert.match(dietPlan, /Array\.isArray\(response\.data\)/);
  assert.match(dietPlan, /typeof url === "string"/);
});

test("new mobile builds contain Razorpay but no obsolete PhonePe native module", () => {
  const packageJson = JSON.parse(read("package.json"));
  assert.ok(packageJson.dependencies["react-native-razorpay"]);
  assert.equal(packageJson.dependencies["react-native-phonepe-pg"], undefined);
});

test("release credentials are not present in the mobile project", () => {
  const gradleProperties = read("android/gradle.properties");
  const buildGradle = read("android/app/build.gradle");

  assert.equal(fs.existsSync(path.join(root, "serviceAccountKey.json")), false);
  assert.doesNotMatch(gradleProperties, /^MYAPP_RELEASE_.*=/m);
  assert.doesNotMatch(
    buildGradle,
    /otherwise fall back to debug|else\s*\{\s*signingConfig signingConfigs\.debug/m
  );
});

test("all app API calls advertise the new contract while the backend can default old apps", () => {
  const fetchWrapper = read("src/helpers/fetchWrapper.ts");
  assert.match(fetchWrapper, /"X-API-Version":\s*"2"/);
  assert.match(fetchWrapper, /"X-App-Version"/);
  assert.match(fetchWrapper, /"X-App-Platform"/);
});
