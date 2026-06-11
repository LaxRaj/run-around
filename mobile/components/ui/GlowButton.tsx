import React, { useCallback } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';

interface GlowButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'ghost';
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function GlowButton({ label, onPress, disabled = false, variant = 'primary' }: GlowButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(0.85, { duration: 80 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 120 });
  }, []);

  if (variant === 'ghost') {
    return (
      <AnimatedPressable
        style={[styles.ghostContainer, animStyle]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        <Text style={styles.ghostLabel}>{label}</Text>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      style={[styles.wrapper, animStyle, disabled && styles.disabled]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      {/* outer glow ring */}
      <View style={styles.glowRing} />
      <LinearGradient
        colors={['#8B5FFF', '#6C3EFF', '#5028E0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 18,
    overflow: 'visible',
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    inset: -6,
    borderRadius: 24,
    backgroundColor: Colors.accent.glow,
    // blur not natively supported; shadow approximates it on iOS
    shadowColor: Colors.accent.DEFAULT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
  },
  gradient: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  ghostContainer: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  ghostLabel: {
    color: Colors.text.secondary,
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  disabled: {
    opacity: 0.4,
  },
});
