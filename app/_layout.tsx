import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ThemeProvider } from '../context/ThemeContext';
import '../global.css';
import { initializeDatabase } from '../lib/database';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    // If you have custom fonts, define them here. Example:
    // 'SpaceMono': require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Effect to initialize the database when the app starts
  useEffect(() => {
    initializeDatabase().catch(err => console.error("Database initialization failed", err));
  }, []);

  // Effect to hide the splash screen once fonts are loaded
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // If fonts are not loaded yet, return null to keep the splash screen visible
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // This defines the main navigation structure.
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

// The component we actually export wraps our RootLayout with the ThemeProvider.
// This is the correct place for it.
export default function AppLayout() {
  return (
    <ThemeProvider>
      <RootLayout />
    </ThemeProvider>
  );
}