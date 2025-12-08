# Setting Up google-services.json for EAS Build

## Problem
EAS Build only uploads files tracked by git. Since `google-services.json` contains sensitive information, it's typically not committed to git, causing build failures.

## Solution: Use EAS Secrets

### Step 1: Get the Content of google-services.json

Read your `google-services.json` file:
```bash
cat android/app/google-services.json
```

### Step 2: Add as EAS Environment Variable

**Use the new `eas env:create` command** (replaces deprecated `eas secret:create`):

```bash
eas env:create --scope project --name GOOGLE_SERVICES_JSON --type string --value "$(cat android/app/google-services.json)"
```

Or manually copy the entire JSON content and run:

```bash
eas env:create --scope project --name GOOGLE_SERVICES_JSON --type string
```

Then paste the entire JSON content when prompted.

**Note**: If you get an error about the file being too large, you can use the file type instead:
```bash
eas env:create --scope project --name GOOGLE_SERVICES_JSON --type file --value android/app/google-services.json
```

### Step 3: Verify Environment Variable Was Added

```bash
eas env:list
```

You should see `GOOGLE_SERVICES_JSON` in the list.

### Step 4: Build Hook Script

The build hook script (`eas-build-pre-install.sh`) is in the project root. EAS Build will automatically run this script before the build. It will:
1. Read the `GOOGLE_SERVICES_JSON` environment variable
2. Write it to `android/app/google-services.json` before the build starts

**Note**: EAS Build automatically runs scripts named `eas-build-*.sh` in the project root.

### Step 5: Build Your App

Now you can build without errors:

```bash
# Development build
eas build --platform android --profile development

# Production build
eas build --platform android --profile production
```

## Alternative: Commit the File (Not Recommended)

If you want to commit the file directly (less secure):

1. **Remove from .gitignore** (if it's there)
2. **Commit the file**:
   ```bash
   git add android/app/google-services.json
   git commit -m "Add google-services.json"
   ```

⚠️ **Warning**: This exposes your Firebase credentials in your git repository. Only do this if you're okay with that.

## Troubleshooting

### Environment Variable Not Found Error
- Make sure you created the env var with the exact name: `GOOGLE_SERVICES_JSON`
- Verify with: `eas env:list`
- Check the scope is `project` (not `account`)

### Build Hook Not Running
- Make sure the hook file is executable: `chmod +x eas-build-pre-install.sh`
- The file must be named `eas-build-*.sh` and be in the project root
- EAS Build automatically detects and runs these scripts

### File Format Error
- Make sure the JSON content is valid
- No extra quotes or escaping needed when using `eas secret:create --type string`

## Quick Command Reference

```bash
# Create environment variable (one-liner)
eas env:create --scope project --name GOOGLE_SERVICES_JSON --type string --value "$(cat android/app/google-services.json)"

# Or use file type (if string is too large)
eas env:create --scope project --name GOOGLE_SERVICES_JSON --type file --value android/app/google-services.json

# List all environment variables
eas env:list

# Delete environment variable (if needed)
eas env:delete --scope project --name GOOGLE_SERVICES_JSON

# Update environment variable
eas env:update --scope project --name GOOGLE_SERVICES_JSON --type string --value "$(cat android/app/google-services.json)"
```

