import { useEffect } from 'react';
import { PrayerTime } from '@/hooks/usePrayerTimes';

/**
 * Automatically toggles dark/light mode based on Maghrib (sunset) and Fajr (sunrise).
 * Dark mode activates at Maghrib and deactivates at Fajr.
 */
export function useAutoTheme(prayers: PrayerTime[]) {
  useEffect(() => {
    // If user has explicitly set a preference, respect it
    const manualPref = localStorage.getItem('theme-mode');
    if (manualPref === 'light' || manualPref === 'dark') return;

    if (prayers.length === 0) return;

    const fajr = prayers.find(p => p.key === 'fajr');
    const maghrib = prayers.find(p => p.key === 'maghrib');
    if (!fajr || !maghrib) return;

    const toMinutes = (time24: string) => {
      const [h, m] = time24.split(':').map(Number);
      return h * 60 + m;
    };

    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
    const fajrMin = toMinutes(fajr.time24);
    const maghribMin = toMinutes(maghrib.time24);

    // Dark if before fajr or after maghrib
    const isDark = nowMinutes < fajrMin || nowMinutes >= maghribMin;

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Re-check every minute
    const interval = setInterval(() => {
      const now = new Date().getHours() * 60 + new Date().getMinutes();
      const shouldBeDark = now < fajrMin || now >= maghribMin;
      document.documentElement.classList.toggle('dark', shouldBeDark);
    }, 60_000);

    return () => clearInterval(interval);
  }, [prayers]);
}
