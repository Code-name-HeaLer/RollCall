import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { type SubjectWithAttendance } from '../lib/database';
import Gauge from './Gauge'; // <-- IMPORT the working GAUGE component

type SubjectListItemProps = {
  subject: SubjectWithAttendance;
  onPress: () => void;
};

export default function SubjectListItem({ subject, onPress }: SubjectListItemProps) {
  const { theme } = useTheme();
  const iconColor = theme === 'dark' ? '#A1A1AA' : '#6B7280';
  const textColor = theme === 'dark' ? '#EAEAEA' : '#1F2937';
  const subtleText = theme === 'dark' ? '#A1A1AA' : '#6B7280';
  const cardBg = theme === 'dark' ? '#171717' : '#FFFFFF';
  
  const totalAttended = subject.historical_classes_attended + subject.recorded_present;
  const totalHeld = subject.historical_classes_held + subject.recorded_present + subject.recorded_absent;
  
  const attendance = totalHeld > 0 ? (totalAttended / totalHeld) * 100 : null;
  const target = subject.target_attendance || 75;
  
  const attendanceColor = attendance === null ? '#A1A1AA' :
  (attendance >= target ? '#10B981' : '#EF4444');

  return (
    <Pressable onPress={onPress} className="active:opacity-70">
      <View style={{ flexDirection: 'row', alignItems: 'stretch', marginBottom: 12, borderRadius: 18, backgroundColor: cardBg, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}>
        <View style={{ width: 6, backgroundColor: subject.color, borderTopLeftRadius: 18, borderBottomLeftRadius: 18 }} />
        <View style={{ flex: 1, padding: 16, flexDirection: 'column', justifyContent: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor }} numberOfLines={1}>{subject.name}</Text>
              {subject.teacher_name ? (
                <Text style={{ fontSize: 13, color: subtleText, marginTop: 2 }}>{subject.teacher_name}</Text>
              ) : null}
            </View>
            <Pressable onPress={onPress} style={{ padding: 4, borderRadius: 999 }}>
              <Ionicons name="create-outline" size={22} color={iconColor} />
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14 }}>
          <Gauge size={60} strokeWidth={7} percent={attendance} color={attendanceColor} />
            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text style={{ fontSize: 13, color: subtleText }}>
                Target: {target}%
              </Text>
              <Text style={{ fontSize: 13, color: subtleText, marginTop: 4 }}>
                Classes: {totalAttended}/{totalHeld}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}