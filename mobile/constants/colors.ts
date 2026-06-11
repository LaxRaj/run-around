export const Colors = {
  bg: {
    DEFAULT: '#0A0A0F',
    surface: '#111118',
    elevated: '#1A1A25',
  },
  accent: {
    DEFAULT: '#6C3EFF',
    light: '#9D6FFF',
    muted: '#3D2299',
    glow: 'rgba(108, 62, 255, 0.35)',
    glowStrong: 'rgba(108, 62, 255, 0.6)',
  },
  text: {
    DEFAULT: '#FFFFFF',
    secondary: '#8B8B9A',
    muted: '#4A4A5A',
  },
  difficulty: {
    easy: '#22D3A5',
    easyGlow: 'rgba(34, 211, 165, 0.3)',
    moderate: '#F59E0B',
    moderateGlow: 'rgba(245, 158, 11, 0.3)',
    hard: '#FF3B6E',
    hardGlow: 'rgba(255, 59, 110, 0.3)',
  },
  border: {
    DEFAULT: 'rgba(255,255,255,0.06)',
    accent: 'rgba(108, 62, 255, 0.4)',
  },
} as const;

export type DifficultyLevel = 'easy' | 'moderate' | 'hard';

export const DIFFICULTY_CONFIG = {
  easy: {
    label: 'Easy',
    sublabel: 'Flat terrain',
    color: Colors.difficulty.easy,
    glow: Colors.difficulty.easyGlow,
  },
  moderate: {
    label: 'Moderate',
    sublabel: 'Rolling hills',
    color: Colors.difficulty.moderate,
    glow: Colors.difficulty.moderateGlow,
  },
  hard: {
    label: 'Hard',
    sublabel: 'Steep climbs',
    color: Colors.difficulty.hard,
    glow: Colors.difficulty.hardGlow,
  },
} as const;

export const DISTANCE_PRESETS = [1, 2, 3, 5, 8, 10, 13.1, 15, 20] as const;
