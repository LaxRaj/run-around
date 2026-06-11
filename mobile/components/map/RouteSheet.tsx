import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, DIFFICULTY_CONFIG, type DifficultyLevel } from '@/constants/colors';
import { GlowButton } from '@/components/ui/GlowButton';
import {
  metersToMiles,
  secondsToMinutes,
  metersToFeet,
  type ORSRoute,
} from '@/services/ors';

interface RouteSheetProps {
  miles: number;
  difficulty: DifficultyLevel;
  route: ORSRoute | null;
  loading: boolean;
  error: string | null;
  onGenerate: () => void;
  onRegenerate: () => void;
  onEditPrefs: () => void;
}

export function RouteSheet({
  miles,
  difficulty,
  route,
  loading,
  error,
  onGenerate,
  onRegenerate,
  onEditPrefs,
}: RouteSheetProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(120);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withSpring(0, { damping: 18, stiffness: 160 });
    opacity.value = withTiming(1, { duration: 400 });
  }, []);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const diffConfig = DIFFICULTY_CONFIG[difficulty];
  const distDisplay = Number.isInteger(miles) ? `${miles}` : miles.toFixed(1);

  return (
    <Animated.View style={[styles.wrapper, sheetStyle, { paddingBottom: insets.bottom + 8 }]}>
      {/* Glass border top */}
      <View style={styles.handle} />

      {/* Settings row */}
      <Pressable style={styles.settingsRow} onPress={onEditPrefs} hitSlop={8}>
        <View style={styles.prefBadge}>
          <Text style={styles.prefBadgeText}>{distDisplay} mi</Text>
        </View>
        <View style={[styles.prefBadge, { borderColor: `${diffConfig.color}55` }]}>
          <View style={[styles.diffDot, { backgroundColor: diffConfig.color }]} />
          <Text style={[styles.prefBadgeText, { color: diffConfig.color }]}>
            {diffConfig.label}
          </Text>
        </View>
        <View style={styles.editChip}>
          <Text style={styles.editChipText}>edit ›</Text>
        </View>
      </Pressable>

      {/* Stats row — visible only when route is ready */}
      {route && !loading && (
        <StatsRow route={route} />
      )}

      {/* Error */}
      {error && !loading && (
        <View style={styles.errorRow}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* CTA */}
      <View style={styles.ctaRow}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={Colors.accent.DEFAULT} size="small" />
            <Text style={styles.loadingText}>Plotting your route…</Text>
          </View>
        ) : route ? (
          <View style={styles.dualCta}>
            <Pressable style={styles.regenBtn} onPress={onRegenerate} hitSlop={6}>
              <Text style={styles.regenText}>↺  Try different</Text>
            </Pressable>
            <View style={styles.startBtnWrap}>
              <GlowButton label="▶  Start Run" onPress={() => {}} />
            </View>
          </View>
        ) : (
          <GlowButton
            label="Generate Route →"
            onPress={onGenerate}
            disabled={loading}
          />
        )}
      </View>
    </Animated.View>
  );
}

function StatsRow({ route }: { route: ORSRoute }) {
  const statsOpacity = useSharedValue(0);
  const statsY = useSharedValue(10);

  useEffect(() => {
    statsOpacity.value = withTiming(1, { duration: 500 });
    statsY.value = withSpring(0, { damping: 14, stiffness: 140 });
  }, [route]);

  const style = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
    transform: [{ translateY: statsY.value }],
  }));

  return (
    <Animated.View style={[styles.statsRow, style]}>
      <StatItem
        value={metersToMiles(route.distanceMeters)}
        unit="mi"
        label="Distance"
      />
      <View style={styles.statsDivider} />
      <StatItem
        value={secondsToMinutes(route.durationSeconds)}
        unit="min"
        label="Est. time"
      />
      <View style={styles.statsDivider} />
      <StatItem
        value={`+${metersToFeet(route.ascentMeters)}`}
        unit="ft"
        label="Elevation"
      />
    </Animated.View>
  );
}

function StatItem({ value, unit, label }: { value: string; unit: string; label: string }) {
  return (
    <View style={styles.statItem}>
      <View style={styles.statValueRow}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statUnit}>{unit}</Text>
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.bg.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: Colors.border.DEFAULT,
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 16,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.text.muted,
    marginBottom: 4,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prefBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: Colors.border.DEFAULT,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: Colors.bg.elevated,
  },
  prefBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.DEFAULT,
    letterSpacing: 0.2,
  },
  diffDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  editChip: {
    marginLeft: 'auto',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  editChipText: {
    fontSize: 12,
    color: Colors.accent.light,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.elevated,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border.accent,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  statsDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border.DEFAULT,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text.DEFAULT,
    letterSpacing: -0.5,
  },
  statUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.accent.light,
    paddingBottom: 2,
    letterSpacing: 0.3,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  errorRow: {
    backgroundColor: 'rgba(255, 59, 110, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 110, 0.25)',
    padding: 12,
  },
  errorText: {
    color: Colors.difficulty.hard,
    fontSize: 12,
    lineHeight: 18,
  },
  ctaRow: {
    paddingBottom: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  loadingText: {
    color: Colors.text.secondary,
    fontSize: 15,
    fontWeight: '500',
  },
  dualCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  regenBtn: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.border.DEFAULT,
    backgroundColor: Colors.bg.elevated,
  },
  regenText: {
    color: Colors.text.secondary,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  startBtnWrap: {
    flex: 1,
  },
});
