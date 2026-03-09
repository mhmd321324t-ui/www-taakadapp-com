import { useState, useEffect, useRef } from 'react';

export interface PrayerTime {
  name: string;
  time: string;       // formatted for display (12h or 24h)
  time24: string;     // always 24h for calculations
  key: string;
}

interface PrayerTimesData {
  prayers: PrayerTime[];
  hijriDate: string;
  hijriDay: string;
  hijriMonthAr: string;
  hijriMonthEn: string;
  hijriMonthNumber: number;
  hijriYear: string;
  hijriMonth: string;
  loading: boolean;
  error: string | null;
}

/**
 * Detect if user's device uses 12-hour format
 */
function detectIs12Hour(): boolean {
  try {
    const testDate = new Date(2024, 0, 1, 14, 0);
    const formatted = new Intl.DateTimeFormat(navigator.language, {
      hour: 'numeric',
    }).format(testDate);
    return !formatted.includes('14');
  } catch {
    return false;
  }
}

/**
 * Convert 24h time string to 12h format
 */
function to12Hour(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

function formatTime(time24: string, is12h: boolean): string {
  if (!is12h) return time24;
  return to12Hour(time24);
}

export function usePrayerTimes(latitude: number, longitude: number, method: number = 2, school: number = 0) {
  const [data, setData] = useState<PrayerTimesData>({
    prayers: [],
    hijriDate: '',
    hijriDay: '',
    hijriMonthAr: '',
    hijriMonthEn: '',
    hijriMonthNumber: 0,
    hijriYear: '',
    hijriMonth: '',
    loading: true,
    error: null,
  });

  const is12h = detectIs12Hour();
  const lastFetchKey = useRef('');
  const [todayStr, setTodayStr] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  // Midnight refresh: check every 30s if date changed
  useEffect(() => {
    const interval = setInterval(() => {
      const d = new Date();
      const now = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      setTodayStr(prev => {
        if (prev !== now) {
          lastFetchKey.current = ''; // force re-fetch
          return now;
        }
        return prev;
      });
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Don't fetch with placeholder coordinates
    if (latitude === 0 && longitude === 0) return;

    // Create a stable fetch key including today's date
    const fetchKey = `${latitude}-${longitude}-${method}-${todayStr}`;
    if (fetchKey === lastFetchKey.current) return;
    lastFetchKey.current = fetchKey;

    const fetchPrayers = async () => {
      try {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();

        const res = await fetch(
          `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${latitude}&longitude=${longitude}&method=${method}`,
          { cache: 'no-store' }
        );
        const json = await res.json();
        const timings = json.data.timings;
        const hijri = json.data.date.hijri;

        const cleanTime = (t: string) => t.replace(/\s*\(.*\)$/, '').trim();

        const prayers: PrayerTime[] = [
          { name: 'fajr', time24: cleanTime(timings.Fajr), time: formatTime(cleanTime(timings.Fajr), is12h), key: 'fajr' },
          { name: 'sunrise', time24: cleanTime(timings.Sunrise), time: formatTime(cleanTime(timings.Sunrise), is12h), key: 'sunrise' },
          { name: 'dhuhr', time24: cleanTime(timings.Dhuhr), time: formatTime(cleanTime(timings.Dhuhr), is12h), key: 'dhuhr' },
          { name: 'asr', time24: cleanTime(timings.Asr), time: formatTime(cleanTime(timings.Asr), is12h), key: 'asr' },
          { name: 'maghrib', time24: cleanTime(timings.Maghrib), time: formatTime(cleanTime(timings.Maghrib), is12h), key: 'maghrib' },
          { name: 'isha', time24: cleanTime(timings.Isha), time: formatTime(cleanTime(timings.Isha), is12h), key: 'isha' },
        ];

        setData({
          prayers,
          hijriDate: `${hijri.day} ${hijri.month.ar} ${hijri.year} هـ`,
          hijriDay: hijri.day,
          hijriMonthAr: hijri.month.ar,
          hijriMonthEn: hijri.month.en,
          hijriMonthNumber: hijri.month.number,
          hijriYear: hijri.year,
          hijriMonth: hijri.month.ar,
          loading: false,
          error: null,
        });
      } catch {
        setData(prev => ({ ...prev, loading: false, error: 'Failed to fetch prayer times' }));
      }
    };

    fetchPrayers();
  }, [latitude, longitude, method, is12h, todayStr]);

  return data;
}

export function getNextPrayer(prayers: PrayerTime[]): { prayer: PrayerTime | null; remaining: string } {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const prayer of prayers) {
    if (prayer.key === 'sunrise') continue;
    const [h, m] = prayer.time24.split(':').map(Number);
    const prayerMinutes = h * 60 + m;
    if (prayerMinutes > currentMinutes) {
      const diff = prayerMinutes - currentMinutes;
      const hours = Math.floor(diff / 60);
      const mins = diff % 60;
      return {
        prayer,
        remaining: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`,
      };
    }
  }

  if (prayers.length > 0) {
    const fajr = prayers[0];
    const [h, m] = fajr.time24.split(':').map(Number);
    const fajrMinutes = h * 60 + m;
    const diff = (24 * 60 - currentMinutes) + fajrMinutes;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return { prayer: fajr, remaining: `${hours}h ${mins}m` };
  }

  return { prayer: null, remaining: '' };
}
