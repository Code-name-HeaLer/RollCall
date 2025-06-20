import React from 'react';
import { Text } from 'react-native';
import { G, Path, Svg } from 'react-native-svg';

// This is the exact code you wrote, now in its own reusable component file.
export default function SegmentedCircle({ percent, color, size = 48, segments = 10 }: { percent: number | null, color: string, size?: number, segments?: number }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const angleStep = 360 / segments;
  const filledSegments = percent !== null ? Math.round((percent / 100) * segments) : 0;
  const emptyColor = '#E5E7EB';
  const segmentGap = 2; // degrees between segments

  const getArc = (index: number) => {
    const startAngle = angleStep * index - 90 + segmentGap / 2;
    const endAngle = startAngle + angleStep - segmentGap;
    const start = {
      x: center + radius * Math.cos((Math.PI * startAngle) / 180),
      y: center + radius * Math.sin((Math.PI * startAngle) / 180),
    };
    const end = {
      x: center + radius * Math.cos((Math.PI * endAngle) / 180),
      y: center + radius * Math.sin((Math.PI * endAngle) / 180),
    };
    const largeArcFlag = angleStep - segmentGap > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  return (
    <Svg width={size} height={size}>
      <G>
        {[...Array(segments)].map((_, i) => (
          <Path
            key={i}
            d={getArc(i)}
            stroke={i < filledSegments && percent !== null ? color : emptyColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
        ))}
      </G>
      <Text
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: size,
          height: size,
          textAlign: 'center',
          textAlignVertical: 'center',
          fontWeight: 'bold',
          color: percent === null ? emptyColor : color,
          fontSize: size / 3.5, // Make font size relative to circle size
        }}>
        {percent === null ? 'N/A' : `${Math.round(percent)}%`}
      </Text>
    </Svg>
  );
}