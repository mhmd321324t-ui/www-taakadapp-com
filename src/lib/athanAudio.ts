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
    id: 'nufais',
    name: 'Ahmed Al-Nufais',
    nameAr: 'أحمد النفيس',
    url: '/audio/athan/nufais.mp3',
  },
  {
    id: 'turkish',
    name: 'Mustafa Ozcan (Turkish)',
    nameAr: 'مصطفى أوزجان (تركي)',
    url: '/audio/athan/turkish.mp3',
  },
  {
    id: 'mishary1',
    name: 'Mishary Rashid (Dubai)',
    nameAr: 'مشاري راشد العفاسي (دبي)',
    url: '/audio/athan/mishary1.mp3',
  },
  {
    id: 'mishary2',
    name: 'Mishary Rashid (2)',
    nameAr: 'مشاري راشد العفاسي (٢)',
    url: '/audio/athan/mishary2.mp3',
  },
  {
    id: 'mishary3',
    name: 'Mishary Rashid (3)',
    nameAr: 'مشاري راشد العفاسي (٣)',
    url: '/audio/athan/mishary3.mp3',
  },
  {
    id: 'zahrani',
    name: 'Mansour Al-Zahrani',
    nameAr: 'منصور الزهراني',
    url: '/audio/athan/zahrani.mp3',
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

// Keep a pre-loaded audio element for faster playback
let preloadedAudio: HTMLAudioElement | null = null;

function getSavedVolume() {
  return parseFloat(localStorage.getItem('athan-volume') || '0.8');
}

/**
 * Pre-load the selected athan audio so it plays instantly when needed.
 * Called on page load and when the user changes athan selection.
 */
export function preloadSelectedAthan() {
  const athan = getSelectedAthan();
  if (!athan.url) return;

  // Don't re-preload the same URL
  if (preloadedAudio && preloadedAudio.src.endsWith(athan.url)) return;

  if (preloadedAudio) {
    preloadedAudio.src = '';
    preloadedAudio = null;
  }

  const audio = new Audio();
  audio.preload = 'auto';
  audio.src = athan.url;
  audio.load(); // Start buffering immediately
  preloadedAudio = audio;
}

/**
 * Create audio element and play it instantly.
 * Uses preloaded audio if available for zero-delay playback.
 */
function createAndPlayAudio(url: string): HTMLAudioElement {
  let audio: HTMLAudioElement;

  // Use preloaded audio if it matches the URL
  if (preloadedAudio && preloadedAudio.src.endsWith(url)) {
    audio = preloadedAudio;
    preloadedAudio = null; // Consumed
  } else {
    audio = new Audio();
    audio.preload = 'auto';
    audio.src = url;
  }

  audio.volume = getSavedVolume();
  audio.currentTime = 0;

  audio.addEventListener('error', () => {
    console.warn('Athan audio failed to load:', url);
    if (currentAudio === audio) {
      currentAudio = null;
    }
  });

  audio.addEventListener('ended', () => {
    if (currentAudio === audio) {
      currentAudio = null;
    }
    // Re-preload for next time
    preloadSelectedAthan();
  });

  // Play immediately — if already buffered this is instant
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

// Auto-preload on module load
preloadSelectedAthan();
