import { Stack } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';
import AttendanceDetailCard from '../../components/AttendanceDetailCard';
import { useTheme } from '../../context/ThemeContext';
import { getAttendanceDetailsForDate, getMonthlyAttendanceSummary, markAttendance, type AttendanceDetail, type AttendanceStatus } from '../../lib/database';

const getMonthBounds = (date: Date) => {
  const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
  const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  return { startDate: formatDate(startDate), endDate: formatDate(endDate) };
};

const dotColors = {
  present: '#10B981', absent: '#EF4444', cancelled: '#F97316', holiday: '#EAB308',
};

export default function CalendarScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selectedDate, setSelectedDate] = useState<DateData | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [markedDates, setMarkedDates] = useState({});
  const [selectedDayDetails, setSelectedDayDetails] = useState<AttendanceDetail[]>([]);

  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  const fetchMonthlySummary = async (monthDate: Date) => {
    setIsSummaryLoading(true);
    const { startDate, endDate } = getMonthBounds(monthDate);
    try {
      const summary = await getMonthlyAttendanceSummary(startDate, endDate);
      const newMarkedDates: { [key: string]: any } = {};
      summary.forEach((daySummary, dateString) => {
        const dots = [];
        if (daySummary.present > 0) dots.push({ key: 'present', color: dotColors.present });
        if (daySummary.absent > 0) dots.push({ key: 'absent', color: dotColors.absent });
        if (daySummary.cancelled > 0) dots.push({ key: 'cancelled', color: dotColors.cancelled });
        if (daySummary.holiday > 0) dots.push({ key: 'holiday', color: dotColors.holiday });
        newMarkedDates[dateString] = { dots };
      });
      setMarkedDates(newMarkedDates);
    } catch (error) { console.error('Failed to load monthly summary', error); }
    finally { setIsSummaryLoading(false); }
  };

  const fetchDetailsForDay = async (day: DateData) => {
    setIsDetailsLoading(true);
    try {
      const details = await getAttendanceDetailsForDate(day.dateString, new Date(day.timestamp).getDay());
      setSelectedDayDetails(details);
    } catch (e) { console.error('Failed to fetch details for day'); }
    finally { setIsDetailsLoading(false); }
  };

  useEffect(() => {
    fetchMonthlySummary(currentMonth);
  }, [currentMonth]);

  useEffect(() => {
    if (selectedDate) {
      fetchDetailsForDay(selectedDate);
    } else {
      setSelectedDayDetails([]); // Clear details if no date is selected
    }
  }, [selectedDate]);

  const onDayPress = (day: DateData) => {
    setSelectedDate(day);
  };

  const handleUpdateAttendance = async (timetableId: number, status: AttendanceStatus) => {
    if (!selectedDate) return;
    try {
      await markAttendance(timetableId, selectedDate.dateString, status);
      // After updating, re-fetch both the details for the day and the summary for the month
      // to ensure both the list and the dots on the calendar are updated.
      await Promise.all([
        fetchDetailsForDay(selectedDate),
        fetchMonthlySummary(currentMonth)
      ]);
    } catch (e) { console.error('Failed to update attendance'); }
  };

  const finalMarkedDates = useMemo(() => {
    if (!selectedDate) return markedDates;
    return {
      ...markedDates,
      [selectedDate.dateString]: { ...markedDates[selectedDate.dateString], selected: true, selectedColor: '#10B981' }
    };
  }, [markedDates, selectedDate]);

  const calendarTheme = useMemo(() => ({
    backgroundColor: isDark ? '#0D0D0D' : '#F8F8F9',
    calendarBackground: isDark ? '#0D0D0D' : '#F8F8F9',
    textSectionTitleColor: '#6B7280',
    selectedDayBackgroundColor: '#10B981',
    selectedDayTextColor: '#ffffff',
    todayTextColor: '#10B981',
    dayTextColor: isDark ? '#EAEAEA' : '#1F2937',
    textDisabledColor: isDark ? '#404040' : '#d9e1e8', // Adjusted dark disabled color
    dotColor: '#10B981',
    selectedDotColor: '#ffffff',
    arrowColor: '#10B981',
    monthTextColor: isDark ? '#EAEAEA' : '#1F2937',
    indicatorColor: '#10B981',
    textDayFontWeight: '300' as const,
    textMonthFontWeight: 'bold' as const,
    textDayHeaderFontWeight: '300' as const,
    textDayFontSize: 16,
    textMonthFontSize: 18,
    textDayHeaderFontSize: 14,
  }), [isDark]);

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      <Stack.Screen options={{ title: "Attendance History" }} />
      <View className='p-4'>
        <Calendar
          key={theme} // <-- THIS IS THE FIX. Force re-mount on theme change.
          onDayPress={onDayPress}
          onMonthChange={(month) => setCurrentMonth(new Date(month.timestamp))}
          markingType={'multi-dot'}
          markedDates={finalMarkedDates}
          theme={calendarTheme}
        />
        {isSummaryLoading && <View className="absolute top-24 self-center"><ActivityIndicator /></View>}
      </View>

      <View className="flex-1 border-t border-border dark:border-dark-border px-4 pt-4">
        {isDetailsLoading ? (
          <ActivityIndicator className="mt-8" />
        ) : selectedDate ? (
          selectedDayDetails.length > 0 ? (
            <FlatList
              data={selectedDayDetails}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <AttendanceDetailCard detail={item} onUpdate={handleUpdateAttendance} />}
            />
          ) : (
            <Text className="text-center text-subtle-text dark:text-dark-subtle-text mt-8">No classes scheduled for this day.</Text>
          )
        ) : (
          <Text className="text-center text-subtle-text dark:text-dark-subtle-text mt-8">Select a date to view and edit attendance.</Text>
        )}
      </View>
    </View>
  );
}