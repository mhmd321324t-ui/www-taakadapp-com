/**
 * Prayer Notification Scheduler using Adhan.js
 * Schedules real prayer time notifications and athan audio
 */
import { Coordinates, PrayerTimes, CalculationMethod, Madhab, Prayer, Qibla } from 'adhan';

export type PrayerMethod = 'MuslimWorldLeague' | 'Egyptian' | 'Karachi' | 'UmmAlQura' | 'Dubai' | 'MoonsightingCommittee' | 'NorthAmerica' | 'Kuwait' | 'Qatar' | 'Singapore' | 'Tehran' | 'Turkey';

interface PrayerTimesResult {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
}

const PRAYER_NAMES_AR: Record<string, string> = {
  fajr: 'الفجر', sunrise: 'الشروق', dhuhr: 'الظهر',
  asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء'
};

const PRAYER_EMOJIS: Record<string, string> = {
  fajr: '🌙', dhuhr: '☀️', asr: '🌤️', maghrib: '🌅', isha: '🌙'
};

export function calculatePrayerTimes(lat: number, lon: number, method: PrayerMethod = 'UmmAlQura', school: 'shafi' | 'hanafi' = 'shafi'): PrayerTimesResult {
  const coords = new Coordinates(lat, lon);
  const date = new Date();
  
  const methodMap: Record<PrayerMethod, any> = {
    MuslimWorldLeague: CalculationMethod.MuslimWorldLeague(),
    Egyptian: CalculationMethod.Egyptian(),
    Karachi: CalculationMethod.Karachi(),
    UmmAlQura: CalculationMethod.UmmAlQura(),
    Dubai: CalculationMethod.Dubai(),
    MoonsightingCommittee: CalculationMethod.MoonsightingCommittee(),
    NorthAmerica: CalculationMethod.NorthAmerica(),
    Kuwait: CalculationMethod.Kuwait(),
    Qatar: CalculationMethod.Qatar(),
    Singapore: CalculationMethod.Singapore(),
    Tehran: CalculationMethod.Tehran(),
    Turkey: CalculationMethod.Turkey(),
  };
  
  const params = methodMap[method] || CalculationMethod.UmmAlQura();
  params.madhab = school === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  
  const times = new PrayerTimes(coords, date, params);
  
  return {
    fajr: times.fajr,
    sunrise: times.sunrise,
    dhuhr: times.dhuhr,
    asr: times.asr,
    maghrib: times.maghrib,
    isha: times.isha,
  };
}

export function getNextPrayer(lat: number, lon: number, method: PrayerMethod = 'UmmAlQura'): { name: string; nameAr: string; time: Date; minutesLeft: number } | null {
  try {
    const coords = new Coordinates(lat, lon);
    const params = CalculationMethod.UmmAlQura();
    const times = new PrayerTimes(coords, new Date(), params);
    const nextPrayer = times.nextPrayer();
    
    if (nextPrayer === Prayer.None) return null;
    
    const prayerNames: Record<string, string> = {
      [Prayer.Fajr]: 'fajr', [Prayer.Sunrise]: 'sunrise', [Prayer.Dhuhr]: 'dhuhr',
      [Prayer.Asr]: 'asr', [Prayer.Maghrib]: 'maghrib', [Prayer.Isha]: 'isha'
    };
    
    const name = prayerNames[nextPrayer] || '';
    const time = times.timeForPrayer(nextPrayer);
    const minutesLeft = Math.floor((time.getTime() - Date.now()) / 60000);
    
    return { name, nameAr: PRAYER_NAMES_AR[name] || name, time, minutesLeft };
  } catch (_e) {
    return null;
  }
}

export function calculateQiblaDirection(lat: number, lon: number): number {
  const qibla = new Qibla(new Coordinates(lat, lon));
  return qibla.direction;
}

export function formatPrayerTime(date: Date, is12h = false): string {
  return date.toLocaleTimeString('ar-SA', {
    hour: '2-digit', minute: '2-digit',
    hour12: is12h
  });
}

// ==================== NOTIFICATION SCHEDULER ====================

export type AthanAlertCallback = (prayerKey: string, prayerTime: string) => void;

let scheduledTimers: ReturnType<typeof setTimeout>[] = [];
let athanAlertCallback: AthanAlertCallback | null = null;

export function setAthanAlertCallback(cb: AthanAlertCallback | null) {
  athanAlertCallback = cb;
}

interface PrayerTimeInput {
  key: string;
  time24: string;
  time?: string;
  name?: string;
}

