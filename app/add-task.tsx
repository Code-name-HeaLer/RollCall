import { format, parseISO } from 'date-fns';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';
import StyledInput from '../components/StyledInput';
import SubjectPicker from '../components/SubjectPicker';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { addTask, getAllSubjects, type Subject } from '../lib/database';
import { rescheduleAllNotifications } from '../lib/notifications';

const getFormattedDate = (date: Date) => format(date, 'yyyy-MM-dd');

export default function AddTaskModal() {
  const { theme } = useTheme();
  const { classRemindersEnabled, taskRemindersEnabled } = useSettings();
  const isDark = theme === 'dark';

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [selectedSubject, setSelectedSubject] = useState<number | null>(-1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadSubjects = async () => {
      const fetchedSubjects = await getAllSubjects();
      setSubjects(fetchedSubjects);
    };
    loadSubjects();
  }, []);

  const handleSave = async () => {
    if (!title.trim()) {
      return Alert.alert('Missing Title', 'Please enter a title for the task.');
    }
    setIsLoading(true);
    try {
      await addTask({
        title: title.trim(),
        description: description.trim(),
        dueDate: getFormattedDate(dueDate),
        subjectId: selectedSubject,
      });

      // --- Reschedule all notifications after adding a new task ---
      await rescheduleAllNotifications({
        classReminders: classRemindersEnabled,
        taskReminders: taskRemindersEnabled,
      });

      router.back();
    } catch (error) {
      console.error('Failed to save task:', error);
      Alert.alert('Error', 'An error occurred while saving the task.');
    } finally {
      setIsLoading(false);
    }
  };

  const onDayPress = (day: DateData) => {
    // Use parseISO for reliable date parsing
    setDueDate(parseISO(day.dateString));
    setShowDatePicker(false);
  };
  
  const calendarTheme = useMemo(() => ({
    backgroundColor: isDark ? '#171717' : '#FFFFFF',
    calendarBackground: isDark ? '#171717' : '#FFFFFF',
    textSectionTitleColor: '#6B7280',
    selectedDayBackgroundColor: '#10B981',
    selectedDayTextColor: '#ffffff',
    todayTextColor: '#10B981',
    dayTextColor: isDark ? '#EAEAEA' : '#1F2937',
    textDisabledColor: isDark ? '#404040' : '#d9e1e8',
    arrowColor: '#10B981',
    monthTextColor: isDark ? '#EAEAEA' : '#1F2937',
  }), [isDark]);

  return (
    <>
      <ScrollView
        className="flex-1 bg-background dark:bg-dark-background"
        contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: 'space-between' }}
      >
        <View>
          <Text className="text-3xl font-bold text-text dark:text-dark-text mb-6">New Task</Text>
          <StyledInput label="Task Title" placeholder="e.g., Complete Chapter 5 questions" value={title} onChangeText={setTitle} />
          <StyledInput label="Description (Optional)" placeholder="Details about the task..." value={description} onChangeText={setDescription} multiline />
          <SubjectPicker label="Link to Subject (Optional)" subjects={subjects} selectedValue={selectedSubject} onValueChange={setSelectedSubject} />
          <View className="w-full mb-4">
            <Text className="mb-2 text-base font-medium text-subtle-text dark:text-dark-subtle-text">Due Date</Text>
            <Pressable onPress={() => setShowDatePicker(true)} className="rounded-lg border border-border bg-background p-4 dark:border-dark-border dark:bg-dark-card">
              <Text className="text-base text-text dark:text-dark-text">
                {format(dueDate, 'EEEE, MMMM d, yyyy')}
              </Text>
            </Pressable>
          </View>
        </View>
        <Pressable onPress={handleSave} disabled={isLoading} className="mt-6 w-full items-center justify-center rounded-xl bg-primary p-4 active:opacity-80 disabled:opacity-50">
          {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-xl font-bold text-white">Save Task</Text>}
        </Pressable>
      </ScrollView>
      <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
        <Pressable className="flex-1 items-center justify-center bg-black/60" onPress={() => setShowDatePicker(false)}>
          <Pressable className="w-11/12 rounded-2xl bg-card dark:bg-dark-card p-4 overflow-hidden" onStartShouldSetResponder={() => true}>
            <Calendar
              current={getFormattedDate(dueDate)}
              onDayPress={onDayPress}
              markedDates={{ [getFormattedDate(dueDate)]: { selected: true, selectedColor: '#10B981' } }}
              theme={calendarTheme}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}