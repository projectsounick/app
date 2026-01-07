# Backend Changes for Dark Mode Feature

## Overview
This document outlines the backend changes needed to support the dark mode feature, including storing user preferences and modal state.

## Database Schema Changes

### User Model / UserDetails Model
Add the following fields to your user schema:

```typescript
// Add to UserDetails schema (or User schema if using single collection)
darkMode: {
  type: Boolean,
  default: false,
  required: false
},
darkModeModalShown: {
  type: Boolean,
  default: false,
  required: false
}
```

### MongoDB Schema Example
```javascript
// In your UserDetails schema file
const userDetailsSchema = new mongoose.Schema({
  // ... existing fields
  darkMode: {
    type: Boolean,
    default: false
  },
  darkModeModalShown: {
    type: Boolean,
    default: false
  },
  // ... rest of schema
});
```

## API Endpoint Changes

### Update User Endpoint (`/api/update-user`)
The existing `update-user` endpoint should already handle these fields since it accepts any data and updates the user. No changes needed if your current implementation uses:

```typescript
// Your current updateUserData function should already handle this
export async function updateUserData(
  userId: string,
  data: Record<string, any>
) {
  // This should already work with darkMode and darkModeModalShown
  // Just ensure these fields are included in userDetailsData
}
```

### Response Format
The update endpoint should return the updated user object:

```json
{
  "success": true,
  "message": "User updated successfully",
  "user": {
    "_id": "...",
    "name": "...",
    "darkMode": true,
    "darkModeModalShown": true,
    // ... other user fields
  }
}
```

## Verification Steps

1. **Test Update Endpoint**: Verify that sending `{ darkMode: true, darkModeModalShown: true }` updates the user correctly
2. **Test Response**: Ensure the response includes the updated `user` object with all fields
3. **Test Default Values**: New users should have `darkMode: false` and `darkModeModalShown: false` by default

## Migration (Optional)
If you want to set default values for existing users:

```javascript
// Migration script (run once)
db.userdetails.updateMany(
  { darkMode: { $exists: false } },
  { $set: { darkMode: false, darkModeModalShown: false } }
);
```

## Notes
- The frontend will handle all the logic for showing/hiding the modal
- The backend just needs to store and return these two boolean fields
- No new endpoints are required - the existing `update-user` endpoint is sufficient

