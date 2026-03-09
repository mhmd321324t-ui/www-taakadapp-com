import { useEffect } from 'react';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { supabase } from '@/integrations/supabase/client';

/**
 * Prefetches data for all major sections on app load
 * so navigation feels instant.
 */
export function usePrefetch() {
  const location = useGeoLocation();

  useEffect(() => {
    // Prefetch mosque list as soon as we have location
    if (location.latitude && location.longitude) {
      prefetchMosques(location.latitude, location.longitude);
    }
  }, [location.latitude, location.longitude]);

  useEffect(() => {
    // Prefetch static/semi-static data immediately
    prefetchQuranIndex();
    prefetchLazyPages();
  }, []);
}

async function prefetchMosques(lat: number, lon: number) {
  const cacheKey = `prefetch_mosques_${lat.toFixed(2)}_${lon.toFixed(2)}`;
  if (sessionStorage.getItem(cacheKey)) return;

  try {
    const { data } = await supabase.functions.invoke('search-mosques', {
      body: { lat, lon, radius: 10000 },
    });
    if (data?.mosques) {
      sessionStorage.setItem(cacheKey, JSON.stringify(data.mosques));
      sessionStorage.setItem('prefetched_mosques', JSON.stringify(data.mosques));
    }
  } catch { /* silent */ }
}

async function prefetchQuranIndex() {
  if (sessionStorage.getItem('prefetch_quran_index')) return;
  try {
    const res = await fetch('https://api.alquran.cloud/v1/surah');
    if (res.ok) {
      const json = await res.json();
      sessionStorage.setItem('prefetch_quran_index', JSON.stringify(json.data));
    }
  } catch { /* silent */ }
}

function prefetchLazyPages() {
  // Eagerly load key page chunks after initial render
  const timer = setTimeout(() => {
    import('../pages/MosquePrayerTimes');
    import('../pages/PrayerTimes');
    import('../pages/Qibla');
    import('../pages/Quran');
    import('../pages/Tasbeeh');
    import('../pages/Duas');
    import('../pages/PrayerTracker');
    import('../pages/Stories');
    import('../pages/ZakatCalculator');
    import('../pages/DailyDuas');
    import('../pages/More');
  }, 1500); // After 1.5s to not block initial paint

  return () => clearTimeout(timer);
}

/**
 * Get prefetched mosques from session storage
 */
export function getPrefetchedMosques(): any[] | null {
  try {
    const cached = sessionStorage.getItem('prefetched_mosques');
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

/**
 * Get prefetched Quran index from session storage
 */
export function getPrefetchedQuranIndex(): any[] | null {
  try {
    const cached = sessionStorage.getItem('prefetch_quran_index');
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}
