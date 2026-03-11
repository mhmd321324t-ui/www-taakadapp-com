import { useEffect } from 'react';
import { useGeoLocation } from '@/hooks/useGeoLocation';

// In-memory cache for instant access (no parsing needed)
let mosquesCache: any[] | null = null;
let mosquesFetchPromise: Promise<any[]> | null = null;
let quranIndexCache: any[] | null = null;
let pagesPreloaded = false;

const BACKEND_URL = import.meta.env.REACT_APP_BACKEND_URL || '';

/**
 * Prefetches data for all major sections on app load
 */
export function usePrefetch() {
  const location = useGeoLocation();

  useEffect(() => {
    if (location.latitude && location.longitude) {
      prefetchMosques(location.latitude, location.longitude);
    }
  }, [location.latitude, location.longitude]);

  useEffect(() => {
    prefetchQuranIndex();
    if (!pagesPreloaded) {
      pagesPreloaded = true;
      setTimeout(() => {
        import('../pages/PrayerTimes');
        import('../pages/Quran');
        import('../pages/Tasbeeh');
        import('../pages/Duas');
        import('../pages/More');
      }, 5000);
    }
  }, []);
}

function prefetchMosques(lat: number, lon: number): Promise<any[]> {
  // If already cached, return immediately
  if (mosquesCache) return Promise.resolve(mosquesCache);
  
  // If already fetching, return existing promise
  if (mosquesFetchPromise) return mosquesFetchPromise;

  mosquesFetchPromise = (async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/mosques/search?lat=${lat}&lon=${lon}&radius=10000`);
      if (res.ok) {
        const data = await res.json();
        if (data?.mosques) {
          mosquesCache = data.mosques;
          return data.mosques;
        }
      }
    } catch { /* silent */ }
    return [];
  })();

  return mosquesFetchPromise;
}

async function prefetchQuranIndex() {
  if (quranIndexCache) return;
  try {
    const res = await fetch('https://api.alquran.cloud/v1/surah');
    if (res.ok) {
      const json = await res.json();
      quranIndexCache = json.data;
    }
  } catch { /* silent */ }
}

/**
 * Get prefetched mosques - returns cached data or waits for in-flight request
 */
export function getPrefetchedMosques(): any[] | null {
  return mosquesCache;
}

/**
 * Get or wait for prefetched mosques
 */
export async function waitForPrefetchedMosques(lat: number, lon: number): Promise<any[]> {
  if (mosquesCache) return mosquesCache;
  if (mosquesFetchPromise) return mosquesFetchPromise;
  return prefetchMosques(lat, lon);
}

/**
 * Clear mosque cache (e.g. on refresh)
 */
export function clearMosquesCache() {
  mosquesCache = null;
  mosquesFetchPromise = null;
}

export function getPrefetchedQuranIndex(): any[] | null {
  return quranIndexCache;
}
