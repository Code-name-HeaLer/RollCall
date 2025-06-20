import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import SubjectListItem from '../../components/SubjectListItem';
import { useTheme } from '../../context/ThemeContext'; // <-- ADD THIS IMPORT
import { getAllSubjects, type Subject } from '../../lib/database';

export default function SubjectsScreen() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const loadSubjects = async () => {
        try {
          setIsLoading(true);
          const fetchedSubjects = await getAllSubjects();
          setSubjects(fetchedSubjects);
        } catch (error) {
          console.error('Failed to load subjects:', error);
        } finally {
          setIsLoading(false);
        }
      };

      loadSubjects();
      return () => {};
    }, [])
  );

  // Component to render when the list is empty
  const EmptyListComponent = () => {
    const { theme } = useTheme();
    const iconColor = theme === 'dark' ? '#A1A1AA' : '#6B7280'; // Corresponds to dark-subtle-text and subtle-text

    return (
      <View className="flex-1 items-center justify-center">
        {/* We now use the color prop directly */}
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
      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <SubjectListItem subject={item} onPress={() => router.push(`/subject/${item.id}` as any)}/>}
        contentContainerStyle={{ flexGrow: 1, padding: 16 }}
        ListEmptyComponent={EmptyListComponent}
      />

      <Pressable
        className="absolute bottom-6 right-6 h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg"
        onPress={() => {
          // This is the change: navigate to our new modal route
          router.push('/add-subject');
        }}>
        <Ionicons name="add" size={32} color="white" />
      </Pressable>
    </View>
  );
}