import { useState, useEffect, useRef } from 'react';

interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  countryCode: string;
  calculationMethod: number;
  loading: boolean;
  error: string | null;
}

function roundCoord(val: number): number {
  return Math.round(val * 1000) / 1000;
}

function getCalculationMethodByCountry(countryCode: string): number {
  const code = countryCode?.toUpperCase();

  // Gulf / Arabian Peninsula (Umm Al-Qura)
  if (['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'YE'].includes(code)) return 4;

  // North Africa (Egyptian General Authority)
  if (['EG', 'LY', 'DZ', 'MA', 'TN'].includes(code)) return 5;

  // South Asia (Karachi)
  if (['PK', 'IN', 'BD', 'AF'].includes(code)) return 1;

  // Europe and most of world (Muslim World League)
  if (['DE', 'FR', 'GB', 'NL', 'BE', 'SE', 'NO', 'DK', 'ES', 'IT', 'CH', 'AT'].includes(code)) return 3;

  // North America (ISNA)
  if (['US', 'CA'].includes(code)) return 2;

  // Default fallback
  return 3;
}

export function useGeoLocation() {
  const [location, setLocation] = useState<LocationData>(() => {
    try {
      const cached = localStorage.getItem('cached-location');
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          ...parsed,
          countryCode: parsed.countryCode || '',
          calculationMethod: parsed.calculationMethod || getCalculationMethodByCountry(parsed.countryCode || ''),
          loading: true,
          error: null,
        };
      }
    } catch {}

    return {
      latitude: 0,
      longitude: 0,
      city: '',
      country: '',
      countryCode: '',
      calculationMethod: 3,
      loading: true,
      error: null,
    };
  });

  const hasDetected = useRef(false);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocation(prev => ({ ...prev, loading: false, error: 'Geolocation not supported' }));
      return;
    }

    setLocation(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = roundCoord(position.coords.latitude);
        const longitude = roundCoord(position.coords.longitude);

        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ar`
          );
          const data = await res.json();
          const countryCode = data.countryCode || '';
          const calculationMethod = getCalculationMethodByCountry(countryCode);

          const loc: LocationData = {
            latitude,
            longitude,
            city: data.city || data.locality || '',
            country: data.countryName || '',
            countryCode,
            calculationMethod,
            loading: false,
            error: null,
          };

          setLocation(loc);

          try {
            localStorage.setItem('cached-location', JSON.stringify({
              latitude: loc.latitude,
              longitude: loc.longitude,
              city: loc.city,
              country: loc.country,
              countryCode: loc.countryCode,
              calculationMethod: loc.calculationMethod,
            }));
          } catch {}
        } catch {
          setLocation(prev => ({
            ...prev,
            latitude,
            longitude,
            loading: false,
            error: null,
          }));
        }
      },
      () => {
        // If user denies location, use cached coordinates if available, otherwise show error
        const hasCached = location.latitude !== 0 || location.longitude !== 0;
        setLocation(prev => ({
          ...prev,
          loading: false,
          error: hasCached ? null : 'يرجى تفعيل الموقع الجغرافي لعرض أوقات الصلاة',
        }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  useEffect(() => {
    if (!hasDetected.current) {
      hasDetected.current = true;
      detectLocation();
    }
  }, []);

  return { ...location, detectLocation };
}
