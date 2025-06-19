import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function SettingsScreen() {
  const { toggleTheme, theme } = useTheme();

  return (
    <View className="flex-1 items-center justify-center bg-background dark:bg-dark-background p-4">
      <Text className="mb-4 text-xl text-text dark:text-dark-text">Settings Screen</Text>
      
      <Pressable
        onPress={toggleTheme}
        className="rounded-lg bg-primary px-6 py-3"
      >
        <Text className="font-bold text-white">
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
        </Text>
      </Pressable>
    </View>
  );
}