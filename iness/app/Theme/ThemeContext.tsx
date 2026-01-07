import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, ColorTheme } from './colors';
import { responsiveFontSize, responsiveSpacing } from './responsiveFontSize';
import { asyncStorageUtils } from '@/utils/asyncStorageUtils';
import { userService } from '@/app/services/user.service';

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
  reloadThemeFromUserData: (showModal?: boolean) => Promise<void>;
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
  
  // Load theme preference from user data on mount - CRITICAL: Load synchronously if possible
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        // First, try to load from user data (backend)
        const userResponse = await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
        if (userResponse.exists && userResponse.data) {
          const userData = userResponse.data;
          
          // Check if dark mode is set in user data - use this as source of truth
          if (userData.darkMode !== undefined) {
            // Set mode immediately to prevent flicker
            setMode(userData.darkMode ? 'dark' : 'light');
          } else {
            // If darkMode is undefined, default to light mode (not dark)
            // This prevents showing dark mode when user hasn't set a preference
            setMode('light');
            // Fallback to AsyncStorage if user data doesn't have darkMode
            const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
              setMode(savedMode as ThemeMode);
            }
          }
          
          // Modal logic removed - users will toggle dark mode manually from app settings
        } else {
          // No user data, default to light mode (not dark)
          setMode('light');
          // Try AsyncStorage fallback
          const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
          if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
            setMode(savedMode as ThemeMode);
          }
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
        // On error, default to light mode
        setMode('light');
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
      
      // Update backend via user service
      try {
        const userResponse = await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
        if (userResponse.exists && userResponse.data) {
          const userData = userResponse.data;
          const updateData = {
            darkMode: newMode === 'dark',
          };
          
          const response = await userService.updateUser(updateData);
          
          if (response.success && response.user) {
            // Update local storage with new user data
            await asyncStorageUtils.updateUserDataInAsyncStorage(response.user);
          }
        }
      } catch (error) {
        console.error('Error updating dark mode in backend:', error);
        // Fallback to AsyncStorage if backend update fails
        await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
      }
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // Function to reload theme from user data (called after login)
  // showModal: if true, will check and show modal if needed. If false, only updates theme.
  const reloadThemeFromUserData = async (showModal: boolean = false) => {
    try {
      const userResponse = await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
      if (userResponse.exists && userResponse.data) {
        const userData = userResponse.data;
        
        // Check if dark mode is set in user data
        // If undefined, default to light mode (not dark) to prevent flicker
        if (userData.darkMode !== undefined) {
          setMode(userData.darkMode ? 'dark' : 'light');
        } else {
          // Default to light mode if darkMode is undefined
          setMode('light');
        }
        
        // Modal logic removed - users will toggle dark mode manually from app settings
      } else {
        // No user data, default to light mode
        setMode('light');
      }
    } catch (error) {
      console.error('Error reloading theme from user data:', error);
      // On error, default to light mode
      setMode('light');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setThemeMode, isDark, reloadThemeFromUserData }}>
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

