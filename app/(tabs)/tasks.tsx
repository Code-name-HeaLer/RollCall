import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, SectionList, Text, View } from 'react-native';
import TaskListItem from '../../components/TaskListItem';
import { useSettings } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';
import { deleteTask, getAllTasks, toggleTaskCompletion, type TaskWithSubject } from '../../lib/database';
import { rescheduleAllNotifications } from '../../lib/notifications';

export default function TasksScreen() {
  const { classRemindersEnabled, taskRemindersEnabled } = useSettings();
  const [tasks, setTasks] = useState<TaskWithSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  const loadData = useCallback(async () => {
    try {
      const fetchedTasks = await getAllTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadData().finally(() => setIsLoading(false));
    }, [loadData])
  );
  
  const handleToggleTask = async (id: number, currentStatus: boolean) => {
    setTasks(prevTasks => prevTasks.map(t => t.id === id ? { ...t, is_completed: currentStatus ? 1 : 0 } : t));
    try {
      await toggleTaskCompletion(id, currentStatus);
      await rescheduleAllNotifications({ classReminders: classRemindersEnabled, taskReminders: taskRemindersEnabled });
    } catch (e) {
      setTasks(prevTasks => prevTasks.map(t => t.id === id ? { ...t, is_completed: !currentStatus ? 1 : 0 } : t));
      Alert.alert("Error", "Failed to update task status.");
    }
  };
  
  const handleDeleteTask = (id: number) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        setTasks(prevTasks => prevTasks.filter(t => t.id !== id));
        try { 
          await deleteTask(id); 
          await rescheduleAllNotifications({ classReminders: classRemindersEnabled, taskReminders: taskRemindersEnabled });
        } 
        catch (e) { Alert.alert("Error", "Failed to delete task."); loadData(); }
      }}
    ]);
  };

  const sections = useMemo(() => {
    const todo = tasks.filter(t => t.is_completed === 0);
    const completed = tasks.filter(t => t.is_completed === 1);
    const data = [];
    if (todo.length > 0) data.push({ title: 'To-Do', data: todo });
    if (completed.length > 0) data.push({ title: 'Completed', data: completed });
    return data;
  }, [tasks]);

  // --- THIS IS THE FIX FOR THE EMPTY STATE ---
  const EmptyTasks = () => {
    const iconColor = theme === 'dark' ? '#A1A1AA' : '#6B7280';
    return (
        <View className="flex-1 items-center justify-center p-8">
            <Ionicons name="checkmark-done-circle-outline" size={64} color={iconColor} style={{ marginBottom: 16 }} />
            <Text className="text-center text-xl font-bold text-text dark:text-dark-text">All Clear!</Text>
            <Text className="mt-2 text-center text-subtle-text dark:text-dark-subtle-text">
            You have no tasks. Tap the '+' button to add a new assignment or to-do.
            </Text>
        </View>
    );
  };

  if (isLoading) {
    return <View className="flex-1 justify-center items-center bg-background dark:bg-dark-background"><ActivityIndicator size="large" /></View>;
  }

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <Stack.Screen options={{ title: 'Tasks' }} />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TaskListItem task={item} onToggle={handleToggleTask} onDelete={handleDeleteTask} />
        )}
        renderSectionHeader={({ section: { title, data } }) => (
          <View className="flex-row items-center justify-between px-4 pb-2 pt-6">
            <Text className="text-2xl font-bold tracking-wider text-text dark:text-dark-text">{title}</Text>
            <Text className="text-sm font-bold text-subtle-text dark:text-dark-subtle-text">{data.length}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, flexGrow: 1 }} // Add flexGrow: 1
        ListEmptyComponent={EmptyTasks} // Hook up the empty component
      />
      <Pressable
        className="absolute bottom-6 right-6 h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg"
        onPress={() => router.push('/add-task')}>
        <Ionicons name="add" size={32} color="white" />
      </Pressable>
    </View>
  );
}