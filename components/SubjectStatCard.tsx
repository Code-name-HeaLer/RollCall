import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { type SubjectWithAttendance } from '../lib/database';

type Props = {
  subject: SubjectWithAttendance;
};

export default function SubjectStatCard({ subject }: Props) {
  const { theme } = useTheme();
  const trackColor = theme === 'dark' ? '#3F3F46' : '#E5E7EB';

  const totalAttended = subject.historical_classes_attended + subject.recorded_present;
  const totalHeld = subject.historical_classes_held + subject.recorded_present + subject.recorded_absent;
  const attendance = totalHeld > 0 ? (totalAttended / totalHeld) * 100 : 0;
  const target = subject.target_attendance || 75;

  const isAboveTarget = attendance >= target;
  const progressColor = isAboveTarget ? '#10B981' : '#EF4444';

  return (
    <View className="w-full rounded-2xl bg-card dark:bg-dark-card p-4 mb-4 shadow-sm">
      <View className="flex-row justify-between items-center">
        <Text className="text-lg font-bold text-text dark:text-dark-text" numberOfLines={1}>
          {subject.name}
        </Text>
        <Text className="text-lg font-bold" style={{ color: progressColor }}>
          {Math.round(attendance)}%
        </Text>
      </View>
      <View className="flex-row justify-between items-center mt-1">
        <Text className="text-sm text-subtle-text dark:text-dark-subtle-text">
          {totalAttended} / {totalHeld} classes
        </Text>
        <Text className="text-sm text-subtle-text dark:text-dark-subtle-text">
          Target: {target}%
        </Text>
      </View>

      {/* Progress Bar */}
      <View className="mt-4 h-3 w-full rounded-full" style={{ backgroundColor: trackColor }}>
        {/* The actual progress */}
        <View
          className="h-3 rounded-full"
          style={{
            width: `${Math.min(attendance, 100)}%`, // Cap at 100%
            backgroundColor: progressColor,
          }}
        />
        {/* Target Line marker */}
        <View
          className="absolute top-[-4px] bottom-[-4px] w-0.5"
          style={{
            left: `${target}%`,
            backgroundColor: theme === 'dark' ? '#FFFFFF40' : '#00000040',
          }}
        />
      </View>
    </View>
  );
}