import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import SubjectStatCard from '../../components/SubjectStatCard';
import { useTheme } from '../../context/ThemeContext';
import { getSubjectsWithAttendance, type SubjectWithAttendance } from '../../lib/database';

export default function StatsScreen() {
  const [subjects, setSubjects] = useState<SubjectWithAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  // Fetch data whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setIsLoading(true);
        try {
          const fetchedSubjects = await getSubjectsWithAttendance();
          setSubjects(fetchedSubjects);
        } catch (error) {
          console.error("Failed to load subjects for stats:", error);
        } finally {
          setIsLoading(false);
        }
      };
      loadData();
    }, [])
  );

  // Process the fetched data to find highlights and create a sorted list
  const { bestSubject, worstSubject, otherSubjects } = useMemo(() => {
    // First, calculate the attendance percentage for each subject
    const subjectsWithPercentage = subjects.map(s => {
      const totalAttended = s.historical_classes_attended + s.recorded_present;
      const totalHeld = s.historical_classes_held + s.recorded_present + s.recorded_absent;
      const attendance = totalHeld > 0 ? (totalAttended / totalHeld) * 100 : -1; // Use -1 for subjects with no classes held
      return { ...s, attendance };
    }).filter(s => s.attendance !== -1); // Filter out subjects with no data

    if (subjectsWithPercentage.length === 0) {
      return { bestSubject: null, worstSubject: null, otherSubjects: [] };
    }

    // Sort by attendance to easily find the best and worst
    const sortedSubjects = [...subjectsWithPercentage].sort((a, b) => b.attendance - a.attendance);
    
    const best = sortedSubjects[0];
    const worst = sortedSubjects.length > 1 ? sortedSubjects[sortedSubjects.length - 1] : null;

    // The rest of the subjects, excluding the best and worst if they exist
    const others = sortedSubjects.slice(1, sortedSubjects.length > 1 ? -1 : undefined);

    return { bestSubject: best, worstSubject: worst, otherSubjects: others };
  }, [subjects]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background dark:bg-dark-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Render an empty state if there's no data to show
  if (!bestSubject) {
    const iconColor = theme === 'dark' ? '#A1A1AA' : '#6B7280';
    return (
      <View className="flex-1 justify-center items-center bg-background dark:bg-dark-background p-8">
        <Stack.Screen options={{ title: 'Stats' }} />
        <Ionicons name="stats-chart-outline" size={64} color={iconColor} style={{ marginBottom: 16 }} />
        <Text className="text-xl font-bold text-center text-text dark:text-dark-text">No Stats to Show</Text>
        <Text className="mt-2 text-center text-subtle-text dark:text-dark-subtle-text">
          Start marking attendance on the Home screen to see your performance statistics.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background dark:bg-dark-background" contentContainerStyle={{ padding: 24 }}>
      <Stack.Screen options={{ title: 'Stats' }} />

      {/* Highlights Section */}
      <View className="mb-8">
        <Text className="text-2xl font-bold text-text dark:text-dark-text mb-4">Highlights</Text>
        <View className="space-y-4">
          {bestSubject && (
            <View>
              <Text className="text-sm font-semibold text-present-text dark:text-dark-present-text mb-2 ml-2">🚀 BEST PERFORMANCE</Text>
              <SubjectStatCard subject={bestSubject} />
            </View>
          )}
          {worstSubject && (
            <View>
              <Text className="text-sm font-semibold text-absent-text dark:text-dark-absent-text mb-2 ml-2">⚠️ NEEDS ATTENTION</Text>
              <SubjectStatCard subject={worstSubject} />
            </View>
          )}
        </View>
      </View>

      {/* Course Breakdown Section */}
      {otherSubjects.length > 0 && (
        <View>
          <Text className="text-2xl font-bold text-text dark:text-dark-text mb-4">Course Breakdown</Text>
          {otherSubjects.map(subject => (
            <SubjectStatCard key={subject.id} subject={subject} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}