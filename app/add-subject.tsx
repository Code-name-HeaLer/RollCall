import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import ColorPicker from '../components/ColorPicker';
import StyledInput from '../components/StyledInput';
import { addSubject } from '../lib/database';

// A default selection of colors for the picker
const PRESET_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#14B8A6', '#0EA5E9', '#6366F1', '#A855F7', '#EC4899',
];

export default function AddSubjectModal() {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[3]); // Default to a nice green
  const [target, setTarget] = useState('75'); // Default target attendance
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter a name for the subject.');
      return;
    }

    const targetPercentage = parseFloat(target);
    if (isNaN(targetPercentage) || targetPercentage < 0 || targetPercentage > 100) {
      Alert.alert('Invalid Target', 'Please enter a target attendance between 0 and 100.');
      return;
    }

    setIsLoading(true);
    try {
      await addSubject(name.trim(), color, targetPercentage);
      // Go back to the previous screen (the subjects list)
      // The useFocusEffect on that screen will automatically refresh the list for us!
      router.back();
    } catch (error) {
      console.error('Failed to save subject:', error);
      Alert.alert('Error', 'An error occurred while saving the subject.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background dark:bg-dark-background p-6">
      <View className="mb-6">
        <Text className="text-3xl font-bold text-text dark:text-dark-text">New Subject</Text>
        <Text className="text-base text-subtle-text dark:text-dark-subtle-text">
          Fill in the details for your new course.
        </Text>
      </View>

      <StyledInput label="Subject Name" placeholder="e.g., Advanced Algorithms" value={name} onChangeText={setName} />

      <StyledInput
        label="Target Attendance (%)"
        placeholder="e.g., 75"
        value={target}
        onChangeText={setTarget}
        keyboardType="numeric"
      />

      <ColorPicker selectedColor={color} onColorChange={setColor} />

      {/* Spacer to push button to the bottom */}
      <View className="flex-1" />

      {/* Save Button */}
      <Pressable
        onPress={handleSave}
        disabled={isLoading}
        className="w-full items-center justify-center rounded-xl bg-primary p-4 active:opacity-80 disabled:opacity-50">
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-xl font-bold text-white">Save Subject</Text>
        )}
      </Pressable>
    </View>
  );
}