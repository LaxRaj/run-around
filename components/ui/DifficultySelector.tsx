import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Colors, DIFFICULTY_CONFIG, type DifficultyLevel } from '@/constants/colors';

interface DifficultySelectorProps {
  value: DifficultyLevel;
  onChange: (level: DifficultyLevel) => void;
}

const LEVELS: DifficultyLevel[] = ['easy', 'moderate', 'hard'];

export function DifficultySelector({ value, onChange }: DifficultySelectorProps) {
  return (
    <View style={styles.row}>
      {LEVELS.map((level) => (
        <DifficultyPill
          key={level}
          level={level}
          selected={level === value}
          onPress={() => onChange(level)}
        />
      ))}
    </View>
  );
}

function DifficultyPill({
  level,
  selected,
  onPress,
}: {
  level: DifficultyLevel;
  selected: boolean;
  onPress: () => void;
}) {
  const config = DIFFICULTY_CONFIG[level];
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    borderColor: withTiming(selected ? config.color : Colors.border.DEFAULT, {
      duration: 220,
    }),
    backgroundColor: withTiming(
      selected ? `${config.color}18` : Colors.bg.elevated,
      { duration: 220 },
    ),
    shadowOpacity: withTiming(selected ? 0.45 : 0, { duration: 220 }),
  }));

  const dotStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(
      selected ? config.color : Colors.text.muted,
      { duration: 220 },
    ),
    transform: [
      { scale: withSpring(selected ? 1 : 0.6, { damping: 12, stiffness: 200 }) },
    ],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: withTiming(selected ? config.color : Colors.text.secondary, {
      duration: 220,
    }),
  }));

  const sublabelStyle = useAnimatedStyle(() => ({
    color: withTiming(
      selected ? `${config.color}99` : Colors.text.muted,
      { duration: 220 },
    ),
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.95, { damping: 14, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 10, stiffness: 200 });
      }}
      style={{ flex: 1 }}
    >
      <Animated.View
        style={[styles.pill, containerStyle, animStyle, {
          shadowColor: config.color,
        }]}
      >
        <Animated.View style={[styles.dot, dotStyle]} />
        <Animated.Text style={[styles.label, labelStyle]}>
          {config.label}
        </Animated.Text>
        <Animated.Text style={[styles.sublabel, sublabelStyle]}>
          {config.sublabel}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 6,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 14,
    elevation: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  sublabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
