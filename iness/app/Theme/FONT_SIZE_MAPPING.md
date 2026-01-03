# Font Size Mapping Guide

Use this guide to replace hardcoded font sizes with theme values.

## Theme Font Size Reference

```tsx
theme.fontSizes.small        // 12px base (responsive)
theme.fontSizes.regularSmall // 14px base (responsive)
theme.fontSizes.regular     // 16px base (responsive)
theme.fontSizes.medium      // 18px base (responsive)
theme.fontSizes.large       // 24px base (responsive)
theme.fontSizes.xlarge      // 28px base (responsive)
theme.fontSizes.xl          // 32px base (responsive)
theme.fontSizes.xxl          // 38px base (responsive)
```

## Common Hardcoded Size → Theme Mapping

| Hardcoded Size | Use Theme Value | Common Use Case |
|---------------|-----------------|-----------------|
| `fontSize: 10` | `theme.fontSizes.small` | Very small text, labels |
| `fontSize: 11` | `theme.fontSizes.small` | Small text, captions |
| `fontSize: 12` | `theme.fontSizes.small` | Small text, button text |
| `fontSize: 13` | `theme.fontSizes.regularSmall` | Small body text |
| `fontSize: 14` | `theme.fontSizes.regularSmall` | Regular small text |
| `fontSize: 15` | `theme.fontSizes.regular` | Medium text, card titles |
| `fontSize: 16` | `theme.fontSizes.regular` | Regular body text |
| `fontSize: 18` | `theme.fontSizes.medium` | Medium headings |
| `fontSize: 20` | `theme.fontSizes.medium` | Subheadings |
| `fontSize: 22` | `theme.fontSizes.large` | Large headings |
| `fontSize: 24` | `theme.fontSizes.large` | Large headings |
| `fontSize: 28` | `theme.fontSizes.xlarge` | Extra large headings |
| `fontSize: 32` | `theme.fontSizes.xl` | XL headings |
| `fontSize: 38` | `theme.fontSizes.xxl` | XXL headings |

## Replacement Examples

### Before (Hardcoded)
```tsx
const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  body: {
    fontSize: 14,
    color: "#333",
  },
  smallText: {
    fontSize: 12,
  },
});
```

### After (Theme-Based)
```tsx
import theme from '@/app/Theme/globalTheme';

const styles = StyleSheet.create({
  title: {
    fontSize: theme.fontSizes.medium, // 18 → medium
    fontWeight: theme.fontWeights.bold, // "700" → theme value
  },
  body: {
    fontSize: theme.fontSizes.regularSmall, // 14 → regularSmall
    color: "#333",
  },
  smallText: {
    fontSize: theme.fontSizes.small, // 12 → small
  },
});
```

## Font Weight Mapping

| Hardcoded | Theme Value |
|-----------|-------------|
| `fontWeight: "400"` | `theme.fontWeights.regular` |
| `fontWeight: "500"` | `theme.fontWeights.medium` |
| `fontWeight: "600"` | `theme.fontWeights.medium` |
| `fontWeight: "700"` | `theme.fontWeights.bold` |

## Quick Find & Replace Guide

1. **Find all hardcoded font sizes:**
   - Search for: `fontSize:\s*\d+`
   - Replace based on mapping above

2. **Find all hardcoded font weights:**
   - Search for: `fontWeight:\s*"(\d+)"`
   - Replace with: `fontWeight: theme.fontWeights.regular/medium/bold`

3. **Make sure theme is imported:**
   ```tsx
   import theme from '@/app/Theme/globalTheme';
   ```

## Benefits

✅ **Responsive**: Automatically scales on different screen sizes
✅ **Consistent**: Same sizes across the entire app
✅ **Maintainable**: Change once, applies everywhere
✅ **Theme-ready**: Easy to add dark mode later






