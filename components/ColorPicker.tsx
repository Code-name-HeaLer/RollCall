import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

// A curated list of modern, aesthetically pleasing colors.
const PRESET_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#22C55E', // Green
  '#14B8A6', // Teal
  '#0EA5E9', // Sky Blue
  '#6366F1', // Indigo
  '#A855F7', // Purple
  '#EC4899', // Pink
];

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export default function ColorPicker({ selectedColor, onColorChange }: ColorPickerProps) {
  const handleSelectColor = (color: string) => {
    onColorChange(color);
    // Provide haptic feedback for a premium feel
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View className="w-full">
      <Text className="mb-2 text-base font-medium text-subtle-text dark:text-dark-subtle-text">
        Subject Color
      </Text>
      <FlatList
        data={PRESET_COLORS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        renderItem={({ item: color }) => {
          const isSelected = selectedColor === color;
          return (
            <Pressable
              onPress={() => handleSelectColor(color)}
              className="mr-3 h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: color }}>
              {isSelected && <Ionicons name="checkmark" size={28} color="white" />}
            </Pressable>
          );
        }}
        contentContainerStyle={{ paddingVertical: 8 }}
      />
    </View>
  );
}