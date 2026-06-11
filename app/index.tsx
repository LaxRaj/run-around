import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { isOnboardingComplete } from '@/store/onboarding';
import { Colors } from '@/constants/colors';

export default function Entry() {
  useEffect(() => {
    (async () => {
      const done = await isOnboardingComplete();
      if (done) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding/welcome');
      }
    })();
  }, []);

  return <View style={styles.splash} />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: Colors.bg.DEFAULT,
  },
});
