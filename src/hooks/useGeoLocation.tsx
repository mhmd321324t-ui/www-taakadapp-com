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

/** Keep 6 decimal places for ~0.11 m precision */
function roundCoord(val: number): number {
  return Math.round(val * 1_000_000) / 1_000_000;
}

/**
 * Aladhan calculation-method mapping identical to IslamicFinder / Athan app.
 * 1 = Karachi, 2 = ISNA, 3 = MWL, 4 = Umm Al-Qura, 5 = Egyptian
 */
function getCalculationMethodByCountry(countryCode: string): number {
  const code = countryCode?.toUpperCase();

  // Gulf / Arabian Peninsula → Umm Al-Qura (4)
  if (['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'YE'].includes(code)) return 4;

  // North Africa → Egyptian General Authority (5)
  if (['EG', 'LY', 'SD', 'SO', 'DJ', 'ER'].includes(code)) return 5;

  // Maghreb → MWL (3) – widely accepted
  if (['DZ', 'MA', 'TN', 'MR'].includes(code)) return 3;

  // South & Central Asia → Karachi (1)
  if (['PK', 'IN', 'BD', 'AF', 'LK', 'NP', 'MM', 'UZ', 'TJ', 'KG', 'TM', 'KZ'].includes(code)) return 1;

  // Southeast Asia → MWL (3) – most common
  if (['MY', 'ID', 'BN', 'SG', 'PH', 'TH'].includes(code)) return 3;

  // Turkey → Diyanet (13)
  if (code === 'TR') return 13;

  // Iran → Institute of Geophysics, Tehran (7)
  if (code === 'IR') return 7;

  // Iraq, Syria, Jordan, Palestine, Lebanon → MWL (3)
  if (['IQ', 'SY', 'JO', 'PS', 'LB'].includes(code)) return 3;

  // Europe → MWL (3)
  if (['DE', 'FR', 'GB', 'NL', 'BE', 'SE', 'NO', 'DK', 'ES', 'IT', 'CH', 'AT',
       'FI', 'IE', 'PT', 'GR', 'PL', 'CZ', 'HU', 'RO', 'BG', 'HR', 'RS', 'BA',
       'AL', 'MK', 'XK', 'ME', 'SI', 'SK', 'LT', 'LV', 'EE', 'IS', 'LU', 'MT',
       'CY', 'UA', 'BY', 'MD', 'RU'].includes(code)) return 3;

  // North America → ISNA (2)
  if (['US', 'CA', 'MX'].includes(code)) return 2;

  // Australia & NZ → MWL (3)
  if (['AU', 'NZ'].includes(code)) return 3;

  // Sub-Saharan Africa → Egyptian (5)
  if (['NG', 'ET', 'KE', 'TZ', 'UG', 'GH', 'SN', 'ML', 'NE', 'TD', 'CM', 'CI'].includes(code)) return 5;

  // Default → MWL
  return 3;
}

/**
 * Auto-detect Asr juristic school:
 * 0 = Standard (Shafi'i/Maliki/Hanbali), 1 = Hanafi
 */
export function getSchoolByCountry(countryCode: string): number {
  const code = countryCode?.toUpperCase();
  // Hanafi-majority regions
  if (['TR', 'PK', 'AF', 'BD', 'IN', 'UZ', 'TJ', 'KG', 'TM', 'KZ', 'IQ', 'SY',
       'JO', 'PS', 'LB', 'BA', 'AL', 'XK', 'MK'].includes(code)) return 1;
  return 0;
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
        setLocation(prev => ({
          ...prev,
          loading: false,
          error: (prev.latitude !== 0 || prev.longitude !== 0) ? null : 'يرجى تفعيل الموقع الجغرافي لعرض أوقات الصلاة',
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
