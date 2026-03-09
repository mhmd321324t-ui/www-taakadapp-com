import { useState, useEffect } from 'react';
import type { PrayerTime } from './usePrayerTimes';

const SAVED_MOSQUE_KEY = 'selected_mosque';
const SAVED_TIMES_PREFIX = 'mosque_times_';

interface SavedMosqueData {
  mosqueName: string | null;
  prayers: PrayerTime[] | null;
  loading: boolean;
  unlinkMosque: () => void;
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

function makePrayerTime(key: string, time24: string, is12h: boolean): PrayerTime {
  const fmt = (t: string) => (!t ? '' : is12h ? to12Hour(t) : t);
  return { name: key, time24, time: fmt(time24), key };
}

/**
 * Loads saved mosque. If mosque has manually saved times, uses those.
 * Otherwise auto-fetches from Aladhan API using mosque coordinates.
 * Falls back to null (so the main page uses location-based times).
 */
export function useSavedMosqueTimes(): SavedMosqueData {
  const [data, setData] = useState<Omit<SavedMosqueData, 'unlinkMosque'>>({ mosqueName: null, prayers: null, loading: true });

  useEffect(() => {
    const is12h = detectIs12Hour();

    const load = async () => {
      const saved = localStorage.getItem(SAVED_MOSQUE_KEY);
      if (!saved) {
        setData({ mosqueName: null, prayers: null, loading: false });
        return;
      }

      let mosque: any;
      try { mosque = JSON.parse(saved); } catch {
        setData({ mosqueName: null, prayers: null, loading: false });
        return;
      }

      // 1. Check for manually saved times first
      const timesKey = SAVED_TIMES_PREFIX + mosque.osm_id;
      const timesStr = localStorage.getItem(timesKey);
      if (timesStr) {
        try {
          const times = JSON.parse(timesStr);
          const hasAny = times.fajr || times.dhuhr || times.asr || times.maghrib || times.isha;
          if (hasAny) {
            const prayers: PrayerTime[] = [
              makePrayerTime('fajr', times.fajr || '', is12h),
              makePrayerTime('sunrise', times.sunrise || '', is12h),
              makePrayerTime('dhuhr', times.dhuhr || '', is12h),
              makePrayerTime('asr', times.asr || '', is12h),
              makePrayerTime('maghrib', times.maghrib || '', is12h),
              makePrayerTime('isha', times.isha || '', is12h),
            ];
            setData({ mosqueName: mosque.name, prayers, loading: false });
            return;
          }
        } catch { /* fall through */ }
      }

      // 2. Auto-fetch from Aladhan API using mosque coordinates
      if (mosque.latitude && mosque.longitude) {
        try {
          const today = new Date();
          const dd = String(today.getDate()).padStart(2, '0');
          const mm = String(today.getMonth() + 1).padStart(2, '0');
          const yyyy = today.getFullYear();

          // Check cache (same day)
          const cacheKey = `mosque_api_${mosque.osm_id}_${dd}${mm}${yyyy}`;
          const cached = localStorage.getItem(cacheKey);
          
          let timings: any;
          if (cached) {
            timings = JSON.parse(cached);
          } else {
            const res = await fetch(
              `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${mosque.latitude}&longitude=${mosque.longitude}&method=3`
            );
            const json = await res.json();
            timings = json.data.timings;
            // Cache for the day
            localStorage.setItem(cacheKey, JSON.stringify(timings));
          }

          const clean = (s: string) => s.replace(/\s*\(.*\)$/, '').trim();
          const prayers: PrayerTime[] = [
            makePrayerTime('fajr', clean(timings.Fajr), is12h),
            makePrayerTime('sunrise', clean(timings.Sunrise), is12h),
            makePrayerTime('dhuhr', clean(timings.Dhuhr), is12h),
            makePrayerTime('asr', clean(timings.Asr), is12h),
            makePrayerTime('maghrib', clean(timings.Maghrib), is12h),
            makePrayerTime('isha', clean(timings.Isha), is12h),
          ];
          setData({ mosqueName: mosque.name, prayers, loading: false });
          return;
        } catch { /* fall through */ }
      }

      setData({ mosqueName: mosque.name, prayers: null, loading: false });
    };

    load();
  }, []);

  return data;
}
