import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

const DAYS = [
  { label: 'S', value: 0 }, // Sunday
  { label: 'M', value: 1 },
  { label: 'T', value: 2 },
  { label: 'W', value: 3 },
  { label: 'T', value: 4 },
  { label: 'F', value: 5 },
  { label: 'S', value: 6 },
];

interface DayOfWeekPickerProps {
  label: string;
  selectedValue: number;
  onValueChange: (value: number) => void;
}

export default function DayOfWeekPicker({ label, selectedValue, onValueChange }: DayOfWeekPickerProps) {
  const handleSelect = (value: number) => {
    onValueChange(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View className="w-full mb-4">
      <Text className="mb-2 text-base font-medium text-subtle-text dark:text-dark-subtle-text">
        {label}
      </Text>
      <View className="flex-row justify-between">
        {DAYS.map((day) => {
          const isSelected = selectedValue === day.value;
          return (
            <Pressable
              key={day.value}
              onPress={() => handleSelect(day.value)}
              className={`h-12 w-12 items-center justify-center rounded-full border ${
                isSelected
                  ? 'border-primary bg-primary'
                  : 'border-border dark:border-dark-border'
              }`}>
              <Text
                className={`text-lg font-bold ${
                  isSelected ? 'text-white' : 'text-text dark:text-dark-text'
                }`}>
                {day.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}