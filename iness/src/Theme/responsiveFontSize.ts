import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 14 Pro - commonly used design reference)
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;

// Calculate scale factors
const widthScale = SCREEN_WIDTH / BASE_WIDTH;
const heightScale = SCREEN_HEIGHT / BASE_HEIGHT;

// Use the smaller scale to ensure text fits on all screens
const scale = Math.min(widthScale, heightScale);

/**
 * Responsive font size function
 * Scales font sizes based on screen dimensions
 * @param size - Base font size (designed for iPhone 14 Pro)
 * @returns Scaled font size adjusted for current screen
 */
export const responsiveFontSize = (size: number): number => {
  const newSize = size * scale;
  
  // Ensure minimum readable size
  if (newSize < 10) return 10;
  
  // Round to nearest pixel
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Responsive spacing function
 * Scales spacing values based on screen dimensions
 * @param size - Base spacing value
 * @returns Scaled spacing value
 */
export const responsiveSpacing = (size: number): number => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Get screen dimensions
 */
export const getScreenDimensions = () => ({
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  scale,
  widthScale,
  heightScale,
});






