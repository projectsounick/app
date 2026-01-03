# Quick Replacement Guide: Remove Hardcoded Font Sizes

## Step 1: Import Theme (if not already)

Add at the top of your component file:

```tsx
import theme from "@/app/Theme/globalTheme";
```

## Step 2: Replace Hardcoded Font Sizes

### Common Patterns to Replace:

**Pattern 1: Direct fontSize**

```tsx
// ❌ Before
fontSize: 18;

// ✅ After
fontSize: theme.fontSizes.medium;
```

**Pattern 2: fontWeight strings**

```tsx
// ❌ Before
fontWeight: "700";

// ✅ After
fontWeight: theme.fontWeights.bold;
```

**Pattern 3: Combined**

```tsx
// ❌ Before
fontSize: 14,
fontWeight: "600"

// ✅ After
fontSize: theme.fontSizes.regularSmall,
fontWeight: theme.fontWeights.medium
```

## Step 3: Size Mapping Quick Reference

- `10-12` → `theme.fontSizes.small`
- `13-14` → `theme.fontSizes.regularSmall`
- `15-16` → `theme.fontSizes.regular`
- `18-20` → `theme.fontSizes.medium`
- `22-24` → `theme.fontSizes.large`
- `28` → `theme.fontSizes.xlarge`
- `32` → `theme.fontSizes.xl`
- `38+` → `theme.fontSizes.xxl`

## Example: Complete Component Update

**Before:**

```tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function MyComponent() {
  return (
    <View>
      <Text style={styles.title}>Title</Text>
      <Text style={styles.body}>Body text</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  body: {
    fontSize: 14,
    color: "#666",
  },
});
```

**After:**

```tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import theme from "@/app/Theme/globalTheme"; // ✅ Add import

export default function MyComponent() {
  return (
    <View>
      <Text style={styles.title}>Title</Text>
      <Text style={styles.body}>Body text</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: theme.fontSizes.medium, // ✅ 18 → medium
    fontWeight: theme.fontWeights.bold, // ✅ "700" → bold
    color: "#1A1A1A",
  },
  body: {
    fontSize: theme.fontSizes.regularSmall, // ✅ 14 → regularSmall
    color: "#666",
  },
});
```

## Search & Replace Commands

### Find all hardcoded font sizes:

```bash
# Search for: fontSize: [number]
fontSize:\s*\d+
```

### Find all hardcoded font weights:

```bash
# Search for: fontWeight: "number"
fontWeight:\s*"\d+"
```

## Checklist

- [ ] Import theme at top of file
- [ ] Replace all `fontSize: [number]` with `theme.fontSizes.[size]`
- [ ] Replace all `fontWeight: "[number]"` with `theme.fontWeights.[weight]`
- [ ] Test component on different screen sizes
- [ ] Verify text is readable and properly sized

## Why This Matters

1. **Responsive**: Text scales automatically on different devices
2. **Consistent**: Same sizes used throughout app
3. **Maintainable**: Change theme once, updates everywhere
4. **Future-proof**: Ready for dark mode and theme switching
