import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { usePrayerTimes, getNextPrayer, type PrayerTime } from './usePrayerTimes';
import { useSavedMosqueTimes } from './useSavedMosqueTimes';
import { useGeoLocation } from './useGeoLocation';

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
  calculationMethod: number;
  school: number;
}

const PrayerContext = createContext<UnifiedPrayerData | null>(null);

export function UnifiedPrayerProvider({ children }: { children: ReactNode }) {
  const location = useGeoLocation();
  const apiData = usePrayerTimes(
    location.latitude,
    location.longitude,
    location.calculationMethod,
    location.school
  );
  const mosqueData = useSavedMosqueTimes();

  // Determine active source: mosque overrides auto
  const hasMosque = !!mosqueData.mosqueName && !!mosqueData.prayers && mosqueData.prayers.length > 0;
  const source: PrayerSource = hasMosque ? 'mosque' : 'auto';
  const prayers = hasMosque ? mosqueData.prayers! : apiData.prayers;
  const { prayer: nextPrayer, remaining } = getNextPrayer(prayers);

  const sourceLabel = hasMosque
    ? mosqueData.mosqueName || 'المسجد'
    : location.city || 'تلقائي';

  const value: UnifiedPrayerData = {
    prayers,
    nextPrayer,
    remaining,
    hijriDate: apiData.hijriDate,
    hijriDay: apiData.hijriDay,
    hijriMonthNumber: apiData.hijriMonthNumber,
    hijriYear: apiData.hijriYear,
    loading: apiData.loading || mosqueData.loading,
    source,
    sourceLabel,
    mosqueName: mosqueData.mosqueName,
    city: location.city || '',
    country: location.country || '',
    latitude: location.latitude,
    longitude: location.longitude,
    locationLoading: location.loading,
    locationError: location.error,
    detectLocation: location.detectLocation,
    unlinkMosque: mosqueData.unlinkMosque,
    calculationMethod: location.calculationMethod,
    school: location.school,
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