export function schedulePrayerNotifications(prayers: PrayerTimeInput[], enabledPrayers?: string[], reminderMinutes = 0) {
  clearPrayerSchedule();
  
  try {
    const enabled = enabledPrayers || ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    
    for (const prayer of prayers) {
      if (!enabled.includes(prayer.key)) continue;
      if (prayer.key === 'sunrise') continue;
      
      const [h, m] = prayer.time24.split(':').map(Number);
      const now = new Date();
      const prayerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
      const diff = prayerDate.getTime() - now.getTime();
      
      if (diff > 0 && diff < 24 * 60 * 60 * 1000) {
        const timer = setTimeout(() => {
          showPrayerNotification(prayer.key);
          if (athanAlertCallback) {
            athanAlertCallback(prayer.key, prayer.time || prayer.time24);
          }
        }, diff);
        scheduledTimers.push(timer);
        
        if (reminderMinutes > 0) {
          const reminderDiff = diff - reminderMinutes * 60 * 1000;
          if (reminderDiff > 0) {
            const reminderTimer = setTimeout(() => {
              showPrayerReminder(prayer.key, reminderMinutes);
            }, reminderDiff);
            scheduledTimers.push(reminderTimer);
          }
        }
      }
    }
    
    return true;
  } catch (_e) {
    return false;
  }
}

export function clearPrayerSchedule() {
  scheduledTimers.forEach(t => clearTimeout(t));
  scheduledTimers = [];
}

function showPrayerNotification(prayer: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  
  const title = `🕌 حان وقت صلاة ${PRAYER_NAMES_AR[prayer]}`;
  const body = 'الصلاة خير من النوم • استعد بالوضوء';
  
  // Try service worker notification first (works even with app closed)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(reg => {
      reg.showNotification(title, {
        body,
        icon: '/pwa-icon-192.png',
        badge: '/pwa-icon-192.png',
        tag: `prayer-${prayer}`,
        requireInteraction: true,
        vibrate: [300, 100, 300, 100, 300],
        // @ts-ignore
        renotify: true,
        data: { prayer, type: 'athan', url: '/' },
        actions: [
          { action: 'open', title: 'فتح التطبيق' },
          { action: 'dismiss', title: 'تجاهل' },
        ],
      });
    });
  } else {
    new Notification(title, { body, icon: '/pwa-icon-192.png' });
  }
  
  // Play athan audio
  playAthan(prayer);
  
  // Store last notification time
  localStorage.setItem(`last_notification_${prayer}`, new Date().toISOString());
}

function showPrayerReminder(prayer: string, minutes: number) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  
  const title = `⏰ بعد ${minutes} دقيقة صلاة ${PRAYER_NAMES_AR[prayer]}`;
  const body = 'استعد للصلاة - حي على الصلاة';
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(reg => {
      reg.showNotification(title, {
        body,
        icon: '/pwa-icon-192.png',
        tag: `reminder-${prayer}`,
        vibrate: [200, 100, 200],
        data: { prayer, type: 'reminder', url: '/prayer-times' },
      });
    });
  }
}

// Athan audio player
const ATHAN_SOURCES = [
  '/audio/athan-fajr.mp3',
  'https://download.quranicaudio.com/quran/Abdul_Basit_Murattal_192kbps/001.mp3', // fallback
];

let athanAudio: HTMLAudioElement | null = null;

export function playAthan(prayer: string) {
  try {
    // Stop any existing athan
    stopAthan();
    
    const athanSrc = prayer === 'fajr' ? '/audio/athan-fajr.mp3' : '/audio/athan.mp3';
    athanAudio = new Audio(athanSrc);
    athanAudio.volume = 0.8;
    athanAudio.play().catch((_e) => {
      // Browser might block autoplay - this is okay
      console.log('Athan autoplay blocked (user interaction required)');
    });
  } catch (_e) {
    // Audio not available
  }
}

export function stopAthan() {
  if (athanAudio) {
    athanAudio.pause();
    athanAudio.currentTime = 0;
    athanAudio = null;
  }
}

export function getMethodNumber(method: string): number {
  const map: Record<string, number> = {
    MuslimWorldLeague: 3, Egyptian: 5, Karachi: 1, UmmAlQura: 4,
    Dubai: 16, Kuwait: 9, Qatar: 10, Singapore: 11, Turkey: 13,
    Tehran: 7, NorthAmerica: 2, MoonsightingCommittee: 15,
  };
  return map[method] || 4;
}
