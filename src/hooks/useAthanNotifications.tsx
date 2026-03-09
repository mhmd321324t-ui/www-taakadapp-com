import { useEffect } from 'react';
import { PrayerTime } from './usePrayerTimes';
import { schedulePrayerNotifications, setAthanAlertCallback, AthanAlertCallback } from '@/lib/prayerNotifications';

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
 * Hook: monitors prayer times and sends notifications + full-screen alerts
 */
export function useAthanNotifications(
  prayers: PrayerTime[],
  enabled: boolean = true,
  onAlert?: AthanAlertCallback
) {
  const scheduledRef = useRef(false);

  // Register the alert callback
  useEffect(() => {
    if (enabled && onAlert) {
      setAthanAlertCallback(onAlert);
    }
    return () => {
      setAthanAlertCallback(null);
    };
  }, [enabled, onAlert]);

  // Build a stable key from prayer times to detect real changes
  const prayersKey = prayers.map(p => `${p.key}:${p.time24}`).join(',');

  useEffect(() => {
    if (!enabled || prayers.length === 0) return;

    // Schedule (or re-schedule) notifications whenever prayers actually change
    schedulePrayerNotifications(prayers);
  }, [prayersKey, enabled]);
}
