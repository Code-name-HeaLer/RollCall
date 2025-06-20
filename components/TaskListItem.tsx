import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
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

  const checkboxColor = isCompleted ? '#6B7280' : '#10B981';
  const textColor = isCompleted ? (isDark ? '#6B7280' : '#9CA3AF') : (isDark ? '#EAEAEA' : '#1F2937');
  const subtleTextColor = isCompleted ? (isDark ? '#4B5563' : '#D1D5DB') : (isDark ? '#9CA3AF' : '#6B7280');
  
  const textDecoration = isCompleted ? 'line-through' : 'none';

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(task.id, !isCompleted);
  };
  
  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onDelete(task.id);
  }

  const dueDateObject = task.due_date ? parseISO(task.due_date) : null;
  const dueDateDisplay = dueDateObject && !isNaN(dueDateObject.getTime())
    ? format(dueDateObject, 'MMM d')
    : 'No due date';

  return (
    <View className="w-full flex-row items-center rounded-2xl bg-card dark:bg-dark-card p-4 mb-3 shadow-sm">
      <Pressable onPress={handleToggle} className="p-1 mr-4 self-start">
        <Ionicons
          name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
          size={28}
          color={checkboxColor}
        />
      </Pressable>

      <View className="flex-1">
        <Text
          style={{ color: textColor, textDecorationLine: textDecoration }}
          className="text-lg font-semibold"
        >
          {task.title}
        </Text>

        {/* --- THIS IS THE FIX --- */}
        {/* Conditionally render the description if it exists */}
        {task.description ? (
          <Text
            style={{ color: subtleTextColor, textDecorationLine: textDecoration }}
            className="text-sm mt-1"
            numberOfLines={3} // Limit to 3 lines to prevent huge cards
          >
            {task.description}
          </Text>
        ) : null}
        
        <View className="flex-row items-center mt-2 flex-wrap">
          {task.subject_name && (
            <View
              className="flex-row items-center mr-3 px-2 py-1 rounded-full"
              style={{ backgroundColor: `${task.subject_color}20` }}
            >
              <View className="h-2 w-2 rounded-full mr-1.5" style={{ backgroundColor: task.subject_color || '#ccc' }} />
              <Text style={{ color: task.subject_color || '#ccc' }} className="text-xs font-bold">
                {task.subject_name}
              </Text>
            </View>
          )}
          <Text style={{ color: subtleTextColor }} className="text-sm">
          Due: {dueDateDisplay}
          </Text>
        </View>
      </View>
      
      <Pressable onPress={handleDelete} className="p-2 ml-2 self-start">
        <Ionicons name="trash-outline" size={22} color={isDark ? '#4B5563' : '#9CA3AF'} />
      </Pressable>
    </View>
  );
}