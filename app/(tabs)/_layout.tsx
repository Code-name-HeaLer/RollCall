import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useTheme } from '../../context/ThemeContext';

// A small helper to render icons, this keeps the <Tabs.Screen> options cleaner
function TabBarIcon(props: { name: React.ComponentProps<typeof Ionicons>['name']; color: string }) {
  return <Ionicons size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { theme } = useTheme(); // Get the current theme from our context
  const isDark = theme === 'dark';

  // Define colors for the tab bar based on the current theme using our tailwind config names
  // Find and REPLACE the entire 'colors' object with this
const colors = {
  // The active tint for icons and text
  active: '#10B981', // Our new primary green

  // The inactive tint for icons and text
  inactive: isDark ? '#A1A1AA' : '#6B7280', // New dark-subtle-text or old light subtle-text

  // This is the key part for your question:
  // The background color for both the tab bar and the header
  background: isDark ? '#0D0D0D' : '#FFFFFF', // New deep dark or standard white

  // The border color for the top of the tab bar and bottom of the header
  border: isDark ? '#262626' : '#E5E7EB', // New subtle dark border or standard light border

  // The color for the header title text
  text: isDark ? '#EAEAEA' : '#1F2937' // New off-white dark text or standard light text
};

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.active,
        tabBarInactiveTintColor: colors.inactive,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.background,
          shadowOpacity: 0,
          elevation: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTitleStyle: {
          color: colors.text,
        },
        headerShown: true, // Display a header on each screen
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="subjects"
        options={{
          title: 'Subjects',
          tabBarIcon: ({ color }) => <TabBarIcon name="library-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color }) => <TabBarIcon name="stats-chart-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasks" // This should match your file name `app/(tabs)/tasks.tsx`
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => <TabBarIcon name="checkmark-done-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabBarIcon name="settings-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}