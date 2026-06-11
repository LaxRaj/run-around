import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Colors, DISTANCE_PRESETS } from '@/constants/colors';

const { width: SCREEN_W } = Dimensions.get('window');
const ITEM_W = 72;
const ITEM_GAP = 12;
const ITEM_FULL = ITEM_W + ITEM_GAP;

interface DistanceSelectorProps {
  value: number;
  onChange: (miles: number) => void;
}

export function DistanceSelector({ value, onChange }: DistanceSelectorProps) {
  const scrollRef = useRef<ScrollView>(null);

  const handleSelect = useCallback(
    (miles: number, idx: number) => {
      onChange(miles);
      scrollRef.current?.scrollTo({
        x: Math.max(0, idx * ITEM_FULL - (SCREEN_W - ITEM_FULL) / 2),
        animated: true,
      });
    },
    [onChange],
  );

  const displayMiles = Number.isInteger(value) ? `${value}` : value.toFixed(1);

  return (
    <View style={styles.container}>
      <View style={styles.bigDisplay}>
        <Text style={styles.bigNumber}>{displayMiles}</Text>
        <Text style={styles.bigUnit}>mi</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={ITEM_FULL}
        snapToAlignment="center"
      >
        {DISTANCE_PRESETS.map((miles, idx) => (
          <DistanceItem
            key={miles}
            miles={miles}
            selected={miles === value}
            onPress={() => handleSelect(miles, idx)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function DistanceItem({
  miles,
  selected,
  onPress,
}: {
  miles: number;
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    borderColor: withTiming(
      selected ? Colors.accent.DEFAULT : Colors.border.DEFAULT,
      { duration: 200 },
    ),
    backgroundColor: withTiming(
      selected ? Colors.accent.muted : Colors.bg.elevated,
      { duration: 200 },
    ),
    shadowOpacity: withTiming(selected ? 0.5 : 0, { duration: 200 }),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: withTiming(selected ? '#FFFFFF' : Colors.text.secondary, {
      duration: 200,
    }),
  }));

  const displayLabel = Number.isInteger(miles) ? `${miles}` : miles.toFixed(1);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.93, { damping: 12, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 10, stiffness: 200 });
      }}
    >
      <Animated.View style={[styles.item, containerStyle, animStyle]}>
        <Animated.Text style={[styles.itemLabel, labelStyle]}>
          {displayLabel}
        </Animated.Text>
        <Animated.Text style={[styles.itemUnit, labelStyle]}>mi</Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  bigDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    paddingHorizontal: 4,
  },
  bigNumber: {
    fontSize: 72,
    fontWeight: '800',
    color: Colors.text.DEFAULT,
    lineHeight: 76,
    letterSpacing: -2,
  },
  bigUnit: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.accent.light,
    paddingBottom: 10,
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 4,
    gap: ITEM_GAP,
    alignItems: 'center',
  },
  item: {
    width: ITEM_W,
    height: ITEM_W,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    shadowColor: Colors.accent.DEFAULT,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    elevation: 6,
  },
  itemLabel: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  itemUnit: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
