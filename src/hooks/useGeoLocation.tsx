import { useState, useEffect, useRef } from 'react';

interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  loading: boolean;
  error: string | null;
}

// Round coordinates to 3 decimal places (~111m accuracy) to prevent excessive API calls
function roundCoord(val: number): number {
  return Math.round(val * 1000) / 1000;
}

export function useGeoLocation() {
  const [location, setLocation] = useState<LocationData>(() => {
    // Try loading cached location from localStorage
    try {
      const cached = localStorage.getItem('cached-location');
      if (cached) {
        const parsed = JSON.parse(cached);
        return { ...parsed, loading: true, error: null };
      }
    } catch {}
    return {
      latitude: 21.4225,
      longitude: 39.8262,
      city: 'Makkah',
      country: 'Saudi Arabia',
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
          const loc = {
            latitude,
            longitude,
            city: data.city || data.locality || '',
            country: data.countryName || '',
            loading: false,
            error: null,
          };
          setLocation(loc);
          // Cache for next session
          try {
            localStorage.setItem('cached-location', JSON.stringify({
              latitude: loc.latitude,
              longitude: loc.longitude,
              city: loc.city,
              country: loc.country,
            }));
          } catch {}
        } catch {
          setLocation({
            latitude,
            longitude,
            city: '',
            country: '',
            loading: false,
            error: null,
          });
        }
      },
      () => {
        setLocation(prev => ({ ...prev, loading: false }));
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
