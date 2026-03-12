import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { usePrayerTimes, getNextPrayer, type PrayerTime } from './usePrayerTimes';
import { useGeoLocation } from './useGeoLocation';
import { MosqueService, MOSQUE_CHANGE_EVENT, type MosqueData, type AthanSound } from '@/lib/MosqueService';
import { updateSunriseSunset } from '@/components/ThemeProvider';

type PrayerSource = 'auto' | 'mosque';

interface UnifiedPrayerData {
  prayers: PrayerTime[];
  nextPrayer: PrayerTime | null;
  remaining: string;
  hijriDate: string;
  hijriDay: string;
  hijriMonthNumber: number;
  hijriYear: string;
  loading: boolean;
  source: PrayerSource;
  sourceLabel: string;
  mosqueName: string | null;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  locationLoading: boolean;
  locationError: string | null;
  detectLocation: () => void;
  unlinkMosque: () => void;
  selectMosque: (mosque: MosqueData) => void;
  athanSound: AthanSound;
  setAthanSound: (sound: AthanSound) => void;
  madhab: number;
  setMadhab: (madhab: number) => void;
  calculationMethod: number;
  school: number;
}

const BACKEND_URL = import.meta.env.REACT_APP_BACKEND_URL || '';
const PrayerContext = createContext<UnifiedPrayerData | null>(null);

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

function makePrayerTime(key: string, time24: string, is12h: boolean): PrayerTime {
  return { name: key, time24, time: is12h ? to12Hour(time24) : time24, key };
}

export function UnifiedPrayerProvider({ children }: { children: ReactNode }) {
  const location = useGeoLocation();
  const [mosqueState, setMosqueState] = useState(() => MosqueService.getState());
  const [mosquePrayers, setMosquePrayers] = useState<PrayerTime[] | null>(null);
  const [mosqueLoading, setMosqueLoading] = useState(false);
  const fetchAbortRef = useRef<AbortController | null>(null);

  // Use madhab from MosqueService (overrides location default if set)
  const effectiveSchool = mosqueState.madhab || location.school;

  const apiData = usePrayerTimes(
    location.latitude,
    location.longitude,
    location.calculationMethod,
    effectiveSchool
  );

  // Push sunrise/sunset to ThemeProvider for auto-switch
  useEffect(() => {
    const sunrise = apiData.prayers.find(p => p.key === 'sunrise');
    const maghrib = apiData.prayers.find(p => p.key === 'maghrib');
    if (sunrise?.time24 && maghrib?.time24) {
      updateSunriseSunset(sunrise.time24, maghrib.time24);
    }
  }, [apiData.prayers]);

  // Listen for MosqueService changes (instant propagation)
  useEffect(() => {
    const unsubscribe = MosqueService.subscribe((event) => {
      setMosqueState(event);
    });

    // Also listen for cross-tab events
    const handler = (e: Event) => {
      setMosqueState((e as CustomEvent).detail);
    };
    window.addEventListener(MOSQUE_CHANGE_EVENT, handler);

    return () => {
      unsubscribe();
      window.removeEventListener(MOSQUE_CHANGE_EVENT, handler);
    };
  }, []);

  // Fetch mosque prayer times when mosque changes
  useEffect(() => {
    const mosque = mosqueState.mosque;
    if (!mosque) {
      setMosquePrayers(null);
      setMosqueLoading(false);
      return;
    }

    // Abort previous fetch
    fetchAbortRef.current?.abort();
    const controller = new AbortController();
    fetchAbortRef.current = controller;

    const fetchMosqueTimes = async () => {
      setMosqueLoading(true);
      const is12h = detectIs12Hour();

      // Check local cache first
      const today = new Date();
      const dateKey = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
      const cacheKey = `mosque_live_${mosque.osm_id}_${dateKey}`;
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        try {
          const data = JSON.parse(cached);
          if (data.times) {
            const prayers = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'].map(k =>
              makePrayerTime(k, data.times[k] || '', is12h)
            );
            setMosquePrayers(prayers);
            setMosqueLoading(false);
            return;
          }
        } catch {}
      }

      // Fetch from backend
      try {
        const res = await fetch(`${BACKEND_URL}/api/mosques/prayer-times`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mosqueName: mosque.name,
            latitude: mosque.latitude,
            longitude: mosque.longitude,
            method: mosque.method || location.calculationMethod,
            school: mosqueState.madhab || effectiveSchool,
            mosqueUuid: mosque.mawaqit_uuid,
          }),
          signal: controller.signal,
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.success && data?.times) {
            localStorage.setItem(cacheKey, JSON.stringify({ times: data.times, source: data.source }));
            const prayers = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'].map(k =>
              makePrayerTime(k, data.times[k] || '', is12h)
            );
            setMosquePrayers(prayers);
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Failed to fetch mosque times:', err);
        }
      }
      setMosqueLoading(false);
    };

    fetchMosqueTimes();
    return () => controller.abort();
  }, [mosqueState.mosque?.osm_id, mosqueState.madhab, location.calculationMethod, effectiveSchool]);

  // Update remaining time every 30s
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30_000);
    return () => clearInterval(interval);
  }, []);

  // Determine active source
  const hasMosque = !!mosqueState.mosque && !!mosquePrayers && mosquePrayers.length > 0;
  const source: PrayerSource = hasMosque ? 'mosque' : 'auto';
  const prayers = hasMosque ? mosquePrayers! : apiData.prayers;
  const { prayer: nextPrayer, remaining } = getNextPrayer(prayers);

  const sourceLabel = hasMosque
    ? mosqueState.mosque!.name
    : location.city || 'تلقائي';

  const selectMosque = useCallback((mosque: MosqueData) => {
    MosqueService.selectMosque(mosque);
  }, []);

  const unlinkMosque = useCallback(() => {
    MosqueService.unlinkMosque();
  }, []);

  const setAthanSound = useCallback((sound: AthanSound) => {
    MosqueService.setAthanSound(sound);
  }, []);

  const setMadhab = useCallback((madhab: number) => {
    MosqueService.setMadhab(madhab);
  }, []);

  const value: UnifiedPrayerData = {
    prayers,
    nextPrayer,
    remaining,
    hijriDate: apiData.hijriDate,
    hijriDay: apiData.hijriDay,
    hijriMonthNumber: apiData.hijriMonthNumber,
    hijriYear: apiData.hijriYear,
    loading: apiData.loading || mosqueLoading,
    source,
    sourceLabel,
    mosqueName: mosqueState.mosque?.name || null,
    city: location.city || '',
    country: location.country || '',
    latitude: location.latitude,
    longitude: location.longitude,
    locationLoading: location.loading,
    locationError: location.error,
    detectLocation: location.detectLocation,
    unlinkMosque,
    selectMosque,
    athanSound: mosqueState.athanSound,
    setAthanSound,
    madhab: mosqueState.madhab,
    setMadhab,
    calculationMethod: location.calculationMethod,
    school: effectiveSchool,
  };

  return (
    <PrayerContext.Provider value={value}>
      {children}
    </PrayerContext.Provider>
  );
}

export function useUnifiedPrayer(): UnifiedPrayerData {
  const ctx = useContext(PrayerContext);
  if (!ctx) {
    throw new Error('useUnifiedPrayer must be used inside UnifiedPrayerProvider');
  }
  return ctx;
}
