import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { type TaskWithSubject } from '../lib/database';

type Props = {
  task: TaskWithSubject;
  onToggle: (id: number, currentStatus: boolean) => void;
  onDelete: (id: number) => void;
};

export default function TaskListItem({ task, onToggle, onDelete }: Props) {
  const { theme } = useTheme();
  const isCompleted = task.is_completed === 1;
  const isDark = theme === 'dark';

  // Determine colors based on completion status
  const checkboxColor = isCompleted ? '#6B7280' : '#10B981'; // Grey when done, green when active
  const textColor = isCompleted
    ? (isDark ? '#6B7280' : '#9CA3AF') // Dimmed text when done
    : (isDark ? '#EAEAEA' : '#1F2937'); // Normal text when active
  
  const textDecoration = isCompleted ? 'line-through' : 'none';

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(task.id, !isCompleted);
  };
  
  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onDelete(task.id);
  }

  return (
    <View className="w-full flex-row items-center rounded-2xl bg-card dark:bg-dark-card p-4 mb-3 shadow-sm">
      {/* Checkbox */}
      <Pressable onPress={handleToggle} className="p-1 mr-4">
        <Ionicons
          name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
          size={28}
          color={checkboxColor}
        />
      </Pressable>

      {/* Task Details */}
      <View className="flex-1">
        <Text
          style={{ color: textColor, textDecorationLine: textDecoration }}
          className="text-lg font-semibold"
          numberOfLines={2}
        >
          {task.title}
        </Text>
        <View className="flex-row items-center mt-1 flex-wrap">
          {task.subject_name && (
            <View
              className="flex-row items-center mr-3 px-2 py-1 rounded-full"
              style={{ backgroundColor: `${task.subject_color}20` }} // 20% opacity
            >
              <View className="h-2 w-2 rounded-full mr-1.5" style={{ backgroundColor: task.subject_color || '#ccc' }} />
              <Text style={{ color: task.subject_color || '#ccc' }} className="text-xs font-bold">
                {task.subject_name}
              </Text>
            </View>
          )}
          <Text className="text-sm text-subtle-text dark:text-dark-subtle-text">
            Due: {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>
      </View>
      
      {/* Delete Button */}
      <Pressable onPress={handleDelete} className="p-2 ml-2">
        <Ionicons name="trash-outline" size={22} color={isDark ? '#4B5563' : '#9CA3AF'} />
      </Pressable>
    </View>
  );
}