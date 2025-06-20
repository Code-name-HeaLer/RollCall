import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// A small helper to render icons, this keeps the <Tabs.Screen> options cleaner
function TabBarIcon(props: { name: React.ComponentProps<typeof Ionicons>['name']; color: string }) {
  return <Ionicons size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colors = {
    active: '#10B981',
    inactive: isDark ? '#A1A1AA' : '#6B7280',
    background: isDark ? '#0D0D0D' : '#FFFFFF',
    border: isDark ? '#262626' : '#E5E7EB',
    text: isDark ? '#EAEAEA' : '#1F2937',
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
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          headerTitle: () => (
            <Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                letterSpacing: 0.5,
                color: colors.text,
                fontFamily: 'System',
              }}
            >
              RollCall <Text style={{ color: colors.active, fontWeight: '900' }}>Pro</Text>
            </Text>
          ),
          tabBarLabel: 'Home',
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
        name="tasks"
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