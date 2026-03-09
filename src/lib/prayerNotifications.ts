// Service Worker notification helper for prayer times
import { playAthan } from './athanAudio';

const PRAYER_NAMES: Record<string, string> = {
  fajr: '🌅 الفجر',
  dhuhr: '🌞 الظهر',
  asr: '🌤️ العصر',
  maghrib: '🌅 المغرب',
  isha: '🌙 العشاء',
};

export type AthanAlertCallback = (prayerKey: string, prayerTime: string) => void;

let onAthanAlert: AthanAlertCallback | null = null;

export function setAthanAlertCallback(cb: AthanAlertCallback | null) {
  onAthanAlert = cb;
}

export async function schedulePrayerNotifications(
  prayers: { key: string; time24: string; time: string }[]
) {
  // Cancel any previously scheduled notifications
  const existingTimers = (window as any).__prayerTimers as number[] | undefined;
  if (existingTimers) {
    existingTimers.forEach(clearTimeout);
  }
  const timers: number[] = [];

  const now = new Date();
  const currentMs = now.getTime();

  for (const prayer of prayers) {
    if (prayer.key === 'sunrise') continue;

    const [h, m] = prayer.time24.split(':').map(Number);
    const prayerDate = new Date(now);
    prayerDate.setHours(h, m, 0, 0);

    const diff = prayerDate.getTime() - currentMs;
    if (diff <= 0) continue;

    const timer = window.setTimeout(() => {
      // Play athan audio
      playAthan(prayer.key);

      // Show full-screen alert
      if (onAthanAlert) {
        onAthanAlert(prayer.key, prayer.time);
      }

      // Also show browser notification (for when app is in background)
      if ('serviceWorker' in navigator && Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification('حان وقت الصلاة 🕌', {
            body: `${PRAYER_NAMES[prayer.key] || prayer.key} - ${prayer.time}`,
            icon: '/pwa-icon-192.png',
            badge: '/pwa-icon-192.png',
            tag: `prayer-${prayer.key}`,
            requireInteraction: true,
            silent: true,
            data: { url: '/' },
          } as NotificationOptions);
        });
      }
    }, diff) as unknown as number;

    timers.push(timer);

    // 10-min reminder (no athan, just notification)
    const reminderDiff = diff - 10 * 60 * 1000;
    if (reminderDiff > 0) {
      const reminderTimer = window.setTimeout(() => {
        if ('serviceWorker' in navigator && Notification.permission === 'granted') {
          navigator.serviceWorker.ready.then(reg => {
            reg.showNotification('تذكير بالصلاة 🔔', {
              body: `${PRAYER_NAMES[prayer.key] || prayer.key} بعد 10 دقائق`,
              icon: '/pwa-icon-192.png',
              badge: '/pwa-icon-192.png',
              tag: `prayer-reminder-${prayer.key}`,
              silent: false,
              data: { url: '/' },
            } as NotificationOptions);
          });
        }
      }, reminderDiff) as unknown as number;

      timers.push(reminderTimer);
    }
  }

  (window as any).__prayerTimers = timers;
}
