import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Location from 'expo-location';

import { GlowButton } from '@/components/ui/GlowButton';
import { StepDots } from '@/components/ui/StepDots';
import { Colors } from '@/constants/colors';

const { width: W, height: H } = Dimensions.get('window');

export default function WelcomeScreen() {
  // Animation shared values
  const logoScale = useSharedValue(0.6);
  const logoOpacity = useSharedValue(0);
  const titleY = useSharedValue(30);
  const titleOpacity = useSharedValue(0);
  const taglineY = useSharedValue(20);
  const taglineOpacity = useSharedValue(0);
  const ctaY = useSharedValue(20);
  const ctaOpacity = useSharedValue(0);
  const orbitRotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    // Entrance sequence
    logoScale.value = withDelay(100, withSpring(1, { damping: 12, stiffness: 100 }));
    logoOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));
    titleY.value = withDelay(400, withSpring(0, { damping: 14, stiffness: 120 }));
    titleOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    taglineY.value = withDelay(600, withSpring(0, { damping: 14, stiffness: 120 }));
    taglineOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
    ctaY.value = withDelay(900, withSpring(0, { damping: 14, stiffness: 120 }));
    ctaOpacity.value = withDelay(900, withTiming(1, { duration: 500 }));

    // Continuous orbit rotation
    orbitRotation.value = withRepeat(
      withTiming(360, { duration: 12000, easing: Easing.linear }),
      -1,
      false,
    );

    // Gentle pulse on logo
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1800, easing: Easing.inOut(Easing.sine) }),
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sine) }),
      ),
      -1,
      true,
    );
  }, []);

  const handleGetStarted = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Location Required',
        'run-around needs your location to plot routes starting from where you are. Please enable location in Settings.',
        [{ text: 'OK' }],
      );
      return;
    }
    router.push('/onboarding/preferences');
  }, []);

  // Animated styles
  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value * pulseScale.value }],
    opacity: logoOpacity.value,
  }));

  const orbitStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${orbitRotation.value}deg` }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleY.value }],
    opacity: titleOpacity.value,
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: taglineY.value }],
    opacity: taglineOpacity.value,
  }));

  const ctaStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: ctaY.value }],
    opacity: ctaOpacity.value,
  }));

  return (
    <View style={styles.root}>
      {/* Deep background gradient */}
      <LinearGradient
        colors={['#0A0A0F', '#0D0B18', '#0A0A0F']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient glow blobs */}
      <View style={[styles.glowBlob, styles.glowBlob1]} />
      <View style={[styles.glowBlob, styles.glowBlob2]} />

      <SafeAreaView style={styles.safe}>
        {/* Top area: brand mark */}
        <View style={styles.heroArea}>
          {/* Orbit ring */}
          <Animated.View style={[styles.orbitRing, orbitStyle]}>
            <View style={styles.orbitDot1} />
            <View style={styles.orbitDot2} />
          </Animated.View>

          {/* Logo mark */}
          <Animated.View style={[styles.logoContainer, logoStyle]}>
            <LinearGradient
              colors={['#8B5FFF', '#6C3EFF', '#5028E0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoGradient}
            >
              <RunnerIcon />
            </LinearGradient>
            {/* Logo glow */}
            <View style={styles.logoGlow} />
          </Animated.View>
        </View>

        {/* Text content */}
        <View style={styles.textArea}>
          <Animated.View style={titleStyle}>
            <Text style={styles.appName}>run-around</Text>
          </Animated.View>

          <Animated.View style={taglineStyle}>
            <Text style={styles.tagline}>
              Routes that start and end{'\n'}exactly where you are.
            </Text>
          </Animated.View>

          {/* Divider */}
          <Animated.View style={[styles.divider, taglineStyle]} />

          {/* Feature pills */}
          <Animated.View style={[styles.pillRow, taglineStyle]}>
            <FeaturePill emoji="⚡" label="Instant routes" />
            <FeaturePill emoji="🔄" label="Round-trip" />
            <FeaturePill emoji="📍" label="GPS start" />
          </Animated.View>
        </View>

        {/* CTA area */}
        <Animated.View style={[styles.ctaArea, ctaStyle]}>
          <GlowButton label="Allow Location & Begin" onPress={handleGetStarted} />
          <Text style={styles.permNote}>
            Used only to generate your run route
          </Text>
        </Animated.View>

        {/* Step dots */}
        <View style={styles.dotsArea}>
          <StepDots total={2} current={0} />
        </View>
      </SafeAreaView>
    </View>
  );
}

function FeaturePill({ emoji, label }: { emoji: string; label: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillEmoji}>{emoji}</Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

// Simple SVG-style running figure drawn with Views
function RunnerIcon() {
  return (
    <View style={styles.runner}>
      {/* Head */}
      <View style={styles.runnerHead} />
      {/* Body line */}
      <View style={styles.runnerBody} />
      {/* Arms */}
      <View style={[styles.runnerLimb, styles.runnerArmL]} />
      <View style={[styles.runnerLimb, styles.runnerArmR]} />
      {/* Legs */}
      <View style={[styles.runnerLimb, styles.runnerLegL]} />
      <View style={[styles.runnerLimb, styles.runnerLegR]} />
    </View>
  );
}

const LOGO_SIZE = 100;
const ORBIT_SIZE = 180;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg.DEFAULT,
  },
  safe: {
    flex: 1,
    paddingHorizontal: 28,
  },
  glowBlob: {
    position: 'absolute',
    borderRadius: 999,
  },
  glowBlob1: {
    width: 320,
    height: 320,
    top: -60,
    left: -80,
    backgroundColor: 'rgba(108, 62, 255, 0.10)',
    // iOS shadow
    shadowColor: Colors.accent.DEFAULT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 80,
  },
  glowBlob2: {
    width: 240,
    height: 240,
    bottom: 80,
    right: -60,
    backgroundColor: 'rgba(157, 111, 255, 0.06)',
  },
  heroArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitRing: {
    position: 'absolute',
    width: ORBIT_SIZE,
    height: ORBIT_SIZE,
    borderRadius: ORBIT_SIZE / 2,
    borderWidth: 1,
    borderColor: 'rgba(108, 62, 255, 0.2)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  orbitDot1: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent.light,
    position: 'absolute',
    top: -4,
    shadowColor: Colors.accent.DEFAULT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  orbitDot2: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.accent.light,
    position: 'absolute',
    bottom: -3,
    opacity: 0.5,
  },
  logoContainer: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
  },
  logoGradient: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlow: {
    position: 'absolute',
    width: LOGO_SIZE + 40,
    height: LOGO_SIZE + 40,
    borderRadius: (LOGO_SIZE + 40) / 2,
    top: -20,
    left: -20,
    backgroundColor: 'transparent',
    shadowColor: Colors.accent.DEFAULT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    // Android glow via elevation + background trick
    elevation: 0,
  },
  runner: {
    width: 44,
    height: 44,
    position: 'relative',
  },
  runnerHead: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    top: 0,
    left: 22,
  },
  runnerBody: {
    position: 'absolute',
    width: 3,
    height: 14,
    backgroundColor: '#FFFFFF',
    top: 12,
    left: 25,
    borderRadius: 2,
    transform: [{ rotate: '-5deg' }],
  },
  runnerLimb: {
    position: 'absolute',
    width: 3,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 2,
  },
  runnerArmL: {
    top: 14,
    left: 15,
    transform: [{ rotate: '40deg' }],
  },
  runnerArmR: {
    top: 14,
    left: 30,
    transform: [{ rotate: '-30deg' }],
  },
  runnerLegL: {
    top: 26,
    left: 16,
    transform: [{ rotate: '-20deg' }],
  },
  runnerLegR: {
    top: 26,
    left: 30,
    transform: [{ rotate: '30deg' }],
  },
  textArea: {
    paddingBottom: 32,
    gap: 16,
  },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    color: Colors.text.DEFAULT,
    letterSpacing: -1.5,
    lineHeight: 46,
  },
  tagline: {
    fontSize: 17,
    fontWeight: '400',
    color: Colors.text.secondary,
    lineHeight: 26,
    letterSpacing: 0.1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.DEFAULT,
    marginVertical: 4,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.bg.elevated,
    borderWidth: 1,
    borderColor: Colors.border.DEFAULT,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  pillEmoji: {
    fontSize: 13,
  },
  pillLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text.secondary,
    letterSpacing: 0.2,
  },
  ctaArea: {
    gap: 16,
    paddingBottom: 8,
  },
  permNote: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.text.muted,
    letterSpacing: 0.2,
  },
  dotsArea: {
    alignItems: 'center',
    paddingBottom: 16,
    paddingTop: 12,
  },
});
