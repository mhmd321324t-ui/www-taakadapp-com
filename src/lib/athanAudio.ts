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

function getSavedVolume() {
  return parseFloat(localStorage.getItem('athan-volume') || '0.8');
}

/**
 * Create audio element and play it.
 * Fixed: removed double-play pattern that caused issues on iOS.
 */
function createAndPlayAudio(url: string): HTMLAudioElement {
  const audio = new Audio();
  audio.preload = 'auto';
  audio.volume = getSavedVolume();
  audio.src = url;

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
  });

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
