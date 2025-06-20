import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { G, Path, Svg } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { type Subject } from '../lib/database';

// Segmented attendance circle
function SegmentedCircle({ percent, color, size = 48, segments = 10 }: { percent: number | null, color: string, size?: number, segments?: number }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const angleStep = 360 / segments;
  const filledSegments = percent !== null ? Math.round((percent / 100) * segments) : 0;
  const emptyColor = '#E5E7EB';
  const segmentGap = 2; // degrees between segments

  // Helper to get arc for each segment
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
          fontSize: 14,
        }}>
        {percent === null ? 'N/A' : `${Math.round(percent)}%`}
      </Text>
    </Svg>
  );
}

type SubjectListItemProps = {
  subject: Subject;
  onPress: () => void; // Edit
};

export default function SubjectListItem({ subject, onPress }: SubjectListItemProps) {
  const { theme } = useTheme();
  const iconColor = theme === 'dark' ? '#A1A1AA' : '#6B7280';
  const textColor = theme === 'dark' ? '#EAEAEA' : '#1F2937';
  const subtleText = theme === 'dark' ? '#A1A1AA' : '#6B7280';
  const cardBg = theme === 'dark' ? '#171717' : '#FFFFFF';
  const attendance = subject.historical_classes_held > 0
    ? (subject.historical_classes_attended / subject.historical_classes_held) * 100
    : null;
  const target = subject.target_attendance || 75;
  const belowTarget = attendance !== null && attendance < target;
  const attendanceColor = attendance === null ? '#A1A1AA' : (attendance >= target ? '#10B981' : '#EF4444');

  return (
    <Pressable onPress={onPress} className="active:opacity-70">
      <View style={{ flexDirection: 'row', alignItems: 'stretch', marginBottom: 12, borderRadius: 18, backgroundColor: cardBg, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}>
        {/* Colored Bar */}
        <View style={{ width: 6, backgroundColor: subject.color, borderTopLeftRadius: 18, borderBottomLeftRadius: 18 }} />
        {/* Main Content */}
        <View style={{ flex: 1, padding: 16, flexDirection: 'column', justifyContent: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor }}>{subject.name}</Text>
              {subject.teacher_name ? (
                <Text style={{ fontSize: 13, color: subtleText, marginTop: 2 }}>{subject.teacher_name}</Text>
              ) : null}
            </View>
            <Pressable onPress={onPress} style={{ marginLeft: 8, padding: 4, borderRadius: 999 }}>
              <Ionicons name="create-outline" size={22} color={iconColor} />
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14 }}>
            <SegmentedCircle percent={attendance} color={attendanceColor} />
            <View style={{ marginLeft: 16, flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: attendanceColor }}>
                  {attendance === null ? 'N/A' : `${Math.round(attendance)}%`}
                </Text>
                <Text style={{ fontSize: 12, color: subtleText, marginLeft: 8, backgroundColor: '#10B98122', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, fontWeight: 'bold' }}>
                  Target: {target}%
                </Text>
                {belowTarget && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                    <Ionicons name="warning" size={14} color="#EF4444" />
                    <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: 'bold', marginLeft: 2 }}>Below Target</Text>
                  </View>
                )}
              </View>
              <Text style={{ fontSize: 13, color: subtleText }}>
                Classes: {subject.historical_classes_attended}/{subject.historical_classes_held}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}