import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { GlowButton } from '@/components/ui/GlowButton';
import { StepDots } from '@/components/ui/StepDots';
import { DistanceSelector } from '@/components/ui/DistanceSelector';
import { DifficultySelector } from '@/components/ui/DifficultySelector';
import { Colors, type DifficultyLevel } from '@/constants/colors';
import { markOnboardingComplete, savePreferences } from '@/store/onboarding';

export default function PreferencesScreen() {
  const [miles, setMiles] = useState(5);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('moderate');
  const [loading, setLoading] = useState(false);

  // Entrance animations
  const headerY = useSharedValue(24);
  const headerOp = useSharedValue(0);
  const sec1Y = useSharedValue(24);
  const sec1Op = useSharedValue(0);
  const sec2Y = useSharedValue(24);
  const sec2Op = useSharedValue(0);
  const ctaY = useSharedValue(24);
  const ctaOp = useSharedValue(0);

  useEffect(() => {
    const spring = (sv: SharedValue<number>, target: number, delay: number) => {
      sv.value = withDelay(delay, withSpring(target, { damping: 14, stiffness: 120 }));
    };
    const fade = (sv: SharedValue<number>, delay: number) => {
      sv.value = withDelay(delay, withTiming(1, { duration: 450 }));
    };
    spring(headerY, 0, 80);   fade(headerOp, 80);
    spring(sec1Y, 0, 260);    fade(sec1Op, 260);
    spring(sec2Y, 0, 420);    fade(sec2Op, 420);
    spring(ctaY, 0, 580);     fade(ctaOp, 580);
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: headerY.value }],
    opacity: headerOp.value,
  }));
  const sec1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: sec1Y.value }],
    opacity: sec1Op.value,
  }));
  const sec2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: sec2Y.value }],
    opacity: sec2Op.value,
  }));
  const ctaStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: ctaY.value }],
    opacity: ctaOp.value,
  }));

  const handleFindRoute = useCallback(async () => {
    setLoading(true);
    await savePreferences({ miles, difficulty });
    await markOnboardingComplete();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  }, [miles, difficulty]);

  const isEditing = router.canGoBack();
  const distanceLabel = Number.isInteger(miles) ? `${miles}` : miles.toFixed(1);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#0A0A0F', '#0D0B18', '#0A0A0F']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient glow */}
      <View style={styles.glowBlob} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Header */}
        <Animated.View style={[styles.header, headerStyle]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Set your run</Text>
            <Text style={styles.headerSub}>Customize before we plot your loop</Text>
          </View>
          <StepDots total={2} current={1} />
        </Animated.View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Distance section */}
          <Animated.View style={[styles.section, sec1Style]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>01</Text>
              </View>
              <View>
                <Text style={styles.sectionTitle}>Distance</Text>
                <Text style={styles.sectionSub}>How far do you want to go?</Text>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <DistanceSelector value={miles} onChange={setMiles} />
            </View>
          </Animated.View>

          {/* Difficulty section */}
          <Animated.View style={[styles.section, sec2Style]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>02</Text>
              </View>
              <View>
                <Text style={styles.sectionTitle}>Difficulty</Text>
                <Text style={styles.sectionSub}>What terrain do you prefer?</Text>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <DifficultySelector value={difficulty} onChange={setDifficulty} />
            </View>
          </Animated.View>

          {/* Summary card */}
          <Animated.View style={[styles.summaryCard, sec2Style]}>
            <LinearGradient
              colors={['rgba(108,62,255,0.12)', 'rgba(108,62,255,0.04)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.summaryGradient}
            >
              <View style={styles.summaryRow}>
                <View style={styles.summaryStat}>
                  <Text style={styles.summaryValue}>{distanceLabel}</Text>
                  <Text style={styles.summaryLabel}>miles</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryStat}>
                  <Text style={[
                    styles.summaryValue,
                    { color: getDifficultyColor(difficulty) },
                  ]}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </Text>
                  <Text style={styles.summaryLabel}>difficulty</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryStat}>
                  <Text style={styles.summaryValue}>
                    {estimateTime(miles, difficulty)}
                  </Text>
                  <Text style={styles.summaryLabel}>est. min</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        </ScrollView>

        {/* CTA */}
        <Animated.View style={[styles.ctaArea, ctaStyle]}>
          <GlowButton
            label={loading ? 'Saving…' : isEditing ? 'Save & Return →' : 'Find My Route →'}
            onPress={handleFindRoute}
            disabled={loading}
          />
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

function getDifficultyColor(d: DifficultyLevel): string {
  const map: Record<DifficultyLevel, string> = {
    easy: Colors.difficulty.easy,
    moderate: Colors.difficulty.moderate,
    hard: Colors.difficulty.hard,
  };
  return map[d];
}

function estimateTime(miles: number, difficulty: DifficultyLevel): string {
  const paceMap: Record<DifficultyLevel, number> = {
    easy: 11,
    moderate: 9,
    hard: 8,
  };
  return Math.round(miles * paceMap[difficulty]).toString();
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg.DEFAULT,
  },
  safe: {
    flex: 1,
  },
  glowBlob: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    top: -40,
    right: -60,
    backgroundColor: 'rgba(108, 62, 255, 0.08)',
    shadowColor: Colors.accent.DEFAULT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 80,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.bg.elevated,
    borderWidth: 1,
    borderColor: Colors.border.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  backArrow: {
    color: Colors.text.DEFAULT,
    fontSize: 18,
    fontWeight: '300',
  },
  headerCenter: {
    flex: 1,
    gap: 3,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text.DEFAULT,
    letterSpacing: -0.8,
  },
  headerSub: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: '400',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 28,
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.accent.muted,
    borderWidth: 1,
    borderColor: Colors.accent.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionBadgeText: {
    color: Colors.accent.light,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.DEFAULT,
    letterSpacing: -0.3,
  },
  sectionSub: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '400',
  },
  sectionCard: {
    backgroundColor: Colors.bg.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border.DEFAULT,
  },
  summaryCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border.accent,
  },
  summaryGradient: {
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryStat: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text.DEFAULT,
    letterSpacing: -1,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border.DEFAULT,
  },
  ctaArea: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    paddingTop: 8,
  },
});
