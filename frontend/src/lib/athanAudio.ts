// Athan audio sources - local files for reliability
export interface AthanOption {
  id: string;
  name: string;
  nameAr: string;
  url: string;
  fajrUrl?: string;
}

export const ATHAN_OPTIONS: AthanOption[] = [
  { id: 'makkah', name: 'Makkah', nameAr: 'أذان مكة المكرمة', url: '/audio/athan/makkah.mp3' },
  { id: 'madinah', name: 'Madinah', nameAr: 'أذان المدينة المنورة', url: '/audio/athan/madinah.mp3' },
  { id: 'turkish', name: 'Turkish Athan', nameAr: 'الأذان التركي', url: '/audio/athan/turkish.mp3' },
  { id: 'umayyad', name: 'Umayyad Mosque (Damascus)', nameAr: 'الجامع الأموي (دمشق)', url: '/audio/athan/umayyad.mp3' },
  { id: 'quds', name: 'Al-Aqsa Mosque (Jerusalem)', nameAr: 'المسجد الأقصى (القدس)', url: '/audio/athan/quds.mp3', fajrUrl: '/audio/athan/quds-fajr.mp3' },
  { id: 'abdulbasit', name: 'Abdul Basit Abdul Samad', nameAr: 'عبد الباسط عبد الصمد', url: '/audio/athan/abdulbasit.mp3' },
  { id: 'shahat', name: 'Shahat Anwar', nameAr: 'شحات محمد أنور', url: '/audio/athan/shahat.mp3', fajrUrl: '/audio/athan/shahat-fajr.mp3' },
  { id: 'saqqaf', name: 'Al-Saqqaf', nameAr: 'السقاف', url: '/audio/athan/saqqaf.mp3', fajrUrl: '/audio/athan/saqqaf-fajr.mp3' },
  { id: 'default', name: 'Simple Beep', nameAr: 'تنبيه بسيط', url: '' },
];

export function getSelectedAthan(): AthanOption {
  const id = localStorage.getItem('athan-sound') || 'makkah';
  return ATHAN_OPTIONS.find(a => a.id === id) || ATHAN_OPTIONS[0];
}

export function setSelectedAthan(id: string) {
  localStorage.setItem('athan-sound', id);
}

let currentAudio: HTMLAudioElement | null = null;
const preloadedAudios = new Map<string, HTMLAudioElement>();

function getSavedVolume() {
  return parseFloat(localStorage.getItem('athan-volume') || '0.8');
}

function ensureAudio(url: string): HTMLAudioElement {
  const existing = preloadedAudios.get(url);
  if (existing) return existing;
  const audio = new Audio();
  audio.preload = 'auto';
  audio.src = url;
  audio.load();
  preloadedAudios.set(url, audio);
  return audio;
}

export function preloadAthanById(id: string, _highPriority: boolean = false) {
  const athan = ATHAN_OPTIONS.find(a => a.id === id);
  if (!athan) return;
  if (athan.url) ensureAudio(athan.url);
  if (athan.fajrUrl) ensureAudio(athan.fajrUrl);
}

export function preloadSelectedAthan(_highPriority: boolean = false) {
  const athan = getSelectedAthan();
  if (athan.url) ensureAudio(athan.url);
  if (athan.fajrUrl) ensureAudio(athan.fajrUrl);
}

export function preloadAllAthans() {
  for (const athan of ATHAN_OPTIONS) {
    if (athan.url) ensureAudio(athan.url);
    if (athan.fajrUrl) ensureAudio(athan.fajrUrl);
  }
}

function createAndPlayAudio(url: string): HTMLAudioElement {
  const audio = new Audio(url);
  audio.volume = getSavedVolume();

  audio.onerror = (e) => {
    console.warn('Athan audio failed:', url, e);
    if (currentAudio === audio) currentAudio = null;
  };
  audio.onended = () => {
    if (currentAudio === audio) currentAudio = null;
  };

  audio.play().catch(err => {
    console.warn('Athan play blocked:', err.message);
    if (currentAudio === audio) currentAudio = null;
  });

  return audio;
}

export function playAthan(prayerKey?: string): HTMLAudioElement | null {
  stopAthan();
  const athan = getSelectedAthan();
  if (!athan.url) {
    // Simple beep fallback
    playBeep();
    return null;
  }
  const url = prayerKey === 'fajr' && athan.fajrUrl ? athan.fajrUrl : athan.url;
  currentAudio = createAndPlayAudio(url);
  return currentAudio;
}

export function stopAthan() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

export function previewAthan(id: string): HTMLAudioElement | null {
  stopAthan();
  const athan = ATHAN_OPTIONS.find(a => a.id === id);
  if (!athan?.url) return null;
  currentAudio = createAndPlayAudio(athan.url);
  return currentAudio;
}

/** Test athan playback - returns true if audio started */
export function testAthanPlayback(): boolean {
  stopAthan();
  const athan = getSelectedAthan();
  if (!athan.url) {
    playBeep();
    return true;
  }
  const audio = createAndPlayAudio(athan.url);
  if (audio) {
    // Stop after 5 seconds for test
    setTimeout(() => {
      if (currentAudio === audio) {
        stopAthan();
      }
    }, 5000);
    return true;
  }
  return false;
}

/** Simple beep for the "default" option */
function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const vol = getSavedVolume();
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(vol * 0.6, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1);
    setTimeout(() => ctx.close(), 2000);
  } catch {}
}

// Preload selected athan on module load
preloadSelectedAthan(true);

// Only preload all athans when user opens settings, not on startup
if (typeof window !== 'undefined') {
  const warmSelected = () => preloadSelectedAthan(true);
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(warmSelected, { timeout: 3000 });
  } else {
    globalThis.setTimeout(warmSelected, 2000);
  }
}
