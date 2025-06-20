import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import SubjectListItem from '../../components/SubjectListItem';
import { useTheme } from '../../context/ThemeContext';
// --- 1. IMPORT THE NEW FUNCTION AND TYPE ---
import { getSubjectsWithAttendance, type SubjectWithAttendance } from '../../lib/database';

export default function SubjectsScreen() {
  // --- 2. USE THE NEW TYPE FOR OUR STATE ---
  const [subjects, setSubjects] = useState<SubjectWithAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const loadSubjects = async () => {
        try {
          setIsLoading(true);
          // --- 3. CALL THE NEW FUNCTION ---
          const fetchedSubjects = await getSubjectsWithAttendance();
          setSubjects(fetchedSubjects);
        } catch (error) {
          console.error('Failed to load subjects with attendance:', error);
        } finally {
          setIsLoading(false);
        }
      };

      loadSubjects();
      return () => {};
    }, [])
  );

  // This component remains the same, it's perfect.
  const EmptyListComponent = () => {
    const { theme } = useTheme();
    const iconColor = theme === 'dark' ? '#A1A1AA' : '#6B7280';

    return (
      <View className="flex-1 items-center justify-center">
        <Ionicons name="school-outline" size={64} color={iconColor} style={{ marginBottom: 16 }} />
        <Text className="text-xl font-bold text-text dark:text-dark-text">No Subjects Yet</Text>
        <Text className="mt-2 text-center text-subtle-text dark:text-dark-subtle-text">
          Tap the '+' button below to add your first subject.
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-dark-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={() => router.push('/timetable')}>
              {({ pressed }) => (
                <Ionicons
                  name="calendar-outline"
                  size={26}
                  color="#10B981"
                  style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                />
              )}
            </Pressable>
          ),
        }}
      />
      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <SubjectListItem 
            subject={item} 
            onPress={() => router.push(`/subject/${item.id}`)}
          />
        )}
        contentContainerStyle={{ flexGrow: 1, padding: 16 }}
        ListEmptyComponent={EmptyListComponent}
      />
      <Pressable
        className="absolute bottom-6 right-6 h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg"
        onPress={() => router.push('/add-subject')}>
        <Ionicons name="add" size={32} color="white" />
      </Pressable>
    </View>
  );
}