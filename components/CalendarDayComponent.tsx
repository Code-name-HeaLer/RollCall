import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { type DayAttendanceSummary } from '../lib/database';

interface CalendarDayProps {
  date: string; // The full date string, e.g., '2024-07-25'
  dayNumber: number; // Just the number of the day, e.g., 25
  isCurrentMonth: boolean; // Is this day part of the currently viewed month?
  isSelected: boolean;
  summary?: DayAttendanceSummary;
}

// Map status types to their colors from our theme
const dotColors = {
  present: '#10B981',   // Green
  absent: '#EF4444',    // Red
  holiday: '#EAB308',   // Yellow
  cancelled: '#F97316', // Orange
};

export default function CalendarDayComponent({
  dayNumber,
  isCurrentMonth,
  isSelected,
  summary,
}: CalendarDayProps) {
  const { theme } = useTheme();

  // Define colors based on the current theme
  const selectedBgColor = '#10B981'; // Our primary green
  const selectedTextColor = '#FFFFFF';
  const defaultTextColor = theme === 'dark' ? '#EAEAEA' : '#1F2937';
  const otherMonthTextColor = theme === 'dark' ? '#4B5563' : '#9CA3AF'; // Dimmed color

  return (
    <View className="h-14 w-14 items-center justify-start pt-2">
      {/* Container for the number, which will have the selection circle */}
      <View
        className={`h-8 w-8 items-center justify-center rounded-full ${isSelected ? 'opacity-100' : 'opacity-0'}`}
        style={{ backgroundColor: selectedBgColor }}
      >
        <Text
          style={{
            color: isSelected ? selectedTextColor : (isCurrentMonth ? defaultTextColor : otherMonthTextColor),
            fontWeight: isSelected ? 'bold' : 'normal',
          }}
          className="text-base"
        >
          {dayNumber}
        </Text>
      </View>
      
      {/* Dot container - rendered below the number */}
      <View className="mt-1 flex-row items-center justify-center space-x-1">
        {summary?.present > 0 && <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColors.present }} />}
        {summary?.absent > 0 && <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColors.absent }} />}
        {summary?.cancelled > 0 && <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColors.cancelled }} />}
        {summary?.holiday > 0 && <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColors.holiday }} />}
      </View>
    </View>
  );
}