import React from 'react';
import { Path, Svg, Text as SvgText } from 'react-native-svg'; // Import SvgText

export default function SegmentedCircle({ percent, color, size = 48, segments = 10 }: { percent: number | null, color: string, size?: number, segments?: number }) {
  const strokeWidth = size / 8;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const emptyColor = '#E5E7EB'; // Use the same empty color for both themes for simplicity
  
  const filledSegments = percent !== null ? Math.round((percent / 100) * segments) : 0;
  const angleStep = 360 / segments;
  const segmentGap = 4;

  const getArc = (index: number) => {
    const startAngle = angleStep * index - 90 + segmentGap / 2;
    const endAngle = startAngle + angleStep - segmentGap;
    const start = { x: center + radius * Math.cos((Math.PI * startAngle) / 180), y: center + radius * Math.sin((Math.PI * startAngle) / 180) };
    const end = { x: center + radius * Math.cos((Math.PI * endAngle) / 180), y: center + radius * Math.sin((Math.PI * endAngle) / 180) };
    const largeArcFlag = angleStep - segmentGap > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Draw all empty segments first */}
      {[...Array(segments)].map((_, i) => (
        <Path key={`empty-${i}`} d={getArc(i)} stroke={emptyColor} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
      ))}
      {/* Draw filled segments on top */}
      {percent !== null && [...Array(filledSegments)].map((_, i) => (
        <Path key={`filled-${i}`} d={getArc(i)} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
      ))}
      
      {/* THIS IS THE FIX: Use SvgText for text inside an SVG */}
      <SvgText
        x={center}
        y={center}
        textAnchor="middle" // Horizontally center
        dy={size / 20} // Nudge text down slightly to vertically center
        fontSize={size / 3.5}
        fontWeight="bold"
        fill={percent === null ? emptyColor : color}
      >
        {percent === null ? 'N/A' : `${Math.round(percent)}%`}
      </SvgText>
    </Svg>
  );
}