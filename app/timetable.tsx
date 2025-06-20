import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import DayOfWeekPicker from '../components/DayOfWeekPicker';
import StyledInput from '../components/StyledInput';
import SubjectPicker from '../components/SubjectPicker';
import TimeInput from '../components/TimeInput';
import { useTheme } from '../context/ThemeContext';
import { deleteTimetableEntry, getAllSubjects, getFullTimetable, updateTimetableEntry, type FullTimetableEntry, type Subject } from '../lib/database';

// Helper to convert day index to a string
const dayOfWeekAsString = (dayIndex: number): string => {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayIndex];
};

const DAYS = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

// --- A beautifully designed component for a single class entry ---
const TimetableItem = ({ item, iconColor, onEdit }: { item: FullTimetableEntry, iconColor: string, onEdit: () => void }) => {
  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 === 0 ? 12 : h % 12;
    return `${formattedHour}:${minute} ${ampm}`;
  };

  return (
    <View className="mb-3 flex-row overflow-hidden rounded-xl bg-card dark:bg-dark-card">
      <View style={{ width: 6, backgroundColor: item.subject_color }} />
      <View className="flex-1 p-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-bold text-text dark:text-dark-text">{item.subject_name}</Text>
          <Pressable onPress={onEdit} className="ml-2 p-1 rounded-full active:opacity-60">
            <Ionicons name="create-outline" size={20} color={iconColor} />
          </Pressable>
        </View>
        <View className="my-2 flex-row items-center">
          <Ionicons name="time-outline" size={16} color={iconColor} />
          <Text className="ml-2 text-base text-subtle-text dark:text-dark-subtle-text">
            {formatTime(item.start_time)} - {formatTime(item.end_time)}
          </Text>
        </View>
        {item.location && (
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={16} color={iconColor} />
            <Text className="ml-2 text-base text-subtle-text dark:text-dark-subtle-text">{item.location}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default function TimetableScreen() {
  const [allEntries, setAllEntries] = useState<FullTimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();
  const iconColor = theme === 'dark' ? '#A1A1AA' : '#6B7280';
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editEntry, setEditEntry] = useState<FullTimetableEntry | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [editSubject, setEditSubject] = useState<number | null>(null);
  const [editDay, setEditDay] = useState<number>(0);
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadTimetable = async () => {
        setIsLoading(true);
        const allEntries = await getFullTimetable();
        setAllEntries(allEntries);
        setIsLoading(false);
      };
      const loadSubjects = async () => {
        const fetchedSubjects = await getAllSubjects();
        setSubjects(fetchedSubjects);
      };
      loadTimetable();
      loadSubjects();
    }, [])
  );

  const filteredEntries = allEntries.filter(entry => entry.day_of_week === selectedDay);

  const EmptyTimetable = () => {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Ionicons name="calendar-outline" size={64} color={iconColor} style={{ marginBottom: 16 }} />
        <Text className="text-center text-xl font-bold text-text dark:text-dark-text">Your Week is a Blank Canvas</Text>
        <Text className="mt-2 text-center text-subtle-text dark:text-dark-subtle-text">
          Tap the '+' button to add your first class to the timetable.
        </Text>
      </View>
    );
  };

  // Open edit modal with entry data
  const openEditModal = (entry: FullTimetableEntry) => {
    setEditEntry(entry);
    setEditSubject(entry.subject_id);
    setEditDay(entry.day_of_week);
    setEditStartTime(entry.start_time);
    setEditEndTime(entry.end_time);
    setEditLocation(entry.location || '');
    setEditModalVisible(true);
  };

  // Save changes to entry
  const handleEditSave = async () => {
    if (!editEntry || !editSubject) return;
    if (!editStartTime || !editEndTime) return Alert.alert('Missing Time', 'Please select start and end time.');
    if (editStartTime >= editEndTime) return Alert.alert('Invalid Time', 'End time must be after start time.');
    setEditLoading(true);
    try {
      await updateTimetableEntry({
        id: editEntry.id,
        subjectId: editSubject,
        dayOfWeek: editDay,
        startTime: editStartTime,
        endTime: editEndTime,
        location: editLocation.trim(),
      });
      setEditModalVisible(false);
      // Refresh
      const allEntries = await getFullTimetable();
      setAllEntries(allEntries);
    } catch (e) {
      Alert.alert('Error', 'Failed to update timetable entry.');
    } finally {
      setEditLoading(false);
    }
  };

  // Delete entry
  const handleEditDelete = async () => {
    if (!editEntry) return;
    Alert.alert('Delete Entry', 'Are you sure you want to delete this class?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          setEditLoading(true);
          try {
            await deleteTimetableEntry(editEntry.id);
            setEditModalVisible(false);
            // Refresh
            const allEntries = await getFullTimetable();
            setAllEntries(allEntries);
          } catch (e) {
            Alert.alert('Error', 'Failed to delete timetable entry.');
          } finally {
            setEditLoading(false);
          }
        }
      }
    ]);
  };

  if (isLoading) {
    return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" /></View>;
  }

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      {/* Day Selector */}
      <View className="pt-4 pb-2">
        <FlatList
          data={DAYS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.value.toString()}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => {
            const isSelected = item.value === selectedDay;
            return (
              <Pressable
                onPress={() => setSelectedDay(item.value)}
                className={`mx-1 px-4 py-2 rounded-full border ${isSelected ? 'bg-primary' : 'bg-card dark:bg-dark-card'} ${isSelected ? 'border-primary' : 'border-border dark:border-dark-border'}`}
                style={{ borderColor: isSelected ? '#10B981' : (theme === 'dark' ? '#262626' : '#E5E7EB'), backgroundColor: isSelected ? '#10B981' : (theme === 'dark' ? '#171717' : '#FFFFFF') }}
              >
                <Text className={`font-bold ${isSelected ? 'text-white' : 'text-text dark:text-dark-text'}`}>{item.label}</Text>
              </Pressable>
            );
          }}
        />
      </View>
      {/* Timetable List for Selected Day */}
      <FlatList
        data={filteredEntries}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <TimetableItem item={item} iconColor={iconColor} onEdit={() => openEditModal(item)} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, flexGrow: 1 }}
        ListEmptyComponent={EmptyTimetable}
      />
      <Pressable
        className="absolute bottom-6 right-6 h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg"
        onPress={() => router.push('/add-timetable-entry')}>
        <Ionicons name="add" size={32} color="white" />
      </Pressable>
      {/* Edit Timetable Entry Modal */}
      <Modal visible={editModalVisible} transparent animationType="fade" onRequestClose={() => setEditModalVisible(false)}>
        <View className="flex-1 items-center justify-center bg-black/50">
          <ScrollView className="w-11/12 rounded-2xl bg-card dark:bg-dark-card p-4" contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}>
            <View>
              <SubjectPicker
                label="Subject"
                subjects={subjects}
                selectedValue={editSubject}
                onValueChange={setEditSubject}
              />
              <DayOfWeekPicker label="Day of Week" selectedValue={editDay} onValueChange={setEditDay} />
              <View className="flex-row justify-between">
                <View style={{ width: '48%' }}>
                  <TimeInput label="Start Time" value={editStartTime} onValueChange={setEditStartTime} />
                </View>
                <View style={{ width: '48%' }}>
                  <TimeInput label="End Time" value={editEndTime} onValueChange={setEditEndTime} />
                </View>
              </View>
              <StyledInput
                label="Location (Optional)"
                placeholder="e.g., Room 301"
                value={editLocation}
                onChangeText={setEditLocation}
              />
            </View>
            <View className="mt-6 space-y-3">
              <Pressable
                onPress={handleEditSave}
                disabled={editLoading}
                className="w-full items-center justify-center rounded-xl bg-primary p-4 active:opacity-80 disabled:opacity-50">
                {editLoading ? <ActivityIndicator color="white" /> : <Text className="text-xl font-bold text-white">Save Changes</Text>}
              </Pressable>
              <Pressable
                onPress={handleEditDelete}
                disabled={editLoading}
                className="w-full flex-row items-center justify-center rounded-xl bg-absent/20 p-4 active:opacity-80 mt-3">
                <Ionicons name="trash-outline" size={20} color="#991B1B" />
                <Text className="ml-2 text-lg font-bold" style={{ color: '#991B1B' }}>Delete</Text>
              </Pressable>
              <Pressable
                onPress={() => setEditModalVisible(false)}
                className="w-full items-center justify-center rounded-xl bg-gray-300 p-4 mt-2">
                <Text className="text-base font-medium" style={{ color: theme === 'dark' ? '#EAEAEA' : '#1F2937' }}>Cancel</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}