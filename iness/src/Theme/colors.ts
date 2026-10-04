/**
 * Color theme definitions for light and dark modes
 * All colors used in the app should be defined here
 */

export const lightColors = {
  // Primary colors
  primary: "#BDFF84",
  secondPrimary: "#9747FF",
  second: "#9747FF",
  iconBackground: "#411D6E", // Dark purple for cart/bell icon backgrounds
  
  // Text colors
  text: "#1A1A1A",
  textSecondary: "#666666", // Common #666
  textMuted: "#888888", // Common #888
  textLight: "#CCCCCC",
  textWhite: "#FFFFFF",
  medium: "#888888",
  
  // Background colors
  background: "#FFFFFF",
  backgroundSecondary: "#F9F9F9", // Common light gray
  backgroundFaded: "#FAFAFA", // Very light faded background
  backgroundCard: "#F3F3F3",
  backgroundCardLight: "#F3EDFF",
  
  // Border and divider colors
  border: "#F5F5F5", // Common light border
  divider: "#E5E5E5",
  
  // Link colors
  link: "#7ABFFF",
  
  // Status colors
  success: "#67C694", // Common green used in app
  error: "#F44336",
  red: "#F44336",
  warning: "#FF9800",
  info: "#2196F3",
  
  // Dark colors
  dark: "#000000",
  
  // Additional colors
  overlay: "rgba(0, 0, 0, 0.5)",
  shadow: "rgba(0, 0, 0, 0.1)",
  greenLight: "#E8F5E9",
  errorLight: "#FFEBEE",
  warningLight: "#FFF8E1",
  
  // Additional grays and specific colors
  lightGrey: "#F0F0F0",
  mediumGrey: "#D0D0D0",
  darkGrey: "#E8E8E8", // Light gray for input backgrounds
  cardLight: "rgba(255, 255, 255, 0.1)",
  textDark: "#333333",
  textDarker: "#444444",
  black: "#000000",
  white: "#FFFFFF",
  greyBackground: "#F8F8F8",
  successGreen: "#34A853",
  errorRed: "#FF3B3B",
  warningYellow: "#FFFA67",
};

export const darkColors = {
  // Primary colors
  primary: "#BDFF84",
  secondPrimary: "#9747FF",
  second: "#9747FF",
  iconBackground: "#411D6E", // Dark purple for cart/bell icon backgrounds
  
  // Text colors
  text: "#ECEDEE",
  textSecondary: "#CCCCCC", // Lighter for dark mode
  textMuted: "#9BA1A6", // Lighter for dark mode
  textLight: "#687076",
  textWhite: "#FFFFFF",
  medium: "#9BA1A6",
  
  // Background colors
  background: "#151718",
  backgroundSecondary: "#1F1F1F", // Dark gray
  backgroundFaded: "#1A1A1A", // Dark faded background for dark mode
  backgroundCard: "#2A2A2A",
  backgroundCardLight: "#3A2A4A",
  
  // Border and divider colors
  border: "#3A3A3A", // Darker border
  divider: "#3A3A3A",
  
  // Link colors
  link: "#7ABFFF",
  
  // Status colors
  success: "#67C694", // Same green
  error: "#F44336",
  red: "#F44336",
  warning: "#FF9800",
  info: "#2196F3",
  
  // Dark colors
  dark: "#000000",
  
  // Additional colors
  overlay: "rgba(0, 0, 0, 0.7)",
  shadow: "rgba(0, 0, 0, 0.3)",
  greenLight: "#1A3A1A",
  errorLight: "#3A1A1A",
  warningLight: "#3A3A1A",
  
  // Additional grays and specific colors
  lightGrey: "#2A2A2A",
  mediumGrey: "#3A3A3A",
  darkGrey: "#2A2A2A", // Dark gray for dark mode input backgrounds
  cardLight: "rgba(255, 255, 255, 0.05)",
  textDark: "#CCCCCC",
  textDarker: "#DDDDDD",
  black: "#000000",
  white: "#FFFFFF",
  greyBackground: "#1F1F1F",
  successGreen: "#67C694",
  errorRed: "#F44336",
  warningYellow: "#FF9800",
};

export type ColorTheme = typeof lightColors;
