import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import { Stack } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React from 'react';
import { Alert, ScrollView, View } from 'react-native';
import SettingsRow from '../../components/SettingsRow';
import SettingsSection from '../../components/SettingsSection';
import { useTheme } from '../../context/ThemeContext';
import { generateCsv } from '../../lib/csv';
import { getFullAttendanceHistoryForExport } from '../../lib/database';

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const handleExport = async () => {
    try {
      const data = await getFullAttendanceHistoryForExport();
      if (data.length === 0) {
        Alert.alert("No Data", "There is no attendance data to export.");
        return;
      }
      
      const csvString = generateCsv(data);
      const filename = `rollcall_export_${new Date().toISOString().split('T')[0]}.csv`;
      const fileUri = FileSystem.documentDirectory + filename;

      await FileSystem.writeAsStringAsync(fileUri, csvString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Sharing not available", "Sharing is not available on your device.");
        return;
      }
      
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error("Export failed:", error);
      Alert.alert("Export Failed", "Could not export your attendance data. Please try again.");
    }
  };

  const handleImport = () => {
    Alert.alert("Coming Soon", "This feature is under development.");
  };

  return (
    <ScrollView className="flex-1 bg-background dark:bg-dark-background">
      <Stack.Screen options={{ title: 'Settings' }} />
      <View className="p-6">
        <SettingsSection title="Appearance">
          <SettingsRow
            icon="contrast-outline"
            label="Dark Mode"
            type="switch"
            value={isDark}
            onValueChange={toggleTheme}
          />
        </SettingsSection>

        <SettingsSection title="Notifications">
           <SettingsRow
            icon="notifications-outline"
            label="Class Reminders"
            description="Get notified 15 minutes before a class"
            type="switch"
            value={false} // Placeholder
            onValueChange={() => Alert.alert("Coming Soon", "This feature is under development.")}
          />
        </SettingsSection>
        
        <SettingsSection title="Data Management">
          <SettingsRow
            icon="download-outline"
            label="Export Attendance"
            description="Save all attendance data to a CSV file"
            type="navigate"
            onPress={handleExport}
          />
           <SettingsRow
            icon="share-outline"
            label="Import Data"
            description="Import data from a CSV file"
            type="navigate"
            onPress={handleImport}
          />
        </SettingsSection>

        <SettingsSection title="About">
           <SettingsRow
            icon="information-circle-outline"
            label="App Version"
            description={Constants.expoConfig?.version || '1.0.0'}
            type="button"
          />
        </SettingsSection>
      </View>
    </ScrollView>
  );
}