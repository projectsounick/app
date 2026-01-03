# Color Mapping Guide

Use this guide to replace hardcoded colors with theme colors.

## Common Color Replacements

| Hardcoded Color         | Theme Color                                           | Usage                        |
| ----------------------- | ----------------------------------------------------- | ---------------------------- |
| `"#1A1A1A"`             | `theme.colors.text`                                   | Main text color              |
| `"#666"` or `"#666666"` | `theme.colors.textSecondary`                          | Secondary text               |
| `"#888"` or `"#888888"` | `theme.colors.textMuted`                              | Muted text                   |
| `"#fff"` or `"#FFFFFF"` | `theme.colors.background` or `theme.colors.textWhite` | White background/text        |
| `"#000"` or `"#000000"` | `theme.colors.dark`                                   | Black color                  |
| `"#9747FF"`             | `theme.colors.secondPrimary`                          | Purple primary               |
| `"#BDFF84"`             | `theme.colors.primary`                                | Green primary                |
| `"#67C694"`             | `theme.colors.success`                                | Success green                |
| `"#F3EDFF"`             | `theme.colors.backgroundCardLight`                    | Light purple background      |
| `"#F9F9F9"`             | `theme.colors.backgroundSecondary`                    | Light gray background        |
| `"#F5F5F5"`             | `theme.colors.border`                                 | Light border                 |
| `"#F3F3F3"`             | `theme.colors.backgroundCard`                         | Card background              |
| `"#E5E5E5"`             | `theme.colors.divider`                                | Divider color                |
| `"#CCCCCC"`             | `theme.colors.textLight`                              | Light text                   |
| `"#4B4B4B"`             | `theme.colors.textSecondary`                          | Secondary text (alternative) |

## Replacement Examples

### Before

```tsx
const styles = StyleSheet.create({
  text: {
    color: "#1A1A1A",
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#9747FF",
  },
});
```

### After

```tsx
import theme from "@/app/Theme/globalTheme";

const styles = StyleSheet.create({
  text: {
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  button: {
    backgroundColor: theme.colors.secondPrimary,
  },
});
```

## Inline Styles

### Before

```tsx
<View style={{ backgroundColor: "#F9F9F9" }}>
  <Text style={{ color: "#666" }}>Text</Text>
</View>
```

### After

```tsx
<View style={{ backgroundColor: theme.colors.backgroundSecondary }}>
  <Text style={{ color: theme.colors.textSecondary }}>Text</Text>
</View>
```

## Icon Colors

### Before

```tsx
<Ionicons name="heart" color="#9747FF" />
```

### After

```tsx
<Ionicons name="heart" color={theme.colors.secondPrimary} />
```
