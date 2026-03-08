// Athan audio sources - local files for reliability
export interface AthanOption {
  id: string;
  name: string;
  nameAr: string;
  url: string;
  fajrUrl?: string;
}

export const ATHAN_OPTIONS: AthanOption[] = [
  {
    id: 'makkah',
    name: 'Makkah',
    nameAr: 'أذان مكة المكرمة',
    url: '/audio/athan/makkah.mp3',
  },
  {
    id: 'madinah',
    name: 'Madinah',
    nameAr: 'أذان المدينة المنورة',
    url: '/audio/athan/madinah.mp3',
  },
  {
    id: 'turkish',
    name: 'Turkish Athan',
    nameAr: 'الأذان التركي',
    url: '/audio/athan/turkish.mp3',
  },
  {
    id: 'umayyad',
    name: 'Umayyad Mosque (Damascus)',
    nameAr: 'الجامع الأموي (دمشق)',
    url: '/audio/athan/umayyad.mp3',
  },
  {
    id: 'quds',
    name: 'Al-Aqsa Mosque (Jerusalem)',
    nameAr: 'المسجد الأقصى (القدس)',
    url: '/audio/athan/quds.mp3',
  },
  {
    id: 'sudais',
    name: 'Abdul Rahman Al-Sudais',
    nameAr: 'عبد الرحمن السديس',
    url: '/audio/athan/sudais.mp3',
  },
  {
    id: 'abdulbasit',
    name: 'Abdul Basit Abdul Samad',
    nameAr: 'عبد الباسط عبد الصمد',
    url: '/audio/athan/abdulbasit.mp3',
  },
  {
    id: 'default',
    name: 'Simple Beep',
    nameAr: 'تنبيه بسيط',
    url: '',
  },
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
const preloadPromises = new Map<string, Promise<void>>();

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

function preloadUrl(url: string, highPriority: boolean = false): Promise<void> {
  if (!url) return Promise.resolve();

  const audio = ensureAudio(url);
  if (highPriority) {
    audio.preload = 'auto';
    audio.load();
  }

  if (audio.readyState >= 3) {
    return Promise.resolve();
  }

  const existingPromise = preloadPromises.get(url);
  if (existingPromise) return existingPromise;

  const promise = new Promise<void>((resolve) => {
    let done = false;
    const cleanup = () => {
      audio.removeEventListener('canplaythrough', onReady);
      audio.removeEventListener('loadeddata', onReady);
      audio.removeEventListener('error', onReady);
      clearTimeout(timeoutId);
      preloadPromises.delete(url);
    };

    const onReady = () => {
      if (done) return;
      done = true;
      cleanup();
      resolve();
    };

    const timeoutId = window.setTimeout(onReady, 2000);

    audio.addEventListener('canplaythrough', onReady);
    audio.addEventListener('loadeddata', onReady);
    audio.addEventListener('error', onReady);
  });

  preloadPromises.set(url, promise);
  return promise;
}

export function preloadAthanById(id: string, highPriority: boolean = false) {
  const athan = ATHAN_OPTIONS.find(a => a.id === id);
  if (!athan) return;

  if (athan.url) void preloadUrl(athan.url, highPriority);
  if (athan.fajrUrl) void preloadUrl(athan.fajrUrl, highPriority);
}

/**
 * Pre-load the selected athan audio so it plays instantly when needed.
 */
export function preloadSelectedAthan(highPriority: boolean = false) {
  const athan = getSelectedAthan();
  if (!athan.url) return;

  void preloadUrl(athan.url, highPriority);
  if (athan.fajrUrl) void preloadUrl(athan.fajrUrl, highPriority);
}

/**
 * Warm up all athan options in the background to avoid first-play delay
 * when users switch to another voice.
 */
export function preloadAllAthans() {
  for (const athan of ATHAN_OPTIONS) {
    if (athan.url) void preloadUrl(athan.url);
    if (athan.fajrUrl) void preloadUrl(athan.fajrUrl);
  }
}

function createAndPlayAudio(url: string): HTMLAudioElement {
  const audio = ensureAudio(url);

  audio.pause();
  audio.currentTime = 0;
  audio.volume = getSavedVolume();

  audio.onerror = () => {
    console.warn('Athan audio failed to load:', url);
    if (currentAudio === audio) {
      currentAudio = null;
    }
  };

  audio.onended = () => {
    if (currentAudio === audio) {
      currentAudio = null;
    }
    void preloadUrl(url);
  };

  audio.play().catch(() => {
    console.warn('Athan audio failed to play:', url);
    if (currentAudio === audio) {
      currentAudio = null;
    }
  });

  return audio;
}

export function playAthan(prayerKey?: string): HTMLAudioElement | null {
  stopAthan();

  const athan = getSelectedAthan();
  if (!athan.url) return null;

  const url = prayerKey === 'fajr' && athan.fajrUrl ? athan.fajrUrl : athan.url;
  void preloadUrl(url, true);
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

  void preloadUrl(athan.url, true);
  currentAudio = createAndPlayAudio(athan.url);
  return currentAudio;
}

// Warm selected athan immediately, then warm all in idle background.
preloadSelectedAthan(true);

if (typeof window !== 'undefined') {
  const warmAll = () => preloadAllAthans();

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(warmAll, { timeout: 2000 });
  } else {
    globalThis.setTimeout(warmAll, 1200);
  }
}
