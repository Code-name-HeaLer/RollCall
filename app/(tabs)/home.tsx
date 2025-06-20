import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import TodayClassCard from '../../components/TodayClassCard';
import { useTheme } from '../../context/ThemeContext';
import {
  calculateOverallAttendance,
  getAttendanceForDate,
  getClassesForDayWithAttendance,
  markAttendance,
  type AttendanceStatus,
  type ClassWithSubjectAttendance,
} from '../../lib/database';

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
  const [todaysClasses, setTodaysClasses] = useState<ClassWithSubjectAttendance[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Map<number, AttendanceStatus>>(new Map());

  const today = new Date();
  const formattedDate = getFormattedDate(today);
  const dateString = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setIsLoading(true);
        try {
          const dayOfWeek = today.getDay();
          const [classes, overall, records] = await Promise.all([
            getClassesForDayWithAttendance(dayOfWeek),
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

  const handleMarkAttendance = async (timetableId: number, status: AttendanceStatus) => {
    const originalRecords = new Map(attendanceRecords);
    const newRecords = new Map(attendanceRecords);
    newRecords.set(timetableId, status);
    setAttendanceRecords(newRecords);

    try {
      await markAttendance(timetableId, formattedDate, status);
    } catch (error) {
      console.error('Failed to mark attendance:', error);
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
      <View>
        <Text className="text-3xl font-bold text-text dark:text-dark-text">Hello!</Text>
        <Text className="text-lg text-subtle-text dark:text-dark-subtle-text">{dateString}</Text>
      </View>

      <View className="mt-8">
        <Text className="text-2xl font-bold text-text dark:text-dark-text mb-4">At a Glance</Text>
        <View className="flex-row" style={{ gap: 16 }}>
          <View className="flex-1 items-center justify-center rounded-2xl bg-present/10 dark:bg-dark-present/40 p-4">
            <Text className="text-3xl font-bold text-present-text dark:text-dark-present-text">
              {overallAttendance === null ? 'N/A' : `${Math.round(overallAttendance)}%`}
            </Text>
            <Text className="text-sm font-medium text-subtle-text dark:text-dark-subtle-text mt-1">Overall</Text>
          </View>
          <View className="flex-1 items-center justify-center rounded-2xl bg-holiday/10 dark:bg-dark-holiday/40 p-4">
            <Text className="text-3xl font-bold text-holiday-text dark:text-dark-holiday-text">
              {todaysClasses.length}
            </Text>
            <Text className="text-sm font-medium text-subtle-text dark:text-dark-subtle-text mt-1">Classes Today</Text>
          </View>
        </View>
      </View>
      
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