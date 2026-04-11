/**
 * Global theme configuration
 * This file provides backward compatibility and exports the theme
 * 
 * IMPORTANT: This is a STATIC theme with responsive font sizes but light colors only.
 * For dark mode support, use useGlobalTheme() hook instead (same structure, reactive colors).
 * 
 * Migration: Replace `import theme from '@/app/Theme/globalTheme'` 
 * with `const theme = useGlobalTheme()` in your component
 */

import { Dimensions, PixelRatio } from 'react-native';
import { lightColors } from './colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;
const widthScale = SCREEN_WIDTH / BASE_WIDTH;
const heightScale = SCREEN_HEIGHT / BASE_HEIGHT;
const scale = Math.min(widthScale, heightScale);

const responsiveFontSize = (size: number): number => {
  const newSize = size * scale;
  if (newSize < 10) return 10;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

const responsiveSpacing = (size: number): number => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Create theme object with responsive values
// This maintains backward compatibility with existing code
// NOTE: Colors are static (light mode only). Use useGlobalTheme() hook for reactive colors.
const theme = {
  colors: lightColors, // Static - light colors only
  fontSizes: {
    small: responsiveFontSize(12),
    regularSmall: responsiveFontSize(14),
    regular: responsiveFontSize(16),
    medium: responsiveFontSize(18),
    large: responsiveFontSize(24),
    xlarge: responsiveFontSize(28),
    xl: responsiveFontSize(32),
    xxl: responsiveFontSize(38),
  },
  fontWeights: {
    regular: "400" as const,
    medium: "500" as const,
    semiBold: "600" as const,
    bold: "700" as const,
  },
  spacing: {
    xs: responsiveSpacing(4),
    sm: responsiveSpacing(8),
    md: responsiveSpacing(16),
    lg: responsiveSpacing(24),
    xl: responsiveSpacing(32),
    xxl: responsiveSpacing(48),
  },
  fonts: {
    heading: "SatoshiBold",
    subheading: "SatoshiMedium",
    body: "SatoshiRegular",
    regular: "SatoshiRegular",
    medium: "SatoshiMedium",
    semiBold: "SatoshiBold",
    bold: "SatoshiBold",
  },
};

export default theme;
