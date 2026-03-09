import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { PrayerTime } from './usePrayerTimes';

const SAVED_MOSQUE_KEY = 'selected_mosque';
const SAVED_TIMES_PREFIX = 'mosque_times_';
const SAVED_DIFFS_PREFIX = 'mosque_diffs_';
const LIVE_CACHE_PREFIX = 'mosque_live_';

type TimesSource = 'manual' | 'mawaqit' | 'website' | 'api' | 'none';

interface SavedMosqueData {
  mosqueName: string | null;
  prayers: PrayerTime[] | null;
  loading: boolean;
  source: TimesSource;
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

function timesMapToPrayers(times: Record<string, string>, is12h: boolean): PrayerTime[] {
  return [
    makePrayerTime('fajr', times.fajr || '', is12h),
    makePrayerTime('sunrise', times.sunrise || '', is12h),
    makePrayerTime('dhuhr', times.dhuhr || '', is12h),
    makePrayerTime('asr', times.asr || '', is12h),
    makePrayerTime('maghrib', times.maghrib || '', is12h),
    makePrayerTime('isha', times.isha || '', is12h),
  ];
}

/**
 * Loads saved mosque. Priority:
 * 1. Manual overrides (user entered iqamah times)
 * 2. Live sync from mosque website (Mawaqit/AI scrape) — cached daily
 * 3. Aladhan API using mosque coordinates
 * 4. null (falls back to location-based)
 */
export function useSavedMosqueTimes(): SavedMosqueData {
  const [data, setData] = useState<Omit<SavedMosqueData, 'unlinkMosque'>>({
    mosqueName: null, prayers: null, loading: true, source: 'none'
  });

  useEffect(() => {
    const is12h = detectIs12Hour();

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

      // 1. Check for manually saved times first
      const timesKey = SAVED_TIMES_PREFIX + mosque.osm_id;
      const timesStr = localStorage.getItem(timesKey);
      if (timesStr) {
        try {
          const times = JSON.parse(timesStr);
          const hasAny = times.fajr || times.dhuhr || times.asr || times.maghrib || times.isha;
          if (hasAny) {
            setData({
              mosqueName: mosque.name,
              prayers: timesMapToPrayers(times, is12h),
              loading: false,
              source: 'manual',
            });
            return;
          }
        } catch { /* fall through */ }
      }

      // 2. Try live sync from mosque website
      const today = new Date();
      const dateKey = `${today.getDate()}${today.getMonth() + 1}${today.getFullYear()}`;
      const liveCacheKey = LIVE_CACHE_PREFIX + mosque.osm_id + '_' + dateKey;
      const liveCache = localStorage.getItem(liveCacheKey);

      if (liveCache) {
        try {
          const cached = JSON.parse(liveCache);
          if (cached.times) {
            setData({
              mosqueName: mosque.name,
              prayers: timesMapToPrayers(cached.times, is12h),
              loading: false,
              source: cached.source || 'website',
            });
            return;
          }
        } catch { /* fall through */ }
      }

      // Try fetching live times
      try {
        const { data: liveData, error } = await supabase.functions.invoke('fetch-mosque-times', {
          body: {
            mosqueName: mosque.name,
            mosqueCity: mosque.address?.split(',').pop()?.trim() || '',
            websiteUrl: mosque.websiteUrl || null,
            mawaqitSlug: mosque.mawaqitSlug || null,
            latitude: mosque.latitude || null,
            longitude: mosque.longitude || null,
          },
        });

        if (!error && liveData?.success && liveData?.times) {
          // Cache for the day
          localStorage.setItem(liveCacheKey, JSON.stringify({
            times: liveData.times,
            source: liveData.source,
          }));

          setData({
            mosqueName: mosque.name,
            prayers: timesMapToPrayers(liveData.times, is12h),
            loading: false,
            source: liveData.source as TimesSource,
          });
          return;
        }
      } catch { /* fall through to Aladhan */ }

      // 3. Auto-fetch from Aladhan API using mosque coordinates
      if (mosque.latitude && mosque.longitude) {
        try {
          const dd = String(today.getDate()).padStart(2, '0');
          const mm = String(today.getMonth() + 1).padStart(2, '0');
          const yyyy = today.getFullYear();

          const apiCacheKey = `mosque_api_${mosque.osm_id}_${dd}${mm}${yyyy}`;
          const cached = localStorage.getItem(apiCacheKey);
          
          let timings: any;
          if (cached) {
            timings = JSON.parse(cached);
          } else {
            const res = await fetch(
              `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${mosque.latitude}&longitude=${mosque.longitude}&method=3`
            );
            const json = await res.json();
            timings = json.data.timings;
            localStorage.setItem(apiCacheKey, JSON.stringify(timings));
          }

          const clean = (s: string) => s.replace(/\s*\(.*\)$/, '').trim();
          const times = {
            fajr: clean(timings.Fajr),
            sunrise: clean(timings.Sunrise),
            dhuhr: clean(timings.Dhuhr),
            asr: clean(timings.Asr),
            maghrib: clean(timings.Maghrib),
            isha: clean(timings.Isha),
          };

          setData({
            mosqueName: mosque.name,
            prayers: timesMapToPrayers(times, is12h),
            loading: false,
            source: 'api',
          });
          return;
        } catch { /* fall through */ }
      }

      setData({ mosqueName: mosque.name, prayers: null, loading: false, source: 'none' });
    };

    load();
  }, []);

  const unlinkMosque = () => {
    const saved = localStorage.getItem('selected_mosque');
    if (saved) {
      try {
        const mosque = JSON.parse(saved);
        if (mosque.osm_id) {
          localStorage.removeItem(SAVED_TIMES_PREFIX + mosque.osm_id);
          // Clear live caches
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key?.startsWith(LIVE_CACHE_PREFIX + mosque.osm_id)) {
              localStorage.removeItem(key);
            }
          }
        }
      } catch { /* ignore */ }
    }
    localStorage.removeItem('selected_mosque');
    setData({ mosqueName: null, prayers: null, loading: false, source: 'none' });
  };

  return { ...data, unlinkMosque };
}
