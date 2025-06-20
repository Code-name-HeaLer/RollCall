import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { type AttendanceStatus, type FullTimetableEntry } from '../lib/database';

// Define the colors for our attendance buttons
const statusConfig = {
  present: { text: 'Present', icon: 'checkmark-circle-outline', light: 'bg-present', dark: 'bg-dark-present', textClass: 'text-present-text dark:text-dark-present-text' },
  absent: { text: 'Absent', icon: 'close-circle-outline', light: 'bg-absent', dark: 'bg-dark-absent', textClass: 'text-absent-text dark:text-dark-absent-text' },
  cancelled: { text: 'Cancelled', icon: 'remove-circle-outline', light: 'bg-cancelled', dark: 'bg-dark-cancelled', textClass: 'text-cancelled-text dark:text-dark-cancelled-text' },
  holiday: { text: 'Holiday', icon: 'sunny-outline', light: 'bg-holiday', dark: 'bg-dark-holiday', textClass: 'text-holiday-text dark:text-dark-holiday-text' },
};

type TodayClassCardProps = {
  classInfo: FullTimetableEntry;
  status?: AttendanceStatus;
  onMarkAttendance: (timetableId: number, status: AttendanceStatus) => void;
};

// --- This is our beautiful, interactive class card component ---
export default function TodayClassCard({ classInfo, status, onMarkAttendance }: TodayClassCardProps) {
  const { theme } = useTheme();
  const iconColor = theme === 'dark' ? '#A1A1AA' : '#6B7280';

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 === 0 ? 12 : h % 12;
    return `${formattedHour}:${minute} ${ampm}`;
  };

  return (
    <View className="mb-4 overflow-hidden rounded-2xl bg-card dark:bg-dark-card">
      {/* Main Card Content */}
      <View className="flex-row">
        {/* Vertical Color Bar */}
        <View style={{ width: 8, backgroundColor: classInfo.subject_color }} />
        
        <View className="flex-1 p-4">
          <Text className="text-xl font-bold text-text dark:text-dark-text">{classInfo.subject_name}</Text>
          {/* We won't show teacher name here to keep it clean, but you could add it like in SubjectListItem */}
          
          <View className="mt-3 space-y-2">
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={18} color={iconColor} />
              <Text className="ml-2 text-base text-subtle-text dark:text-dark-subtle-text">
                {formatTime(classInfo.start_time)} - {formatTime(classInfo.end_time)}
              </Text>
            </View>
            {classInfo.location && (
              <View className="flex-row items-center">
                <Ionicons name="location-outline" size={18} color={iconColor} />
                <Text className="ml-2 text-base text-subtle-text dark:text-dark-subtle-text">{classInfo.location}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Action Button Bar */}
      <View className="flex-row border-t border-border dark:border-dark-border">
        {(Object.keys(statusConfig) as AttendanceStatus[]).map((key) => {
          const config = statusConfig[key];
          const isSelected = status === key;
          const bgColor = theme === 'dark' ? config.dark : config.light;

          return (
            <Pressable
              key={key}
              onPress={() => onMarkAttendance(classInfo.id, key)}
              className={`flex-1 items-center justify-center py-3 ${isSelected ? bgColor : ''}`}
            >
              <Text className={`font-bold ${isSelected ? config.textClass : 'text-subtle-text dark:text-dark-subtle-text'}`}>
                {config.text}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}