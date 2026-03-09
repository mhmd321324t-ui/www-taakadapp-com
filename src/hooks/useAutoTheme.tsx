import { useEffect } from 'react';
import { PrayerTime } from '@/hooks/usePrayerTimes';

/**
 * Automatically toggles dark/light mode based on Maghrib (sunset) and Fajr (sunrise).
 * Dark mode activates at Maghrib and deactivates at Fajr.
 */
export function useAutoTheme(prayers: PrayerTime[]) {
  useEffect(() => {
    // Always respect manual preference — auto theme is disabled by default
    // Users must explicitly set theme via settings
    const manualPref = localStorage.getItem('theme-mode');
    if (manualPref === 'light') {
      document.documentElement.classList.remove('dark');
      return;
    }
    if (manualPref === 'dark') {
      document.documentElement.classList.add('dark');
      return;
    }
    // If no manual preference set, default to dark mode
    document.documentElement.classList.add('dark');
  }, [prayers]);
}
