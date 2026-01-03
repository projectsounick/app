import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, ColorTheme } from './colors';
import { responsiveFontSize, responsiveSpacing } from './responsiveFontSize';

const THEME_STORAGE_KEY = '@app_theme_mode';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface Theme {
  mode: ThemeMode;
  colors: ColorTheme;
  fontSizes: {
    small: number;
    regularSmall: number;
    regular: number;
    medium: number;
    large: number;
    xlarge: number;
    xl: number;
    xxl: number;
  };
  fontWeights: {
    regular: string;
    medium: string;
    bold: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  fonts: {
    heading: string;
    subheading: string;
    body: string;
    regular: string;
    medium: string;
    bold: string;
  };
}

interface ThemeContextType {
  theme: Theme;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Create responsive font sizes
const createFontSizes = () => ({
  small: responsiveFontSize(12),
  regularSmall: responsiveFontSize(14),
  regular: responsiveFontSize(16),
  medium: responsiveFontSize(18),
  large: responsiveFontSize(24),
  xlarge: responsiveFontSize(28),
  xl: responsiveFontSize(32),
  xxl: responsiveFontSize(38),
});

// Create responsive spacing
const createSpacing = () => ({
  xs: responsiveSpacing(4),
  sm: responsiveSpacing(8),
  md: responsiveSpacing(16),
  lg: responsiveSpacing(24),
  xl: responsiveSpacing(32),
  xxl: responsiveSpacing(48),
});

interface ThemeProviderProps {
  children: ReactNode;
  initialMode?: ThemeMode;
}

export function ThemeProvider({ children, initialMode = 'light' }: ThemeProviderProps) {
  const systemColorScheme = useRNColorScheme();
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load theme preference from AsyncStorage on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
          setMode(savedMode as ThemeMode);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadThemePreference();
  }, []);
  
  // Determine if dark mode should be used
  const isDark = mode === 'dark';

  // Create theme object with responsive values
  const theme: Theme = {
    mode,
    colors: isDark ? darkColors : lightColors,
    fontSizes: createFontSizes(),
    fontWeights: {
      regular: "400",
      medium: "500",
      bold: "700",
    },
    spacing: createSpacing(),
    fonts: {
      heading: "SatoshiBold",
      subheading: "SatoshiMedium",
      body: "SatoshiRegular",
      regular: "SatoshiRegular",
      medium: "SatoshiMedium",
      bold: "SatoshiBold",
    },
  };

  const setThemeMode = async (newMode: ThemeMode) => {
    try {
      setMode(newMode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setThemeMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * useGlobalTheme - Reactive version of globalTheme
 * Same structure as globalTheme but with theme-aware colors (supports dark mode)
 * 
 * Usage: Replace `import theme from '@/app/Theme/globalTheme'` 
 * with `const theme = useGlobalTheme()` in your component
 * 
 * This allows existing code to work with minimal changes - just add the hook call.
 */
export function useGlobalTheme() {
  const { theme } = useTheme();
  
  // Return theme in the same structure as globalTheme for easy migration
  return {
    colors: theme.colors,
    fontSizes: theme.fontSizes,
    fontWeights: theme.fontWeights,
    spacing: theme.spacing,
    fonts: theme.fonts,
  };
}

