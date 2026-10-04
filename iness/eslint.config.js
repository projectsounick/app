// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  {
    ignores: [
      "dist/*",
      // This is an unused Expo-template Jest snapshot. The app's executable
      // contract tests live in tests/ and run with Node's test runner.
      "components/__tests__/**",
    ],
  },
  expoConfig,
  {
    rules: {
      // React Native Text renders apostrophes directly; HTML entity escaping is
      // not required and makes localized copy harder to maintain.
      "react/no-unescaped-entities": "off",
      // SDK 57 adds React Compiler diagnostics. Keep these visible during the
      // gradual screen migration without making legacy diagnostics block builds.
      "react-hooks/refs": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/purity": "warn",
    },
  }
]);
