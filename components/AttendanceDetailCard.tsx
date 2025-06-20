import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { type AttendanceDetail, type AttendanceStatus } from '../lib/database';

const statusConfig = {
  present: { icon: 'checkmark-circle', color: '#10B981' },
  absent: { icon: 'close-circle', color: '#EF4444' },
  cancelled: { icon: 'remove-circle', color: '#F97316' },
  holiday: { icon: 'sunny', color: '#EAB308' },
};

type Props = {
  detail: AttendanceDetail;
  onUpdate: (timetableId: number, status: AttendanceStatus) => void;
};

export default function AttendanceDetailCard({ detail, onUpdate }: Props) {
  const { theme } = useTheme();
  const iconColor = theme === 'dark' ? '#A1A1AA' : '#6B7280';

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 === 0 ? 12 : h % 12;
    return `${formattedHour}:${minute} ${ampm}`;
  };

  const handlePress = (status: AttendanceStatus) => {
    onUpdate(detail.id, status);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View className="mb-3 w-full rounded-xl bg-card dark:bg-dark-card shadow-sm">
      <View className="flex-row items-center p-4">
        <View className="mr-4 h-3 w-3 rounded-full" style={{ backgroundColor: detail.subject_color }} />
        <View className="flex-1">
          <Text className="text-lg font-bold text-text dark:text-dark-text">{detail.subject_name}</Text>
          <Text className="text-sm text-subtle-text dark:text-dark-subtle-text">
            {formatTime(detail.start_time)} - {formatTime(detail.end_time)}
          </Text>
        </View>
      </View>
      <View className="flex-row border-t border-border dark:border-dark-border justify-around p-1">
        {(Object.keys(statusConfig) as AttendanceStatus[]).map((key) => {
          const config = statusConfig[key];
          const isSelected = detail.status === key;
          return (
            <Pressable
              key={key}
              onPress={() => handlePress(key)}
              className="flex-1 items-center rounded-lg p-2"
              style={{ backgroundColor: isSelected ? `${config.color}20` : 'transparent' }} // Subtle background for selected
            >
              <Ionicons name={config.icon} size={26} color={isSelected ? config.color : iconColor} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}