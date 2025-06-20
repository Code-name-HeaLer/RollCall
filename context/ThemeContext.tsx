import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
// We get the device's theme for initial state...
import { useColorScheme as useDeviceColorScheme } from 'react-native';
// ...but we get NativeWind's controller hook to actually manage the theme.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';

type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  isThemeLoading: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'app-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  // This is the correct hook from NativeWind v4.
  // It gives us the current theme ('colorScheme') and the function to change it ('setColorScheme').
  const nativeWind = useNativeWindColorScheme();
  const colorScheme = (nativeWind as any)?.colorScheme as Theme || 'light';
  const setColorScheme = (nativeWind as any)?.setColorScheme as (theme: Theme) => void;

  // We only use the device's color scheme to determine the initial theme on first launch.
  const { colorScheme: deviceTheme } = useDeviceColorScheme();
  const [isThemeLoading, setIsThemeLoading] = useState(true);

  // This effect runs once on app startup to load the user's saved theme.
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = (await AsyncStorage.getItem(THEME_STORAGE_KEY)) as Theme | null;
        // If there's a saved theme, use it. Otherwise, use the device's setting.
        const initialTheme = savedTheme || deviceTheme || 'light';
        // This is the magic: tell NativeWind what theme to use.
        setColorScheme(initialTheme);
      } catch (error) {
        console.error('Failed to load theme from storage', error);
      } finally {
        setIsThemeLoading(false);
      }
    };

    loadTheme();
    // We only want this to run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTheme = () => {
    const newTheme = colorScheme === 'light' ? 'dark' : 'light';
    setColorScheme(newTheme); // Synchronous update for instant UI change
    AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme).catch((error) => {
      console.error('Failed to save theme to storage', error);
    });
  };

  const value = {
    // We provide the current theme from NativeWind's state.
    theme: colorScheme || 'light',
    isThemeLoading,
    toggleTheme,
  };

  // The provider's only job is to provide the context. No wrapper View is needed.
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// The custom hook remains the same and is correct.
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};