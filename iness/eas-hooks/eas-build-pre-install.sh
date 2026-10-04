#!/usr/bin/env bash

# EAS Build Hook: Write google-services.json before build
# This hook runs before npm install

set -euo pipefail

# Create the directory if it doesn't exist
mkdir -p android/app

# Write google-services.json from EAS secret
if [ -n "${GOOGLE_SERVICES_JSON:-}" ]; then
  echo "${GOOGLE_SERVICES_JSON}" > android/app/google-services.json
  echo "✅ google-services.json created from EAS secret"
else
  echo "⚠️  GOOGLE_SERVICES_JSON secret not found"
  exit 1
fi

