import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import ColorPicker from '../components/ColorPicker';
import StyledInput from '../components/StyledInput';
import { addSubject } from '../lib/database';

const PRESET_COLORS = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#14B8A6', '#0EA5E9', '#6366F1', '#A855F7', '#EC4899'];

export default function AddSubjectModal() {
  const [name, setName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[3]);
  const [target, setTarget] = useState('75');
  const [classesHeld, setClassesHeld] = useState('');
  const [classesAttended, setClassesAttended] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    // --- Enhanced Validation ---
    if (!name.trim()) return Alert.alert('Missing Name', 'Please enter a name for the subject.');
    const targetNum = parseFloat(target);
    if (isNaN(targetNum) || targetNum < 0 || targetNum > 100) return Alert.alert('Invalid Target', 'Please enter a target attendance between 0 and 100.');
    
    const heldNum = parseInt(classesHeld || '0', 10);
    const attendedNum = parseInt(classesAttended || '0', 10);

    if (heldNum < 0 || attendedNum < 0 || attendedNum > heldNum) {
      return Alert.alert('Invalid History', 'Classes attended cannot be greater than classes held, and values cannot be negative.');
    }

    setIsLoading(true);
    try {
      await addSubject({
        name: name.trim(),
        color,
        targetAttendance: targetNum,
        teacherName: teacherName.trim(),
        classesHeld: heldNum,
        classesAttended: attendedNum
      });
      router.back();
    } catch (error) {
      console.error('Failed to save subject:', error);
      Alert.alert('Error', 'An error occurred while saving the subject.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background dark:bg-dark-background" contentContainerStyle={{ padding: 24, flexGrow: 1 }}>
      <View className="flex-1">
        <Text className="text-3xl font-bold text-text dark:text-dark-text mb-2">New Subject</Text>
        <StyledInput label="Subject Name" placeholder="e.g., Advanced Algorithms" value={name} onChangeText={setName} />
        <StyledInput label="Teacher Name (Optional)" placeholder="e.g., Dr. Smith" value={teacherName} onChangeText={setTeacherName} />
        <StyledInput label="Target Attendance (%)" placeholder="e.g., 75" value={target} onChangeText={setTarget} keyboardType="numeric" />
        <ColorPicker selectedColor={color} onColorChange={setColor} />
        
        <View className="mt-6 border-t border-border dark:border-dark-border pt-6">
          <Text className="text-xl font-bold text-text dark:text-dark-text mb-2">Mid-Semester Start? (Optional)</Text>
          <Text className="text-subtle-text dark:text-dark-subtle-text mb-4">If you're starting mid-way, fill this in to get an accurate attendance percentage from day one.</Text>
          <StyledInput label="Classes Already Held" placeholder="e.g., 20" value={classesHeld} onChangeText={setClassesHeld} keyboardType="number-pad" />
          <StyledInput label="Classes Already Attended" placeholder="e.g., 15" value={classesAttended} onChangeText={setClassesAttended} keyboardType="number-pad" />
        </View>
      </View>

      <Pressable onPress={handleSave} disabled={isLoading} className="mt-6 w-full items-center justify-center rounded-xl bg-primary p-4 active:opacity-80 disabled:opacity-50">
        {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-xl font-bold text-white">Save Subject</Text>}
      </Pressable>
    </ScrollView>
  );
}