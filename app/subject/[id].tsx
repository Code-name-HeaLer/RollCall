import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import ColorPicker from '../../components/ColorPicker';
import StyledInput from '../../components/StyledInput';
import { deleteSubject, getSubjectById, updateSubject, type Subject } from '../../lib/database';

const PRESET_COLORS = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#14B8A6', '#0EA5E9', '#6366F1', '#A855F7', '#EC4899'];

export default function SubjectDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const subjectId = parseInt(id || '0', 10);

  const [subject, setSubject] = useState<Subject | null>(null);
  const [name, setName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [target, setTarget] = useState('75');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!subjectId) return;
    const loadSubjectData = async () => {
      try {
        const data = await getSubjectById(subjectId);
        if (data) {
          setSubject(data);
          setName(data.name);
          setTeacherName(data.teacher_name || '');
          setColor(data.color);
          setTarget(data.target_attendance.toString());
        }
      } catch (err) { console.error('Failed to load subject data:', err); } finally { setIsLoading(false); }
    };
    loadSubjectData();
  }, [subjectId]);

  const handleUpdate = async () => {
    if (!name.trim()) return Alert.alert('Missing Name', 'Please enter a name.');
    const targetNum = parseFloat(target);
    if (isNaN(targetNum) || targetNum < 0 || targetNum > 100) return Alert.alert('Invalid Target', 'Please enter a target between 0 and 100.');

    setIsSaving(true);
    try {
      await updateSubject(subjectId, { name: name.trim(), color, targetAttendance: targetNum, teacherName: teacherName.trim() });
      router.back();
    } catch (err) {
      console.error('Failed to update subject:', err);
      Alert.alert('Error', 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Subject', `Are you sure you want to delete "${subject?.name}"?`,
      [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await deleteSubject(subjectId); router.back(); }
        catch (err) { console.error('Failed to delete subject:', err); }
      }}]);
  };

  if (isLoading) return <View className="flex-1 items-center justify-center bg-background dark:bg-dark-background"><ActivityIndicator size="large" /></View>;
  if (!subject) return <View className="flex-1 items-center justify-center bg-background dark:bg-dark-background"><Text>Subject not found.</Text></View>;

  return (
    <ScrollView
      className="flex-1 bg-background dark:bg-dark-background"
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', padding: 24 }}>
      <View>
        <StyledInput label="Subject Name" value={name} onChangeText={setName} />
        <StyledInput label="Teacher Name (Optional)" value={teacherName} onChangeText={setTeacherName} />
        <StyledInput label="Target Attendance (%)" value={target} onChangeText={setTarget} keyboardType="numeric" />
        <ColorPicker selectedColor={color} onColorChange={setColor} />
        {subject.historical_classes_held > 0 && (
          <View className="mt-6 border-t border-border dark:border-dark-border pt-6">
            <Text className="text-xl font-bold text-text dark:text-dark-text mb-2">Initial Data</Text>
            <Text className="text-base text-subtle-text dark:text-dark-subtle-text">
              Started with {subject.historical_classes_attended} classes attended out of {subject.historical_classes_held}.
            </Text>
          </View>
        )}
      </View>
      <View className="space-y-5">
        <Pressable onPress={handleUpdate} disabled={isSaving} className="w-full items-center justify-center rounded-xl bg-primary p-4 active:opacity-80 disabled:opacity-50">
          {isSaving ? <ActivityIndicator color="white" /> : <Text className="text-xl font-bold text-white">Save Changes</Text>}
        </Pressable>
        <Pressable onPress={handleDelete} className="w-full flex-row items-center justify-center rounded-xl bg-absent/20 p-4 active:opacity-80 mt-3">
          <Ionicons name="trash-outline" size={20} color="#991B1B" />
          <Text className="ml-2 text-lg font-bold" style={{ color: '#991B1B' }}>Delete Subject</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}