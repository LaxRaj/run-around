import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { router } from 'expo-router';

import { RouteSheet } from '@/components/map/RouteSheet';
import { Colors } from '@/constants/colors';
import { useRunPreferences } from '@/hooks/useRunPreferences';
import {
  fetchRoundTripRoute,
  routeBounds,
  type ORSRoute,
} from '@/services/ors';
import { savePreferences } from '@/store/onboarding';

// Initialise Mapbox with public token. Token must start with pk.
// Copy .env.example → .env and fill in your token.
const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '';
MapboxGL.setAccessToken(MAPBOX_TOKEN);

// GeoJSON feature collection from an array of [lng, lat] coords.
function buildLineGeoJSON(coords: [number, number][]) {
  return {
    type: 'FeatureCollection' as const,
    features: [
      {
        type: 'Feature' as const,
        geometry: {
          type: 'LineString' as const,
          coordinates: coords,
        },
        properties: {},
      },
    ],
  };
}

// GeoJSON point feature.
function buildPointGeoJSON(lng: number, lat: number) {
  return {
    type: 'FeatureCollection' as const,
    features: [
      {
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [lng, lat] },
        properties: {},
      },
    ],
  };
}

export default function MapScreen() {
  const cameraRef = useRef<MapboxGL.Camera>(null);
  const { prefs, ready } = useRunPreferences();

  const [userCoord, setUserCoord] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<ORSRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 9999));

  // Entrance animation
  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(-16);
  // Route line opacity animated when route arrives
  const routeOpacity = useSharedValue(0);
  // Pulsing dot for user location marker
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    headerOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    headerY.value = withDelay(300, withSpring(0, { damping: 14, stiffness: 140 }));

    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.6, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  // Acquire initial location and fly camera there.
  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coord: [number, number] = [loc.coords.longitude, loc.coords.latitude];
      setUserCoord(coord);
      cameraRef.current?.setCamera({
        centerCoordinate: coord,
        zoomLevel: 14.5,
        animationDuration: 1200,
        animationMode: 'flyTo',
      });
    })();
  }, []);

  const generateRoute = useCallback(async (newSeed?: number) => {
    if (!userCoord) return;
    setLoading(true);
    setError(null);
    routeOpacity.value = withTiming(0, { duration: 200 });

    try {
      const s = newSeed ?? seed;
      const result = await fetchRoundTripRoute(
        userCoord[1], // latitude
        userCoord[0], // longitude
        prefs.miles,
        prefs.difficulty,
        s,
      );
      setRoute(result);

      // Animate route in
      routeOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));

      // Fly camera to fit the route with generous bottom padding for the sheet
      const [west, south, east, north] = routeBounds(result.coordinates);
      cameraRef.current?.fitBounds(
        [east, north],
        [west, south],
        [90, 40, 340, 40], // [top, right, bottom, left] — bottom = sheet height
        1400,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [userCoord, prefs, seed]);

  const handleRegenerate = useCallback(() => {
    const newSeed = Math.floor(Math.random() * 9999);
    setSeed(newSeed);
    generateRoute(newSeed);
  }, [generateRoute]);

  const handleEditPrefs = useCallback(() => {
    router.push('/onboarding/preferences');
  }, []);

  // Animated styles
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));

  const routeLineStyle = useAnimatedStyle(() => ({
    opacity: routeOpacity.value,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 2 - pulseScale.value, // fades as it expands
  }));

  const routeGeoJSON = route ? buildLineGeoJSON(route.coordinates) : null;
  const startGeoJSON = userCoord ? buildPointGeoJSON(userCoord[0], userCoord[1]) : null;

  if (!ready) return <View style={styles.root} />;

  return (
    <View style={styles.root}>
      {/* ─── Map ─────────────────────────────────────────────── */}
      {MAPBOX_TOKEN ? (
        <MapboxGL.MapView
          style={StyleSheet.absoluteFill}
          styleURL="mapbox://styles/mapbox/dark-v11"
          compassEnabled={false}
          scaleBarEnabled={false}
          logoEnabled={false}
          attributionEnabled={false}
          rotateEnabled={true}
          pitchEnabled={false}
        >
          <MapboxGL.Camera ref={cameraRef} />

          {/* Built-in user location puck */}
          <MapboxGL.UserLocation
            visible
            showsUserHeadingIndicator
            androidRenderMode="normal"
          />

          {/* Route glow layer */}
          {routeGeoJSON && (
            <MapboxGL.ShapeSource id="routeSource" shape={routeGeoJSON}>
              {/* Outer glow */}
              <MapboxGL.LineLayer
                id="routeGlow"
                style={{
                  lineColor: Colors.accent.light,
                  lineWidth: 16,
                  lineOpacity: routeOpacity as unknown as number,
                  lineCap: 'round',
                  lineJoin: 'round',
                  lineBlur: 8,
                }}
                layerIndex={10}
              />
              {/* Mid halo */}
              <MapboxGL.LineLayer
                id="routeHalo"
                style={{
                  lineColor: Colors.accent.DEFAULT,
                  lineWidth: 8,
                  lineOpacity: routeOpacity as unknown as number,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
                layerIndex={11}
              />
              {/* Core bright line */}
              <MapboxGL.LineLayer
                id="routeCore"
                style={{
                  lineColor: '#FFFFFF',
                  lineWidth: 2.5,
                  lineOpacity: routeOpacity as unknown as number,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
                layerIndex={12}
              />
            </MapboxGL.ShapeSource>
          )}

          {/* Start / finish marker */}
          {startGeoJSON && route && (
            <MapboxGL.ShapeSource id="startSource" shape={startGeoJSON}>
              <MapboxGL.CircleLayer
                id="startRing"
                style={{
                  circleRadius: 14,
                  circleColor: Colors.accent.DEFAULT,
                  circleOpacity: 0.3,
                  circleStrokeColor: Colors.accent.DEFAULT,
                  circleStrokeWidth: 2,
                }}
              />
              <MapboxGL.CircleLayer
                id="startDot"
                style={{
                  circleRadius: 6,
                  circleColor: '#FFFFFF',
                  circleStrokeColor: Colors.accent.DEFAULT,
                  circleStrokeWidth: 2.5,
                }}
              />
            </MapboxGL.ShapeSource>
          )}
        </MapboxGL.MapView>
      ) : (
        // Fallback dark canvas when no token configured
        <NoTokenPlaceholder />
      )}

      {/* ─── Top header overlay ───────────────────────────────── */}
      <Animated.View style={[styles.header, headerStyle]}>
        <LinearGradient
          colors={['rgba(10,10,15,0.85)', 'rgba(10,10,15,0)']}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View style={styles.headerContent}>
          <Text style={styles.appName}>run-around</Text>
          {route && !loading && (
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Route ready</Text>
            </View>
          )}
        </View>
      </Animated.View>

      {/* ─── Bottom sheet ─────────────────────────────────────── */}
      <RouteSheet
        miles={prefs.miles}
        difficulty={prefs.difficulty}
        route={route}
        loading={loading}
        error={error}
        onGenerate={generateRoute}
        onRegenerate={handleRegenerate}
        onEditPrefs={handleEditPrefs}
      />
    </View>
  );
}

function NoTokenPlaceholder() {
  return (
    <View style={styles.placeholder}>
      <LinearGradient
        colors={['#0A0A0F', '#0D0B18', '#131324']}
        style={StyleSheet.absoluteFill}
      />
      {/* Decorative grid */}
      <View style={styles.grid} pointerEvents="none">
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={i} style={[styles.gridLine, { top: `${i * 14}%` as any }]} />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={[styles.gridLineV, { left: `${i * 20}%` as any }]} />
        ))}
      </View>
      <View style={styles.tokenBadge}>
        <Text style={styles.tokenIcon}>🗺</Text>
        <Text style={styles.tokenTitle}>Map token needed</Text>
        <Text style={styles.tokenSub}>
          Copy .env.example → .env{'\n'}and add your Mapbox public token.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg.DEFAULT,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 56,
    paddingBottom: 48,
    paddingHorizontal: 24,
    zIndex: 10,
    pointerEvents: 'none',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text.DEFAULT,
    letterSpacing: -0.8,
    // Text shadow for legibility over map
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(34,211,165,0.12)',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(34,211,165,0.3)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.difficulty.easy,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.difficulty.easy,
    letterSpacing: 0.3,
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(108,62,255,0.07)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(108,62,255,0.07)',
  },
  tokenBadge: {
    backgroundColor: Colors.bg.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border.accent,
    padding: 28,
    alignItems: 'center',
    gap: 10,
    maxWidth: 280,
    shadowColor: Colors.accent.DEFAULT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
  },
  tokenIcon: { fontSize: 36 },
  tokenTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.DEFAULT,
    letterSpacing: -0.3,
  },
  tokenSub: {
    fontSize: 13,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Courier',
  },
});
