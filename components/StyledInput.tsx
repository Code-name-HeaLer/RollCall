import React from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface StyledInputProps extends TextInputProps {
  label: string;
}

export default function StyledInput({ label, ...props }: StyledInputProps) {
  const { theme } = useTheme();

  // Define placeholder text color based on the theme from our tailwind config
  const placeholderColor = theme === 'dark' ? '#A1A1AA' : '#6B7280'; // dark-subtle-text or subtle-text

  return (
    <View className="mb-4 w-full">
      <Text className="mb-2 text-base font-medium text-subtle-text dark:text-dark-subtle-text">
        {label}
      </Text>
      <TextInput
        className="rounded-lg border border-border bg-background p-4 text-base text-text dark:border-dark-border dark:bg-dark-card dark:text-dark-text"
        placeholderTextColor={placeholderColor}
        {...props}
      />
    </View>
  );
}