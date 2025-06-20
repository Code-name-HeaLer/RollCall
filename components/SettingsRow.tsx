import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

type Props = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  description?: string;
  type: 'navigate' | 'switch' | 'button';
  onPress?: () => void;
  value?: boolean; // For switch
  onValueChange?: (value: boolean) => void; // For switch
};

export default function SettingsRow({ icon, label, description, type, onPress, value, onValueChange }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Pressable onPress={onPress} className="active:bg-black/5 dark:active:bg-white/5">
      <View className="flex-row items-center p-4">
        <Ionicons name={icon} size={24} color={isDark ? '#A1A1AA' : '#6B7280'} />
        <View className="flex-1 mx-4">
          <Text className="text-base text-text dark:text-dark-text">{label}</Text>
          {description && (
            <Text className="text-sm text-subtle-text dark:text-dark-subtle-text mt-1">{description}</Text>
          )}
        </View>
        {type === 'navigate' && <Ionicons name="chevron-forward" size={22} color={isDark ? '#4B5563' : '#9CA3AF'} />}
        {type === 'switch' && (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: '#767577', true: '#10B981' }}
            thumbColor={'#f4f3f4'}
          />
        )}
      </View>
    </Pressable>
  );
}