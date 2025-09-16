const {
  withInfoPlist,
  withAppDelegate,
  withAndroidManifest,
  withProjectBuildGradle,
} = require("@expo/config-plugins");

module.exports = function withPhonePe(config) {
  // iOS: Add LSApplicationQueriesSchemes
  config = withInfoPlist(config, (config) => {
    config.modResults.LSApplicationQueriesSchemes = [
      ...(config.modResults.LSApplicationQueriesSchemes || []),
      "ppemerchantsdkv1",
      "ppemerchantsdkv2",
      "ppemerchantsdkv3",
      "paytmmp",
      "gpay",
    ];
    return config;
  });

  // iOS: Add URL Types (deeplink scheme for your app)
  config = withInfoPlist(config, (config) => {
    config.modResults.CFBundleURLTypes = [
      ...(config.modResults.CFBundleURLTypes || []),
      {
        CFBundleURLSchemes: ["myapp"], // 👈 replace with your scheme
      },
    ];
    return config;
  });

  // Android: Add intent filters for deep links
  config = withAndroidManifest(config, (config) => {
    const intentFilter = {
      action: [{ $: { "android:name": "android.intent.action.VIEW" } }],
      category: [
        { $: { "android:name": "android.intent.category.DEFAULT" } },
        { $: { "android:name": "android.intent.category.BROWSABLE" } },
      ],
      data: [{ $: { "android:scheme": "myapp" } }], // 👈 replace with your scheme
    };

    const activity = config.modResults.manifest.application[0].activity.find(
      (a) => a.$["android:name"] === ".MainActivity"
    );
    activity["intent-filter"] = activity["intent-filter"] || [];
    activity["intent-filter"].push(intentFilter);

    return config;
  });

  // Android: Add PhonePe maven repo
  config = withProjectBuildGradle(config, (config) => {
    if (!config.modResults.repositories) {
      config.modResults.repositories = [];
    }
    if (
      !config.modResults.repositories.includes(
        'maven { url "https://phonepe.mycloudrepo.io/public/repositories/phonepe-intentsdk-android" }'
      )
    ) {
      config.modResults.repositories.push(
        'maven { url "https://phonepe.mycloudrepo.io/public/repositories/phonepe-intentsdk-android" }'
      );
    }
    return config;
  });

  return config;
};
