# Theme System Documentation

This theme system provides responsive font sizes, spacing, and comprehensive color theming with light/dark mode support.

## Features

- ✅ **Responsive Font Sizes**: Automatically scales based on screen dimensions
- ✅ **Responsive Spacing**: Scales spacing values for different screen sizes
- ✅ **Light/Dark Mode**: Full theme support with easy mode switching
- ✅ **Type-Safe**: TypeScript support with proper types
- ✅ **Backward Compatible**: Existing code using `globalTheme` continues to work

## Usage

### Using the Theme Hook (Recommended)

```tsx
import { useTheme } from "@/app/Theme";

function MyComponent() {
  const { theme, isDark } = useTheme();

  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text
        style={{
          fontSize: theme.fontSizes.regular,
          color: theme.colors.text,
          fontFamily: theme.fonts.regular,
        }}
      >
        Hello World
      </Text>
    </View>
  );
}
```

### Using Global Theme (Backward Compatible)

```tsx
import theme from "@/app/Theme/globalTheme";

const styles = StyleSheet.create({
  text: {
    fontSize: theme.fontSizes.regular,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
});
```

### Responsive Font Sizes

Font sizes automatically scale based on screen dimensions. The base design is for iPhone 14 Pro (393x852), and all sizes scale proportionally.

```tsx
const { theme } = useTheme();

// Available font sizes (all responsive):
theme.fontSizes.small; // 12px base
theme.fontSizes.regularSmall; // 14px base
theme.fontSizes.regular; // 16px base
theme.fontSizes.medium; // 18px base
theme.fontSizes.large; // 24px base
theme.fontSizes.xlarge; // 28px base
theme.fontSizes.xl; // 32px base
theme.fontSizes.xxl; // 38px base
```

### Responsive Spacing

```tsx
const { theme } = useTheme();

// Available spacing values (all responsive):
theme.spacing.xs; // 4px base
theme.spacing.sm; // 8px base
theme.spacing.md; // 16px base
theme.spacing.lg; // 24px base
theme.spacing.xl; // 32px base
theme.spacing.xxl; // 48px base
```

### Colors

All colors are theme-aware and automatically switch between light and dark modes:

```tsx
const { theme, isDark } = useTheme();

// Primary colors
theme.colors.primary; // "#BDFF84"
theme.colors.secondPrimary; // "#9747FF"

// Text colors
theme.colors.text; // Main text color
theme.colors.textSecondary; // Secondary text
theme.colors.textMuted; // Muted text
theme.colors.textLight; // Light text
theme.colors.textWhite; // White text

// Background colors
theme.colors.background; // Main background
theme.colors.backgroundSecondary; // Secondary background
theme.colors.backgroundCard; // Card background
theme.colors.backgroundCardLight; // Light card background

// Other colors
theme.colors.link; // Link color
theme.colors.border; // Border color
theme.colors.divider; // Divider color
theme.colors.success; // Success color
theme.colors.error; // Error color
theme.colors.warning; // Warning color
theme.colors.info; // Info color
```

### Changing Theme Mode

```tsx
import { useTheme } from "@/app/Theme";

function SettingsScreen() {
  const { theme, setThemeMode, isDark } = useTheme();

  return (
    <View>
      <Button title="Light Mode" onPress={() => setThemeMode("light")} />
      <Button title="Dark Mode" onPress={() => setThemeMode("dark")} />
      <Button title="Auto (System)" onPress={() => setThemeMode("auto")} />
    </View>
  );
}
```

### Manual Responsive Functions

If you need custom responsive values:

```tsx
import { responsiveFontSize, responsiveSpacing } from "@/app/Theme";

const customFontSize = responsiveFontSize(20); // 20px base, scaled
const customSpacing = responsiveSpacing(10); // 10px base, scaled
```

## Migration Guide

### Old Code (Hardcoded)

```tsx
const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    color: "#1A1A1A",
  },
});
```

### New Code (Theme-Based)

```tsx
const { theme } = useTheme();

const styles = StyleSheet.create({
  text: {
    fontSize: theme.fontSizes.regular,
    color: theme.colors.text,
  },
});
```

## Architecture

- `ThemeContext.tsx`: Theme provider and context
- `colors.ts`: Color definitions for light/dark modes
- `responsiveFontSize.ts`: Responsive scaling utilities
- `globalTheme.ts`: Backward-compatible static theme export
- `index.ts`: Central export point

## Notes

- Font sizes scale based on screen width/height ratio
- Minimum font size is capped at 10px for readability
- Theme mode can be 'light', 'dark', or 'auto' (follows system)
- All existing code using `globalTheme` will continue to work
- For new code, prefer using `useTheme()` hook for theme-aware colors
