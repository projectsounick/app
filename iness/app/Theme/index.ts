/**
 * Theme module exports
 * Central export point for all theme-related functionality
 */

export { ThemeProvider, useTheme, useGlobalTheme } from './ThemeContext';
export { responsiveFontSize, responsiveSpacing, getScreenDimensions } from './responsiveFontSize';
export { lightColors, darkColors, type ColorTheme } from './colors';
export { default as globalTheme } from './globalTheme';

