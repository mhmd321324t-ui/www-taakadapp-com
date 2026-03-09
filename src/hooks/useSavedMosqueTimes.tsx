import { useState, useEffect } from 'react';
import type { PrayerTime } from './usePrayerTimes';

const SAVED_MOSQUE_KEY = 'selected_mosque';
const SAVED_TIMES_PREFIX = 'mosque_times_';

interface SavedMosqueData {
  mosqueName: string | null;
  prayers: PrayerTime[] | null;
}

function detectIs12Hour(): boolean {
  try {
    const testDate = new Date(2024, 0, 1, 14, 0);
    const formatted = new Intl.DateTimeFormat(navigator.language, { hour: 'numeric' }).format(testDate);
    return !formatted.includes('14');
  } catch { return false; }
}

function to12Hour(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

/**
 * Loads saved mosque and its manually-entered prayer times from localStorage.
 * Returns null prayers if no mosque or no saved times.
 */
export function useSavedMosqueTimes(): SavedMosqueData {
  const [data, setData] = useState<SavedMosqueData>({ mosqueName: null, prayers: null });

  useEffect(() => {
    const saved = localStorage.getItem(SAVED_MOSQUE_KEY);
    if (!saved) return;

    try {
      const mosque = JSON.parse(saved);
      const timesKey = SAVED_TIMES_PREFIX + mosque.osm_id;
      const timesStr = localStorage.getItem(timesKey);
      if (!timesStr) {
        setData({ mosqueName: mosque.name, prayers: null });
        return;
      }

      const times = JSON.parse(timesStr);
      const is12h = detectIs12Hour();
      const fmt = (t: string) => {
        if (!t) return '';
        return is12h ? to12Hour(t) : t;
      };

      // Only use if at least one prayer time is set (excluding jumuah)
      const hasAny = times.fajr || times.dhuhr || times.asr || times.maghrib || times.isha;
      if (!hasAny) {
        setData({ mosqueName: mosque.name, prayers: null });
        return;
      }

      const prayers: PrayerTime[] = [
        { name: 'fajr', time24: times.fajr || '', time: fmt(times.fajr), key: 'fajr' },
        { name: 'sunrise', time24: times.sunrise || '', time: fmt(times.sunrise), key: 'sunrise' },
        { name: 'dhuhr', time24: times.dhuhr || '', time: fmt(times.dhuhr), key: 'dhuhr' },
        { name: 'asr', time24: times.asr || '', time: fmt(times.asr), key: 'asr' },
        { name: 'maghrib', time24: times.maghrib || '', time: fmt(times.maghrib), key: 'maghrib' },
        { name: 'isha', time24: times.isha || '', time: fmt(times.isha), key: 'isha' },
      ];

      setData({ mosqueName: mosque.name, prayers });
    } catch {
      setData({ mosqueName: null, prayers: null });
    }
  }, []);

  return data;
}
