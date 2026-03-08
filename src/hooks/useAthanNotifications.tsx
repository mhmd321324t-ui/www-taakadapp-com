import { useEffect, useRef, useCallback } from 'react';
import { PrayerTime } from './usePrayerTimes';
import { schedulePrayerNotifications } from '@/lib/prayerNotifications';

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

/**
 * Hook: monitors prayer times and sends notifications via Service Worker
 */
export function useAthanNotifications(prayers: PrayerTime[], enabled: boolean = true) {
  const scheduledRef = useRef(false);

  useEffect(() => {
    if (!enabled || prayers.length === 0) return;
    if (scheduledRef.current) return;

    scheduledRef.current = true;
    schedulePrayerNotifications(prayers);

    return () => {
      scheduledRef.current = false;
    };
  }, [prayers, enabled]);
}
