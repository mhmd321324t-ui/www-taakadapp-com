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

/** Get reminder minutes from localStorage (default 10) */
function getReminderMinutes(): number {
  const saved = localStorage.getItem('prayer-reminder-minutes');
  return saved ? parseInt(saved, 10) : 10;
}

/** Play a short alert tone using Web Audio API */
function playReminderTone() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const vol = parseFloat(localStorage.getItem('athan-volume') || '0.8');

    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.15);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(vol * 0.5, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.7);
    osc2.frequency.setValueAtTime(1320, ctx.currentTime + 0.85);

    gain2.gain.setValueAtTime(vol * 0.5, ctx.currentTime + 0.7);
    gain2.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);

    osc2.start(ctx.currentTime + 0.7);
    osc2.stop(ctx.currentTime + 1.2);

    setTimeout(() => ctx.close(), 2000);
  } catch {
    // Web Audio not supported
  }
}

/** Send a browser notification (works even in background) */
function sendNotification(title: string, body: string, tag: string, silent: boolean = true) {
  // Try service worker notification first (works in background)
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller && Notification.permission === 'granted') {
    navigator.serviceWorker.ready.then(reg => {
      reg.showNotification(title, {
        body,
        icon: '/pwa-icon-192.png',
        badge: '/pwa-icon-192.png',
        tag,
        requireInteraction: true,
        silent,
        data: { url: '/' },
      } as NotificationOptions);
    }).catch(() => {
      // Fallback to regular notification
      try {
        new Notification(title, { body, icon: '/pwa-icon-192.png', tag, silent });
      } catch {}
    });
  } else if (Notification.permission === 'granted') {
    // Direct notification (foreground only)
    try {
      new Notification(title, { body, icon: '/pwa-icon-192.png', tag, silent });
    } catch {}
  }
}

export async function schedulePrayerNotifications(
  prayers: { key: string; time24: string; time: string }[]
) {
  const existingTimers = (window as any).__prayerTimers as number[] | undefined;
  if (existingTimers) {
    existingTimers.forEach(clearTimeout);
  }
  const timers: number[] = [];

  const now = new Date();
  const currentMs = now.getTime();
  const reminderMin = getReminderMinutes();
  const reminderEnabled = localStorage.getItem('notif-prayer-reminder') !== 'false';

  for (const prayer of prayers) {
    if (prayer.key === 'sunrise') continue;

    const [h, m] = prayer.time24.split(':').map(Number);
    const prayerDate = new Date(now);
    prayerDate.setHours(h, m, 0, 0);

    const diff = prayerDate.getTime() - currentMs;
    if (diff <= 0) continue;

    // Main athan timer
    const timer = window.setTimeout(() => {
      // Play the athan sound
      playAthan(prayer.key);

      // Trigger the full-screen alert
      if (onAthanAlert) {
        onAthanAlert(prayer.key, prayer.time);
      }

      // Send notification
      sendNotification(
        'حان وقت الصلاة 🕌',
        `${PRAYER_NAMES[prayer.key] || prayer.key} - ${prayer.time}`,
        `prayer-${prayer.key}`,
        true // silent because athan is playing
      );
    }, diff) as unknown as number;

    timers.push(timer);

    // Pre-prayer reminder
    if (reminderEnabled) {
      const reminderDiff = diff - reminderMin * 60 * 1000;
      if (reminderDiff > 0) {
        const reminderTimer = window.setTimeout(() => {
          playReminderTone();

          sendNotification(
            'تذكير بالصلاة 🔔',
            `${PRAYER_NAMES[prayer.key] || prayer.key} بعد ${reminderMin} دقائق`,
            `prayer-reminder-${prayer.key}`,
            false
          );
        }, reminderDiff) as unknown as number;

        timers.push(reminderTimer);
      }
    }
  }

  (window as any).__prayerTimers = timers;
  
  // Log for debugging
  console.log(`[PrayerNotifications] Scheduled ${timers.length} timers for ${prayers.filter(p => p.key !== 'sunrise').length} prayers`);
}
