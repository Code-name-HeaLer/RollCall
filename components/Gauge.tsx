import React from 'react';
import { Circle, G, Svg, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

interface GaugeProps {
  size: number;
  strokeWidth: number;
  percent: number | null;
  color: string;
}

export default function Gauge({ size, strokeWidth, percent, color }: GaugeProps) {
  const { theme } = useTheme();
  const trackColor = theme === 'dark' ? '#3F3F46' : '#E5E7EB'; // Darker track for better contrast

  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // --- THIS IS THE KEY TO THE DASHED EFFECT ---
  // A lower dash count creates more distinct, visible dashes.
  const dashCount = 28; 
  const dashLength = circumference / dashCount;
  // A larger gap makes the dashes look more like distinct segments.
  const gapLength = dashLength * 1.5; 
  const strokeDasharray = `${dashLength} ${gapLength}`;

  const percentage = percent === null ? 0 : Math.min(Math.max(percent, 0), 100);
  
  // Calculate the offset to show progress
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Rotate the entire gauge to start from the top */}
      <G transform={`rotate(-90, ${center}, ${center})`}>
        {/* 1. Background Track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeLinecap="round" // Creates rounded ends for each dash
          fill="none"
        />

        {/* 2. Progress Indicator */}
        {percent !== null && (
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color} // Progress color (green or red)
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
          />
        )}
      </G>

      {/* 3. Text in the Center */}
      <SvgText
        x={center}
        y={center}
        textAnchor="middle"
        dy={size / 14} // Fine-tuned vertical alignment
        fontSize={size / 4.5}
        fontWeight="bold"
        fill={percent === null ? trackColor : color}
      >
        {percent === null ? 'N/A' : `${Math.round(percentage)}%`}
      </SvgText>
    </Svg>
  );
}