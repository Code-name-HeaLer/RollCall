import React from 'react';
import { Text, View } from 'react-native';

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function SettingsSection({ title, children }: Props) {
  return (
    <View className="mb-8">
      <Text className="text-lg font-bold text-text dark:text-dark-text px-4 mb-2">{title}</Text>
      <View className="rounded-xl bg-card dark:bg-dark-card overflow-hidden">
        {children}
      </View>
    </View>
  );
}