import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DifficultyLevel } from '@/constants/colors';

const ONBOARDING_KEY = '@run_around_onboarding_complete';
const PREFS_KEY = '@run_around_prefs';

export interface RunPreferences {
  miles: number;
  difficulty: DifficultyLevel;
}

export async function isOnboardingComplete(): Promise<boolean> {
  const val = await AsyncStorage.getItem(ONBOARDING_KEY);
  return val === 'true';
}

export async function markOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
}

export async function savePreferences(prefs: RunPreferences): Promise<void> {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export async function loadPreferences(): Promise<RunPreferences | null> {
  const val = await AsyncStorage.getItem(PREFS_KEY);
  return val ? (JSON.parse(val) as RunPreferences) : null;
}
