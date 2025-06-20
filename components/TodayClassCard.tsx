import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { type AttendanceStatus, type ClassWithSubjectAttendance } from '../lib/database';
import Gauge from './Gauge'; // Import our new, premium Gauge component

const statusConfig = {
  present: { icon: 'checkmark-circle', color: '#10B981', pastel: '#D1FAE5', darkPastel: '#052E16', name: 'PRESENT' },
  absent: { icon: 'close-circle', color: '#EF4444', pastel: '#FEE2E2', darkPastel: '#450A0A', name: 'ABSENT' },
  cancelled: { icon: 'remove-circle', color: '#F97316', pastel: '#FFEED9', darkPastel: '#4F2B09', name: 'CANCELLED' },
  holiday: { icon: 'sunny', color: '#EAB308', pastel: '#FEF3C7', darkPastel: '#422006', name: 'HOLIDAY' },
};

type TodayClassCardProps = {
  classInfo: ClassWithSubjectAttendance;
  status?: AttendanceStatus;
  onMarkAttendance: (timetableId: number, status: AttendanceStatus) => void;
};

export default function TodayClassCard({ classInfo, status, onMarkAttendance }: TodayClassCardProps) {
  const { theme } = useTheme();
  const iconColor = theme === 'dark' ? '#A1A1AA' : '#6B7280';
  const selectedConfig = status ? statusConfig[status] : null;

  const totalAttended = classInfo.historical_classes_attended + classInfo.recorded_present;
  const totalHeld = classInfo.historical_classes_held + classInfo.recorded_present + classInfo.recorded_absent;
  const attendance = totalHeld > 0 ? (totalAttended / totalHeld) * 100 : null;

  const attendanceColor = attendance === null ? '#A1A1AA' :
    (attendance >= classInfo.target_attendance ? '#10B981' : '#EF4444');

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 === 0 ? 12 : h % 12;
    return `${formattedHour}:${minute} ${ampm}`;
  };

  const handlePress = (key: AttendanceStatus) => {
    onMarkAttendance(classInfo.id, key);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View className="mb-4 overflow-hidden rounded-2xl bg-card dark:bg-dark-card shadow-sm">
      <View className="flex-row">
        <View style={{ width: 8, backgroundColor: classInfo.subject_color }} />
        
        <View className="flex-1 flex-row justify-between items-center p-4">
          
          <View className="flex-1 pr-4">
            <Text className="text-xl font-bold text-text dark:text-dark-text" numberOfLines={1}>{classInfo.subject_name}</Text>
            
            <View className="mt-3 space-y-2">
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={18} color={iconColor} />
                <Text className="ml-2 text-base text-subtle-text dark:text-dark-subtle-text">{formatTime(classInfo.start_time)} - {formatTime(classInfo.end_time)}</Text>
              </View>
              {classInfo.location && (
                <View className="flex-row items-center">
                  <Ionicons name="location-outline" size={18} color={iconColor} />
                  <Text className="ml-2 text-base text-subtle-text dark:text-dark-subtle-text">{classInfo.location}</Text>
                </View>
              )}
            </View>
          </View>

          <View className="items-center space-y-2">
            {selectedConfig && (
              <View className="px-2 py-1 rounded-full mb-3" style={{ backgroundColor: theme === 'dark' ? selectedConfig.darkPastel : selectedConfig.pastel }}>
                <Text className="text-xs font-bold" style={{ color: selectedConfig.color }}>{selectedConfig.name}</Text>
              </View>
            )}
            {/* Using a smaller, more appropriate size for the gauge */}
            <Gauge size={60} strokeWidth={8} percent={attendance} color={attendanceColor} />
          </View>
        </View>
      </View>

      <View className="flex-row border-t border-border dark:border-dark-border p-2 justify-around">
        {(Object.keys(statusConfig) as AttendanceStatus[]).map((key) => {
          const config = statusConfig[key];
          const isSelected = status === key;
          return (
            <Pressable key={key} onPress={() => handlePress(key)} className="p-2 items-center justify-center" style={{ opacity: isSelected ? 1 : 0.4 }}>
              <Ionicons name={config.icon} size={30} color={config.color} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}