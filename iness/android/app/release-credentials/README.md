# Local Android signing

This directory is intentionally excluded from Git. Android release builds use
the native Gradle project and credentials supplied outside the repository.

For a local signed bundle, store the upload keystore here and put these values
in `~/.gradle/gradle.properties` (never in the repository):

```properties
MYAPP_RELEASE_STORE_FILE=release-credentials/my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=your-key-alias
MYAPP_RELEASE_STORE_PASSWORD=your-store-password
MYAPP_RELEASE_KEY_PASSWORD=your-key-password
```

Then run `./gradlew bundleRelease` from the `android` directory.
