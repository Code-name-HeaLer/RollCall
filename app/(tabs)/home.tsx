import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import SegmentedCircle from '../../components/SegmentedCircle';
import TodayClassCard from '../../components/TodayClassCard';
import { useTheme } from '../../context/ThemeContext';
import {
  calculateOverallAttendance,
  getAttendanceForDate,
  getClassesForDay,
  markAttendance,
  type AttendanceStatus,
  type FullTimetableEntry,
} from '../../lib/database';

// Helper to format date as YYYY-MM-DD
const getFormattedDate = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function HomeScreen() {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [overallAttendance, setOverallAttendance] = useState<number | null>(null);
  const [todaysClasses, setTodaysClasses] = useState<FullTimetableEntry[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Map<number, AttendanceStatus>>(new Map());

  const today = new Date();
  const formattedDate = getFormattedDate(today);
  const dateString = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Load all necessary data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setIsLoading(true);
        try {
          const dayOfWeek = today.getDay();
          const [classes, overall, records] = await Promise.all([
            getClassesForDay(dayOfWeek),
            calculateOverallAttendance(),
            getAttendanceForDate(formattedDate),
          ]);
          setTodaysClasses(classes);
          setOverallAttendance(overall);
          setAttendanceRecords(records);
        } catch (error) {
          console.error('Failed to load home screen data:', error);
        } finally {
          setIsLoading(false);
        }
      };
      loadData();
    }, [])
  );

  // Handle marking attendance
  const handleMarkAttendance = async (timetableId: number, status: AttendanceStatus) => {
    // Optimistic update for instant UI feedback
    const originalRecords = new Map(attendanceRecords);
    const newRecords = new Map(attendanceRecords);
    newRecords.set(timetableId, status);
    setAttendanceRecords(newRecords);

    try {
      await markAttendance(timetableId, formattedDate, status);
    } catch (error) {
      console.error('Failed to mark attendance:', error);
      // Revert on error
      setAttendanceRecords(originalRecords);
    }
  };
  
  const renderEmptyState = () => {
    const iconColor = theme === 'dark' ? '#A1A1AA' : '#6B7280';
    return (
      <View className="items-center justify-center rounded-2xl bg-card dark:bg-dark-card p-8 mt-6">
        <Ionicons name="cafe-outline" size={64} color={iconColor} style={{ marginBottom: 16 }} />
        <Text className="text-center text-xl font-bold text-text dark:text-dark-text">No Classes Today</Text>
        <Text className="mt-2 text-center text-subtle-text dark:text-dark-subtle-text">
          Enjoy your day off or get ahead on your tasks!
        </Text>
      </View>
    );
  };
  
  if (isLoading) {
    return <View className="flex-1 justify-center items-center bg-background dark:bg-dark-background"><ActivityIndicator size="large" /></View>;
  }

  return (
    <ScrollView className="flex-1 bg-background dark:bg-dark-background" contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
      {/* Header Greeting */}
      <View>
        <Text className="text-3xl font-bold text-text dark:text-dark-text">Hello!</Text>
        <Text className="text-lg text-subtle-text dark:text-dark-subtle-text">{dateString}</Text>
      </View>

      {/* Overall Attendance Card */}
      <View className="mt-8 items-center justify-center rounded-2xl bg-card dark:bg-dark-card p-6">
        <Text className="text-lg font-semibold text-subtle-text dark:text-dark-subtle-text mb-4">Overall Attendance</Text>
        <SegmentedCircle
          percent={overallAttendance}
          color={overallAttendance && overallAttendance >= 75 ? '#10B981' : '#EF4444'}
          size={150}
          segments={20}
        />
      </View>
      
      {/* Today's Schedule */}
      <View className="mt-8">
        <Text className="text-2xl font-bold text-text dark:text-dark-text">Today's Schedule</Text>
        {todaysClasses.length > 0 ? (
          <View className="mt-4">
            {todaysClasses.map((classItem) => (
              <TodayClassCard
                key={classItem.id}
                classInfo={classItem}
                status={attendanceRecords.get(classItem.id)}
                onMarkAttendance={handleMarkAttendance}
              />
            ))}
          </View>
        ) : (
          renderEmptyState()
        )}
      </View>
    </ScrollView>
  );
}