import { useState, useEffect } from 'react';
import { loadPreferences, type RunPreferences } from '@/store/onboarding';

const DEFAULT: RunPreferences = { miles: 5, difficulty: 'moderate' };

export function useRunPreferences() {
  const [prefs, setPrefs] = useState<RunPreferences>(DEFAULT);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadPreferences().then((p) => {
      if (p) setPrefs(p);
      setReady(true);
    });
  }, []);

  return { prefs, setPrefs, ready };
}
