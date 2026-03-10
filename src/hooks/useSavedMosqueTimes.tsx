import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { PrayerTime } from './usePrayerTimes';

const SAVED_MOSQUE_KEY = 'selected_mosque';
const SAVED_TIMES_PREFIX = 'mosque_times_';
const SAVED_DIFFS_PREFIX = 'mosque_diffs_';
const LIVE_CACHE_PREFIX = 'mosque_live_';

type TimesSource = 'manual' | 'mawaqit' | 'website' | 'api' | 'calculated' | 'none';

interface SavedMosqueData {
  mosqueName: string | null;
  prayers: PrayerTime[] | null;
  loading: boolean;
  source: TimesSource;
  unlinkMosque: () => void;
}

function detectIs12Hour(): boolean {
  try {
    const f = new Intl.DateTimeFormat(navigator.language, { hour: 'numeric' }).format(new Date(2024, 0, 1, 14, 0));
    return !f.includes('14');
  } catch { return false; }
}

function to12Hour(t24: string): string {
  const [h, m] = t24.split(':').map(Number);
  return `${h === 0 ? 12 : h > 12 ? h - 12 : h}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

function applyTimeDiff(time: string, diffMinutes: number): string {
  if (!time || diffMinutes === 0) return time;
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + diffMinutes;
  const newH = Math.floor(((total % 1440) + 1440) % 1440 / 60);
  const newM = ((total % 60) + 60) % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

function makePrayerTime(key: string, time24: string, is12h: boolean): PrayerTime {
  const fmt = (t: string) => (!t ? '' : is12h ? to12Hour(t) : t);
  return { name: key, time24, time: fmt(time24), key };
}

function applyDiffsToTimes(times: Record<string, string>, diffs: Record<string, number>): Record<string, string> {
  return {
    fajr: applyTimeDiff(times.fajr || '', diffs.fajr_diff || 0),
    sunrise: applyTimeDiff(times.sunrise || '', diffs.sunrise_diff || 0),
    dhuhr: applyTimeDiff(times.dhuhr || '', diffs.dhuhr_diff || 0),
    asr: applyTimeDiff(times.asr || '', diffs.asr_diff || 0),
    maghrib: applyTimeDiff(times.maghrib || '', diffs.maghrib_diff || 0),
    isha: applyTimeDiff(times.isha || '', diffs.isha_diff || 0),
  };
}

function timesMapToPrayers(times: Record<string, string>, is12h: boolean): PrayerTime[] {
  return ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'].map(k =>
    makePrayerTime(k, times[k] || '', is12h)
  );
}

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getCalcSettings(): { method: number; school: number; latitude?: number; longitude?: number } {
  try {
    const cached = localStorage.getItem('cached-location');
    if (cached) {
      const p = JSON.parse(cached);
      return { method: p.calculationMethod || 3, school: p.school ?? 0, latitude: p.latitude, longitude: p.longitude };
    }
  } catch {}
  return { method: 3, school: 0 };
}

export function useSavedMosqueTimes(): SavedMosqueData {
  const [data, setData] = useState<Omit<SavedMosqueData, 'unlinkMosque'>>({
    mosqueName: null, prayers: null, loading: true, source: 'none'
  });
  const [todayStr, setTodayStr] = useState(getTodayStr);
  const lastFetchRef = useRef<number>(0);

  // Refresh at midnight or hourly
  useEffect(() => {
    const interval = setInterval(() => {
      const now = getTodayStr();
      if (now !== todayStr.split('_')[0]) {
        setTodayStr(now);
        return;
      }
      if (Date.now() - lastFetchRef.current > 60 * 60 * 1000) {
        const saved = localStorage.getItem(SAVED_MOSQUE_KEY);
        if (saved) {
          try {
            const mosque = JSON.parse(saved);
            const dateKey = now.replace(/-/g, '');
            localStorage.removeItem(LIVE_CACHE_PREFIX + mosque.osm_id + '_' + dateKey);
          } catch {}
        }
        lastFetchRef.current = Date.now();
        setTodayStr(now + '_' + Date.now());
      }
    }, 30_000);
    return () => clearInterval(interval);
  }, [todayStr]);

  useEffect(() => {
    const is12h = detectIs12Hour();
    const calcSettings = getCalcSettings();

    const load = async () => {
      const saved = localStorage.getItem(SAVED_MOSQUE_KEY);
      if (!saved) {
        setData({ mosqueName: null, prayers: null, loading: false, source: 'none' });
        return;
      }

      let mosque: any;
      try { mosque = JSON.parse(saved); } catch {
        setData({ mosqueName: null, prayers: null, loading: false, source: 'none' });
        return;
      }

      const dateKey = todayStr.split('_')[0].replace(/-/g, '');

      // Clean stale caches
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (!key) continue;
        if (key.startsWith(LIVE_CACHE_PREFIX + mosque.osm_id) && !key.endsWith(dateKey)) {
          localStorage.removeItem(key);
        }
      }

      // 1. Manual overrides
      const timesStr = localStorage.getItem(SAVED_TIMES_PREFIX + mosque.osm_id);
      if (timesStr) {
        try {
          const parsed = JSON.parse(timesStr);
          const times = parsed._date ? parsed.times : parsed;
          if (times && (times.fajr || times.dhuhr || times.asr || times.maghrib || times.isha)) {
            setData({ mosqueName: mosque.name, prayers: timesMapToPrayers(times, is12h), loading: false, source: 'manual' });
            return;
          }
        } catch {}
      }

      // Load diffs
      const diffsStr = localStorage.getItem(SAVED_DIFFS_PREFIX + mosque.osm_id);
      let diffs: Record<string, number> = {};
      if (diffsStr) { try { diffs = JSON.parse(diffsStr); } catch {} }

      // 2. Today's live cache
      const liveCacheKey = LIVE_CACHE_PREFIX + mosque.osm_id + '_' + dateKey;
      const liveCache = localStorage.getItem(liveCacheKey);
      if (liveCache) {
        try {
          const cached = JSON.parse(liveCache);
          if (cached.times) {
            setData({
              mosqueName: mosque.name,
              prayers: timesMapToPrayers(applyDiffsToTimes(cached.times, diffs), is12h),
              loading: false,
              source: (cached.source || 'calculated') as TimesSource,
            });
            lastFetchRef.current = Date.now();
            return;
          }
        } catch {}
      }

      // 3. Edge function — use mosque's own coordinates (each mosque is at a different location)
      const lat = mosque.latitude || calcSettings.latitude;
      const lon = mosque.longitude || calcSettings.longitude;
      try {
        const { data: liveData, error } = await supabase.functions.invoke('fetch-mosque-times', {
          body: {
            mosqueName: mosque.name,
            latitude: lat,
            longitude: lon,
            method: calcSettings.method,
            school: calcSettings.school,
          },
        });

        if (!error && liveData?.success && liveData?.times) {
          localStorage.setItem(liveCacheKey, JSON.stringify({ times: liveData.times, source: liveData.source }));
          setData({
            mosqueName: mosque.name,
            prayers: timesMapToPrayers(applyDiffsToTimes(liveData.times, diffs), is12h),
            loading: false,
            source: (liveData.source as TimesSource) || 'calculated',
          });
          lastFetchRef.current = Date.now();
          return;
        }
      } catch {}

      setData({ mosqueName: mosque.name, prayers: null, loading: false, source: 'none' });
    };

    lastFetchRef.current = Date.now();
    load();
  }, [todayStr]);

  const unlinkMosque = () => {
    const saved = localStorage.getItem(SAVED_MOSQUE_KEY);
    if (saved) {
      try {
        const mosque = JSON.parse(saved);
        if (mosque.osm_id) {
          localStorage.removeItem(SAVED_TIMES_PREFIX + mosque.osm_id);
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key?.startsWith(LIVE_CACHE_PREFIX + mosque.osm_id)) localStorage.removeItem(key);
          }
        }
      } catch {}
    }
    localStorage.removeItem(SAVED_MOSQUE_KEY);
    setData({ mosqueName: null, prayers: null, loading: false, source: 'none' });
  };

  return { ...data, unlinkMosque };
}
