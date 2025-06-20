import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native'; // <-- Add Pressable
import { useTheme } from '../context/ThemeContext';
import { type Subject } from '../lib/database';

type SubjectListItemProps = {
  subject: Subject;
  onPress: () => void; // <-- Add onPress to the props
};

export default function SubjectListItem({ subject, onPress }: SubjectListItemProps) {
  const { theme } = useTheme();
  const iconColor = theme === 'dark' ? '#A1A1AA' : '#6B7280';

  return (
    // Wrap the entire View in a Pressable
    <Pressable onPress={onPress} className="active:opacity-70">
      <View className="mb-3 flex-row items-center rounded-xl bg-card dark:bg-dark-card p-4">
        {/* Colored Circle */}
        <View
          className="mr-4 h-5 w-5 rounded-full"
          style={{ backgroundColor: subject.color }}
        />

        {/* Subject Name */}
        <Text className="flex-1 text-lg font-medium text-text dark:text-dark-text">
          {subject.name}
        </Text>

        {/* Chevron Icon */}
        <Ionicons name="chevron-forward" size={24} color={iconColor} />
      </View>
    </Pressable>
  );
}