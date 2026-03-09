// Prayer notification system with interval-based checking for reliability
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

/** Send a browser notification */
function sendNotification(title: string, body: string, tag: string, silent: boolean = true) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  // Try service worker notification first (works in background)
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
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
      try { new Notification(title, { body, icon: '/pwa-icon-192.png', tag, silent }); } catch {}
    });
  } else {
    try { new Notification(title, { body, icon: '/pwa-icon-192.png', tag, silent }); } catch {}
  }
}

/** Send a test notification to verify everything works */
export function sendTestNotification(): boolean {
  if (!('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;

  sendNotification(
    'إشعار تجريبي ✅',
    'الإشعارات تعمل بنجاح! سيتم إعلامك عند وقت كل صلاة.',
    'test-notification',
    false
  );
  return true;
}

// ─── Interval-based prayer checker (more reliable than setTimeout) ───

interface ScheduledPrayer {
  key: string;
  time: string;
  time24: string;
  minuteOfDay: number; // h*60+m for fast comparison
}

let scheduledPrayers: ScheduledPrayer[] = [];
let firedToday = new Set<string>();
let checkInterval: ReturnType<typeof setInterval> | null = null;

function resetFiredIfNewDay() {
  const todayKey = new Date().toISOString().split('T')[0];
  const lastDay = (window as any).__prayerLastDay;
  if (lastDay !== todayKey) {
    firedToday.clear();
    (window as any).__prayerLastDay = todayKey;
  }
}

function checkPrayers() {
  resetFiredIfNewDay();

  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();
  const reminderMin = getReminderMinutes();
  const reminderEnabled = localStorage.getItem('notif-prayer-reminder') !== 'false';

  for (const prayer of scheduledPrayers) {
    if (prayer.key === 'sunrise') continue;

    // Main athan - fire if we're within 1 minute of the prayer time
    const athanKey = `athan-${prayer.key}`;
    if (!firedToday.has(athanKey) && currentMin >= prayer.minuteOfDay && currentMin <= prayer.minuteOfDay + 1) {
      firedToday.add(athanKey);
      console.log(`[PrayerNotifications] Firing athan for ${prayer.key}`);

      playAthan(prayer.key);
      if (onAthanAlert) onAthanAlert(prayer.key, prayer.time);
      sendNotification(
        'حان وقت الصلاة 🕌',
        `${PRAYER_NAMES[prayer.key] || prayer.key} - ${prayer.time}`,
        `prayer-${prayer.key}`,
        true
      );
    }

    // Pre-prayer reminder
    if (reminderEnabled) {
      const reminderKey = `reminder-${prayer.key}`;
      const reminderMinute = prayer.minuteOfDay - reminderMin;
      if (!firedToday.has(reminderKey) && reminderMinute >= 0 && currentMin >= reminderMinute && currentMin <= reminderMinute + 1) {
        firedToday.add(reminderKey);
        playReminderTone();
        sendNotification(
          'تذكير بالصلاة 🔔',
          `${PRAYER_NAMES[prayer.key] || prayer.key} بعد ${reminderMin} دقائق`,
          `prayer-reminder-${prayer.key}`,
          false
        );
      }
    }
  }
}

export async function schedulePrayerNotifications(
  prayers: { key: string; time24: string; time: string }[]
) {
  // Clear previous interval
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }

  // Build schedule
  scheduledPrayers = prayers.map(p => {
    const [h, m] = p.time24.split(':').map(Number);
    return { ...p, minuteOfDay: h * 60 + m };
  });

  // Reset fired set for a fresh schedule
  resetFiredIfNewDay();

  // Check immediately then every 15 seconds
  checkPrayers();
  checkInterval = setInterval(checkPrayers, 15_000);

  console.log(`[PrayerNotifications] Scheduled checker for ${prayers.filter(p => p.key !== 'sunrise').length} prayers`);
}

// Re-check on visibility change (tab comes back from background)
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && scheduledPrayers.length > 0) {
      console.log('[PrayerNotifications] Tab visible, re-checking prayers');
      checkPrayers();
    }
  });
}
