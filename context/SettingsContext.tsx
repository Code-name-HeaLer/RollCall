import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { rescheduleAllNotifications } from '../lib/notifications';

type SettingsContextType = {
  classRemindersEnabled: boolean;
  taskRemindersEnabled: boolean;
  toggleClassReminders: () => void;
  toggleTaskReminders: () => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [classRemindersEnabled, setClassRemindersEnabled] = useState(false);
  const [taskRemindersEnabled, setTaskRemindersEnabled] = useState(false);

  // Load settings from storage on startup
  useEffect(() => {
    const loadSettings = async () => {
      const classVal = await AsyncStorage.getItem('classRemindersEnabled');
      const taskVal = await AsyncStorage.getItem('taskRemindersEnabled');
      setClassRemindersEnabled(classVal === 'true');
      setTaskRemindersEnabled(taskVal === 'true');
    };
    loadSettings();
  }, []);

  const handleSettingsChange = async (newSettings: { classReminders: boolean; taskReminders: boolean }) => {
    await AsyncStorage.setItem('classRemindersEnabled', newSettings.classReminders.toString());
    await AsyncStorage.setItem('taskRemindersEnabled', newSettings.taskReminders.toString());
    await rescheduleAllNotifications(newSettings);
  };

  const toggleClassReminders = () => {
    const newValue = !classRemindersEnabled;
    setClassRemindersEnabled(newValue);
    handleSettingsChange({ classReminders: newValue, taskReminders: taskRemindersEnabled });
  };

  const toggleTaskReminders = () => {
    const newValue = !taskRemindersEnabled;
    setTaskRemindersEnabled(newValue);
    handleSettingsChange({ classReminders: classRemindersEnabled, taskReminders: newValue });
  };

  return (
    <SettingsContext.Provider value={{ classRemindersEnabled, taskRemindersEnabled, toggleClassReminders, toggleTaskReminders }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
};