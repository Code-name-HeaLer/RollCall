import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { type Subject } from '../lib/database';

interface SubjectPickerProps {
  label: string;
  subjects: Subject[];
  selectedValue: number | null;
  onValueChange: (value: number) => void;
}

export default function SubjectPicker({ label, subjects, selectedValue, onValueChange }: SubjectPickerProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [showModal, setShowModal] = useState(false);

  const selectedSubject = subjects.find((s) => s.id === selectedValue);

  return (
    <View className="w-full mb-4">
      <Text className="mb-2 text-base font-medium text-subtle-text dark:text-dark-subtle-text">
        {label}
      </Text>
      <Pressable
        onPress={() => setShowModal(true)}
        className="rounded-lg border border-border bg-background dark:border-dark-border dark:bg-dark-card p-4 flex-row items-center">
        <Text className="flex-1 text-base text-text dark:text-dark-text">
          {selectedSubject ? selectedSubject.name : '-- Select a Subject --'}
        </Text>
        <Ionicons name="chevron-down" size={20} color={isDark ? '#A1A1AA' : '#6B7280'} />
      </Pressable>
      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="w-11/12 rounded-2xl bg-card dark:bg-dark-card p-4">
            <Text className="mb-4 text-lg font-bold text-text dark:text-dark-text text-center">Select Subject</Text>
            <FlatList
              data={subjects}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                const isSelected = item.id === selectedValue;
                return (
                  <Pressable
                    onPress={() => {
                      onValueChange(item.id);
                      setShowModal(false);
                    }}
                    className={`flex-row items-center px-4 py-3 rounded-lg mb-2 ${isSelected ? 'bg-primary/10' : ''}`}
                    style={{ backgroundColor: isSelected ? (isDark ? '#10B98122' : '#D1FAE5') : undefined }}
                  >
                    <View className="h-3 w-3 rounded-full mr-3" style={{ backgroundColor: item.color }} />
                    <Text className="flex-1 text-base text-text dark:text-dark-text">
                      {item.name}
                    </Text>
                    {isSelected && <Ionicons name="checkmark" size={20} color="#10B981" />}
                  </Pressable>
                );
              }}
              ListEmptyComponent={<Text className="text-center text-subtle-text dark:text-dark-subtle-text">No subjects found.</Text>}
              style={{ maxHeight: 300 }}
            />
            <Pressable
              onPress={() => setShowModal(false)}
              className="mt-4 items-center justify-center rounded-lg bg-gray-300 p-3"
            >
              <Text className="text-base font-medium" style={{ color: isDark ? '#EAEAEA' : '#1F2937' }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}