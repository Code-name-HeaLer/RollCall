import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import { Modal, Platform, Pressable, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface TimeInputProps {
  label: string;
  value: string; // "HH:mm"
  onValueChange: (value: string) => void;
}

const hours = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12
const minutes = Array.from({ length: 60 }, (_, i) => i); // 0-59
const ampmOptions = ['AM', 'PM'];

export default function TimeInput({ label, value, onValueChange }: TimeInputProps) {
  const [showPicker, setShowPicker] = useState(false);
  const { theme } = useTheme();
  const iconColor = theme === 'dark' ? '#A1A1AA' : '#6B7280';
  const isDark = theme === 'dark';

  // Parse value or default to 12:00 AM
  let hour = 12, minute = 0, ampm = 'AM';
  if (value) {
    const [h, m] = value.split(':').map(Number);
    ampm = h >= 12 ? 'PM' : 'AM';
    hour = h % 12 === 0 ? 12 : h % 12;
    minute = m;
  }
  const [selectedHour, setSelectedHour] = useState(hour);
  const [selectedMinute, setSelectedMinute] = useState(minute);
  const [selectedAMPM, setSelectedAMPM] = useState(ampm);

  // For native picker
  const getInitialDate = () => {
    if (value) {
      const [h, m] = value.split(':').map(Number);
      const date = new Date();
      date.setHours(h);
      date.setMinutes(m);
      date.setSeconds(0);
      date.setMilliseconds(0);
      return date;
    }
    return new Date();
  };
  const [pickerValue, setPickerValue] = useState(getInitialDate());

  // Sync picker state with value prop
  React.useEffect(() => {
    if (value) {
      const [h, m] = value.split(':').map(Number);
      const ampmVal = h >= 12 ? 'PM' : 'AM';
      setSelectedHour(h % 12 === 0 ? 12 : h % 12);
      setSelectedMinute(m);
      setSelectedAMPM(ampmVal);
      // Also update native picker value
      const date = new Date();
      date.setHours(h);
      date.setMinutes(m);
      date.setSeconds(0);
      date.setMilliseconds(0);
      setPickerValue(date);
    }
  }, [value]);

  const displayTime = () => {
    if (!value) return 'Select Time';
    const [h, m] = value.split(':');
    const hourNum = parseInt(h, 10);
    const ampmVal = hourNum >= 12 ? 'PM' : 'AM';
    const formattedHour = hourNum % 12 === 0 ? 12 : hourNum % 12;
    return `${formattedHour}:${m.padStart(2, '0')} ${ampmVal}`;
  };

  const handleConfirm = () => {
    let h = selectedHour % 12;
    if (selectedAMPM === 'PM') h += 12;
    if (selectedAMPM === 'AM' && h === 12) h = 0;
    const hoursStr = h.toString().padStart(2, '0');
    const minutesStr = selectedMinute.toString().padStart(2, '0');
    onValueChange(`${hoursStr}:${minutesStr}`);
    setShowPicker(false);
  };

  // Native Android time picker handler
  const handleNativeChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      onValueChange(`${hours}:${minutes}`);
    }
  };

  return (
    <>
      <View className="w-full mb-4">
        <Text className="mb-2 text-base font-medium text-subtle-text dark:text-dark-subtle-text">
          {label}
        </Text>
        <Pressable
          onPress={() => setShowPicker(true)}
          className="flex-row items-center rounded-lg border border-border bg-background p-4 dark:border-dark-border dark:bg-dark-card">
          <Ionicons name="time-outline" size={20} color={iconColor} />
          <Text className="ml-3 flex-1 text-base text-text dark:text-dark-text">
            {displayTime()}
          </Text>
        </Pressable>
      </View>

      {/* Native Android Picker */}
      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={pickerValue}
          mode="time"
          is24Hour={false}
          display="clock"
          onChange={handleNativeChange}
        />
      )}

      {/* Custom Modal for other platforms */}
      {showPicker && Platform.OS !== 'android' && (
        <Modal visible={showPicker} transparent animationType="fade" onRequestClose={() => setShowPicker(false)}>
          <View className="flex-1 items-center justify-center bg-black/50">
            <View className="w-11/12 rounded-2xl bg-card p-4 dark:bg-dark-card items-center">
              <View className="flex-row w-full justify-between mb-4">
                <View style={{ flex: 1 }}>
                  <Text className="mb-2 text-center" style={{ color: isDark ? '#EAEAEA' : '#1F2937' }}>Hour</Text>
                  <Picker
                    selectedValue={selectedHour}
                    onValueChange={setSelectedHour}
                    style={{ width: '100%', color: isDark ? '#EAEAEA' : '#1F2937' }}>
                    {hours.map(h => (
                      <Picker.Item key={h} label={h.toString()} value={h} />
                    ))}
                  </Picker>
                </View>
                <View style={{ flex: 1 }}>
                  <Text className="mb-2 text-center" style={{ color: isDark ? '#EAEAEA' : '#1F2937' }}>Minute</Text>
                  <Picker
                    selectedValue={selectedMinute}
                    onValueChange={setSelectedMinute}
                    style={{ width: '100%', color: isDark ? '#EAEAEA' : '#1F2937' }}>
                    {minutes.map(m => (
                      <Picker.Item key={m} label={m.toString().padStart(2, '0')} value={m} />
                    ))}
                  </Picker>
                </View>
                <View style={{ flex: 1 }}>
                  <Text className="mb-2 text-center" style={{ color: isDark ? '#EAEAEA' : '#1F2937' }}>AM/PM</Text>
                  <Picker
                    selectedValue={selectedAMPM}
                    onValueChange={setSelectedAMPM}
                    style={{ width: '100%', color: isDark ? '#EAEAEA' : '#1F2937' }}>
                    {ampmOptions.map(ap => (
                      <Picker.Item key={ap} label={ap} value={ap} />
                    ))}
                  </Picker>
                </View>
              </View>
              <View className="flex-row mt-4 w-full" style={{ gap: 12 }}>
                <Pressable
                  className="flex-1 flex-row items-center justify-center rounded-lg bg-gray-100 dark:bg-[#23272f] p-3"
                  onPress={() => setShowPicker(false)}>
                  <Ionicons name="close" size={22} color={isDark ? '#EAEAEA' : '#1F2937'} />
                  <Text className="ml-2 text-xl font-bold text-text dark:text-dark-text">Cancel</Text>
                </Pressable>
                <Pressable
                  className="flex-1 flex-row items-center justify-center rounded-lg bg-primary p-3"
                  onPress={handleConfirm}>
                  <Ionicons name="checkmark" size={22} color="white" />
                  <Text className="ml-2 text-xl font-bold text-white">Confirm</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}