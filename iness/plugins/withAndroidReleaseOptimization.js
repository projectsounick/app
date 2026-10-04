const {
  withAppBuildGradle,
  withGradleProperties,
} = require("@expo/config-plugins");

/**
 * Keeps R8's optimized release configuration when EAS regenerates Android.
 * Expo's generated project otherwise uses proguard-android.txt, which disables
 * the optimization phase even when minification is enabled. AGP 8.12's
 * experimental integrated resource shrinker is explicitly disabled because it
 * crashes R8 8.12.14 for this app; ordinary resource shrinking remains on.
 */
module.exports = function withAndroidReleaseOptimization(config) {
  config = withGradleProperties(config, (gradleConfig) => {
    const key = "android.r8.optimizedResourceShrinking";
    gradleConfig.modResults = gradleConfig.modResults.filter(
      (item) => item.type !== "property" || item.key !== key
    );
    gradleConfig.modResults.push({ type: "property", key, value: "false" });
    return gradleConfig;
  });

  return withAppBuildGradle(config, (gradleConfig) => {
    if (gradleConfig.modResults.language !== "groovy") {
      throw new Error("Android release optimization requires a Groovy build file.");
    }

    const legacyDefaults = /getDefaultProguardFile\(["']proguard-android\.txt["']\)/g;
    const optimizedDefaults =
      'getDefaultProguardFile("proguard-android-optimize.txt")';
    const contents = gradleConfig.modResults.contents;

    if (!legacyDefaults.test(contents) && !contents.includes(optimizedDefaults)) {
      throw new Error("Unable to locate the Android release ProGuard configuration.");
    }

    gradleConfig.modResults.contents = contents.replace(
      legacyDefaults,
      optimizedDefaults
    );
    return gradleConfig;
  });
};
