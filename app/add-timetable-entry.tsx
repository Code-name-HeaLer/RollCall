import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import DayOfWeekPicker from '../components/DayOfWeekPicker';
import StyledInput from '../components/StyledInput';
import SubjectPicker from '../components/SubjectPicker';
import TimeInput from '../components/TimeInput';
import { addTimetableEntry, getAllSubjects, type Subject } from '../lib/database';

export default function AddTimetableEntryModal() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [day, setDay] = useState(new Date().getDay()); // Default to today
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch subjects for the picker when the modal opens
  useEffect(() => {
    const loadSubjects = async () => {
      const fetchedSubjects = await getAllSubjects();
      setSubjects(fetchedSubjects);
    };
    loadSubjects();
  }, []);

  const handleSave = async () => {
    // --- Form Validation ---
    if (!selectedSubject) return Alert.alert('No Subject', 'Please select a subject for this class.');
    if (!startTime) return Alert.alert('Missing Time', 'Please select a start time.');
    if (!endTime) return Alert.alert('Missing Time', 'Please select an end time.');

    // Simple time comparison
    if (startTime >= endTime) {
      return Alert.alert('Invalid Time', 'End time must be after the start time.');
    }

    setIsLoading(true);
    try {
      await addTimetableEntry({
        subjectId: selectedSubject,
        dayOfWeek: day,
        startTime,
        endTime,
        location: location.trim(),
      });
      router.back();
    } catch (error) {
      console.error('Failed to save timetable entry:', error);
      Alert.alert('Error', 'An error occurred while saving the class schedule.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-background dark:bg-dark-background"
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', padding: 24 }}>
      <View>
        <SubjectPicker
          label="Subject"
          subjects={subjects}
          selectedValue={selectedSubject}
          onValueChange={(val) => setSelectedSubject(val)}
        />

        <DayOfWeekPicker label="Day of Week" selectedValue={day} onValueChange={setDay} />

        <View className="flex-row justify-between">
          <View style={{ width: '48%' }}>
            <TimeInput label="Start Time" value={startTime} onValueChange={setStartTime} />
          </View>
          <View style={{ width: '48%' }}>
            <TimeInput label="End Time" value={endTime} onValueChange={setEndTime} />
          </View>
        </View>

        <StyledInput
          label="Location (Optional)"
          placeholder="e.g., Room 301"
          value={location}
          onChangeText={setLocation}
        />
      </View>

      <Pressable
        onPress={handleSave}
        disabled={isLoading}
        className="w-full items-center justify-center rounded-xl bg-primary p-4 active:opacity-80 disabled:opacity-50">
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-xl font-bold text-white">Add to Schedule</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}