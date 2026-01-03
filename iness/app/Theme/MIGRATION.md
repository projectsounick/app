# Migration Guide: Using Theme System

## Current Situation

You have two options:

### Option 1: Keep using `globalTheme` (No changes needed)
- ✅ Works immediately - no code changes required
- ✅ Responsive font sizes (automatically scales)
- ❌ Light mode colors only (no dark mode support)

### Option 2: Use `useGlobalTheme()` hook (Minimal changes)
- ✅ Responsive font sizes
- ✅ Dark mode support
- ✅ Same structure as `globalTheme` - easy migration
- ⚠️ Requires adding hook call in components

## Migration Steps

### For Components Using `globalTheme`

**Before:**
```tsx
import theme from '@/app/Theme/globalTheme';

const styles = StyleSheet.create({
  text: {
    fontSize: theme.fontSizes.regular,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
});
```

**After (Option 1 - No changes):**
```tsx
// Keep as-is - still works with responsive sizes!
import theme from '@/app/Theme/globalTheme';

const styles = StyleSheet.create({
  text: {
    fontSize: theme.fontSizes.regular, // ✅ Responsive
    color: theme.colors.text, // ⚠️ Light mode only
    fontFamily: theme.fonts.regular,
  },
});
```

**After (Option 2 - Add hook for dark mode):**
```tsx
import { useGlobalTheme } from '@/app/Theme';

function MyComponent() {
  const theme = useGlobalTheme(); // Same structure as globalTheme!
  
  const styles = StyleSheet.create({
    text: {
      fontSize: theme.fontSizes.regular, // ✅ Responsive
      color: theme.colors.text, // ✅ Theme-aware (light/dark)
      fontFamily: theme.fonts.regular,
    },
  });
  
  return <Text style={styles.text}>Hello</Text>;
}
```

## Key Points

1. **No immediate changes required** - `globalTheme` still works and now has responsive font sizes
2. **Gradual migration** - Switch to `useGlobalTheme()` when you want dark mode support
3. **Same API** - `useGlobalTheme()` has the exact same structure as `globalTheme`
4. **Responsive by default** - Both options have responsive font sizes

## When to Migrate

- ✅ **Keep `globalTheme`** if:
  - You don't need dark mode yet
  - You want zero code changes
  - You're using it in StyleSheet.create() (outside components)

- ✅ **Use `useGlobalTheme()`** if:
  - You want dark mode support
  - You're inside a React component
  - You want theme-aware colors

## Example: Full Component Migration

**Before:**
```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '@/app/Theme/globalTheme';

export default function MyComponent() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  text: {
    fontSize: theme.fontSizes.regular,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
});
```

**After:**
```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGlobalTheme } from '@/app/Theme';

export default function MyComponent() {
  const theme = useGlobalTheme(); // Only change needed!
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background, // Now theme-aware!
      padding: theme.spacing.md,
    },
    text: {
      fontSize: theme.fontSizes.regular,
      color: theme.colors.text, // Now theme-aware!
      fontFamily: theme.fonts.regular,
    },
  });
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello</Text>
    </View>
  );
}
```

## Summary

- **`globalTheme`**: Static import, responsive sizes, light colors only
- **`useGlobalTheme()`**: Hook, responsive sizes, theme-aware colors (light/dark)
- **Same structure**: Easy to switch between them
- **No breaking changes**: Existing code continues to work






