/**
 * Daily Islamic reminders — scheduled local notifications
 * 
 * Schedule:
 * 07:30 — Morning azkar (exit home, work)
 * 13:00 — Midday dua (parents, tasbeeh, salawat, istighfar)
 * 20:00 — Evening Quran reading invitation
 * 22:00 — Bedtime azkar reminder
 */

const STORAGE_KEY = 'daily-reminders-enabled';

export interface DailyReminder {
  id: string;
  hour: number;
  minute: number;
  title: string;
  body: string;
  /** Route to navigate when notification is tapped */
  url: string;
}

export const DAILY_REMINDERS: DailyReminder[] = [
  {
    id: 'morning-azkar',
    hour: 7,
    minute: 30,
    title: '☀️ صباح الخير — لا تنسَ أذكارك',
    body: 'هل قرأت أذكار الصباح والخروج من المنزل؟ ابدأ يومك بذكر الله 🤲',
    url: '/daily-duas?context=morning',
  },
  {
    id: 'midday-dua',
    hour: 13,
    minute: 0,
    title: '🤲 وقفة مع الله',
    body: 'هل دعوت لوالديك اليوم؟ هل سبّحت وصلّيت على النبي ﷺ واستغفرت؟ لا تُفوّت أجر الدعاء',
    url: '/daily-duas?context=midday',
  },
  {
    id: 'evening-quran',
    hour: 20,
    minute: 0,
    title: '📖 هل عندك وقت فراغ؟',
    body: 'تعال نقرأ القرآن معاً.. ولو آيات قليلة تُنير قلبك ✨',
    url: '/daily-duas?context=evening',
  },
  {
    id: 'bedtime-azkar',
    hour: 22,
    minute: 0,
    title: '🌙 قبل ما تنام',
    body: 'لا تنسَ أذكار النوم — حصّن نفسك وأهلك بذكر الله قبل النوم 🛡️',
    url: '/daily-duas?context=bedtime',
  },
];

export function isDailyRemindersEnabled(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export function setDailyRemindersEnabled(enabled: boolean) {
  localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
}

/**
 * Schedule all daily reminder timers for today.
 * Returns cleanup function to clear timers.
 */
export function scheduleDailyReminders(): () => void {
  // Clear existing timers
  const existing = (window as any).__dailyReminderTimers as number[] | undefined;
  if (existing) existing.forEach(clearTimeout);

  const timers: number[] = [];
  const now = new Date();
  const currentMs = now.getTime();

  for (const reminder of DAILY_REMINDERS) {
    const target = new Date(now);
    target.setHours(reminder.hour, reminder.minute, 0, 0);

    let diff = target.getTime() - currentMs;
    // If time already passed today, skip (will schedule tomorrow on next app open)
    if (diff <= 0) continue;

    const timer = window.setTimeout(() => {
      showReminderNotification(reminder);
    }, diff);

    timers.push(timer);
  }

  (window as any).__dailyReminderTimers = timers;

  return () => {
    timers.forEach(clearTimeout);
    (window as any).__dailyReminderTimers = [];
  };
}

async function showReminderNotification(reminder: DailyReminder) {
  if (!('serviceWorker' in navigator) || Notification.permission !== 'granted') return;

  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(reminder.title, {
      body: reminder.body,
      icon: '/pwa-icon-192.png',
      badge: '/pwa-icon-192.png',
      tag: `reminder-${reminder.id}`,
      requireInteraction: false,
      data: { url: reminder.url },
    } as NotificationOptions);
  } catch {
    // Fallback to basic notification
    new Notification(reminder.title, {
      body: reminder.body,
      icon: '/pwa-icon-192.png',
      tag: `reminder-${reminder.id}`,
    });
  }
}
