import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface GaugeProps {
  size: number;
  strokeWidth?: number; // Keep for compatibility but won't use
  percent: number | null;
  color: string;
}

export default function Gauge({ size, percent, color }: GaugeProps) {
  const { theme } = useTheme();
  const trackColor = theme === 'dark' ? '#3F3F46' : '#E5E7EB';

  const percentage = percent === null ? 0 : Math.min(Math.max(percent, 0), 100);
  const iconSize = size;
  const fontSize = size / 5;

  return (
    <View style={{ 
      width: size, 
      height: size, 
      justifyContent: 'center', 
      alignItems: 'center',
      position: 'relative' 
    }}>
      {/* Background dashed circle */}
      <Ionicons 
        name="radio-button-off" 
        size={iconSize} 
        color={trackColor}
        style={{ position: 'absolute' }}
      />
      
      {/* Progress indicator */}
      {percent !== null && percentage > 0 && (
        <View style={{ 
          position: 'absolute',
          width: iconSize,
          height: iconSize,
          overflow: 'hidden',
          transform: [{ rotate: '-90deg' }] // Start from top
        }}>
          <View style={{
            width: iconSize,
            height: iconSize * (percentage / 100),
            overflow: 'hidden'
          }}>
            <Ionicons 
              name="radio-button-off" 
              size={iconSize} 
              color={color}
            />
          </View>
        </View>
      )}
      
      {/* Center text */}
      <Text style={{
        fontSize: fontSize,
        fontWeight: '600',
        color: percent === null ? trackColor : color,
        textAlign: 'center',
        position: 'absolute'
      }}>
        {percent === null ? 'N/A' : `${Math.round(percentage)}%`}
      </Text>
    </View>
  );
}