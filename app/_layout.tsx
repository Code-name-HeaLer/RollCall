import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { SettingsProvider } from '../context/SettingsContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { initializeDatabase } from '../lib/database';
import { registerForPushNotificationsAsync } from '../lib/notifications';

SplashScreen.preventAutoHideAsync();

// This is the component that will be exported and wrapped by the ThemeProvider
export default function AppLayout() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <InitialLayout />
      </SettingsProvider>
    </ThemeProvider>
  );
}

/**
 * This component's only job is one-time setup.
 * It does NOT consume the theme, so it will not re-render on theme change.
 * This prevents the database from re-initializing and causing the NullPointerException.
 */
function InitialLayout() {

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);
  const [fontsLoaded, fontError] = useFonts({
    // 'SpaceMono': require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Effect to initialize the database ONCE.
  useEffect(() => {
    initializeDatabase().catch(err => console.error("Database initialization failed", err));
  }, []);

  // Effect to hide the splash screen once fonts are loaded
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // If fonts are not loaded, return null to keep splash screen visible.
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Once setup is complete, render the main navigator component.
  return <RootNavigator />;
}

/**
 * This component's only job is to render the UI and respond to theme changes.
 * It is safely rendered AFTER InitialLayout has completed its one-time setup.
 */
function RootNavigator() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colors = {
    background: isDark ? '#0D0D0D' : '#F8F8F9',
    text: isDark ? '#EAEAEA' : '#1F2937',
    border: isDark ? '#262626' : '#E5E7EB',
    primary: '#10B981' // Keep primary for tint color
  };

  return (
    <>
      <StatusBar backgroundColor={colors.background} style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.text },
          headerTintColor: colors.primary, // Use a consistent accent color for back buttons
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right', // Animate all screens with slide
          gestureEnabled: true, // Enable swipe gestures
          gestureDirection: 'horizontal',
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-subject"
          options={{
            presentation: 'modal',
            title: 'Add New Subject',
            animation: 'fade', // Modal fade in
            gestureEnabled: true,
            gestureDirection: 'vertical',
          }}
        />
        <Stack.Screen
          name="timetable"
          options={{
            title: 'Manage Timetable',
          }}
        />
        <Stack.Screen
          name="add-timetable-entry"
          options={{
            presentation: 'modal',
            title: 'Add Class to Schedule',
            animation: 'fade',
            gestureEnabled: true,
            gestureDirection: 'vertical',
          }}
        />
        <Stack.Screen
          name="add-task"
          options={{
            presentation: 'modal',
            title: 'Add New Task',
            animation: 'fade',
            gestureEnabled: true,
            gestureDirection: 'vertical',
          }}
        />
        <Stack.Screen name="subject/[id]" options={{ title: 'Edit Subject' }} />
      </Stack>
    </>
  );
}