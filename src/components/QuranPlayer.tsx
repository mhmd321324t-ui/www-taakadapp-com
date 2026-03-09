import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Repeat,
  Repeat1,
  X,
  ChevronDown,
  Search,
  Volume2,
  Moon,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { normalizeArabicForSearch } from '@/lib/arabicNormalize';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
}

// Curated working servers (mp3quran) — must point to folders that contain 001.mp3 ... 114.mp3
const RECITERS = [
  { id: 'alafasy', name: 'مشاري العفاسي', server: 'https://server8.mp3quran.net/afs/' },
  { id: 'sudais', name: 'عبد الرحمن السديس', server: 'https://server11.mp3quran.net/sds/' },
  { id: 'shuraym', name: 'سعود الشريم', server: 'https://server7.mp3quran.net/shur/' },
  { id: 'abdulbasit', name: 'عبد الباسط عبد الصمد', server: 'https://server7.mp3quran.net/basit/Almusshaf-Al-Mojawwad/' },
  { id: 'husary', name: 'محمود خليل الحصري', server: 'https://server13.mp3quran.net/husr/' },
  { id: 'minshawi', name: 'محمد صديق المنشاوي', server: 'https://server10.mp3quran.net/minsh/' },
  { id: 'ajamy', name: 'أحمد بن علي العجمي', server: 'https://server10.mp3quran.net/ajm/' },
  { id: 'maher', name: 'ماهر المعيقلي', server: 'https://server12.mp3quran.net/maher/' },
  { id: 'hani', name: 'هاني الرفاعي', server: 'https://server9.mp3quran.net/hani/' },
  { id: 'ayyoub', name: 'محمد أيوب', server: 'https://server8.mp3quran.net/ayyub/' },
  { id: 'shaatri', name: 'أبو بكر الشاطري', server: 'https://server11.mp3quran.net/shatri/' },
  { id: 'hudhaify', name: 'علي بن عبدالرحمن الحذيفي', server: 'https://server11.mp3quran.net/hthfi/' },
  { id: 'tablawi', name: 'محمد الطبلاوي', server: 'https://server8.mp3quran.net/tblawi/' },
  { id: 'yasser', name: 'ياسر الدوسري', server: 'https://server11.mp3quran.net/yasser/' },
  { id: 'nasser', name: 'ناصر القطامي', server: 'https://server6.mp3quran.net/qtm/' },
  { id: 'banna', name: 'محمود علي البنا', server: 'https://server8.mp3quran.net/bna/' },
  { id: 'fares', name: 'فارس عباد', server: 'https://server8.mp3quran.net/frs_a/' },
  { id: 'ghamdi', name: 'سعد الغامدي', server: 'https://server7.mp3quran.net/s_gmd/' },
  { id: 'bukhatir', name: 'أحمد بن خاطر', server: 'https://server13.mp3quran.net/bukhtr/' },
  { id: 'juhany', name: 'عبدالله الجهني', server: 'https://server11.mp3quran.net/a_jhn/' },
] as const;

type ReciterId = (typeof RECITERS)[number]['id'];
type RepeatMode = 'none' | 'one' | 'all';

function getReciterById(id: string) {
  return RECITERS.find(r => r.id === id) || RECITERS[0];
}

function getSurahAudioUrl({ surahNumber, reciterId }: { surahNumber: number; reciterId: string }) {
  const rec = getReciterById(reciterId);
  const padded = String(surahNumber).padStart(3, '0');
  return `${rec.server}${padded}.mp3`;
}

export default function QuranPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [reciter, setReciter] = useState<ReciterId>(() => {
    const saved = localStorage.getItem('quran-reciter');
    return (saved as ReciterId) || RECITERS[0].id;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const [loading, setLoading] = useState(false);
  const [showSurahList, setShowSurahList] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Stable audio element (do NOT replace the Audio object; just change src)
  const audioRef = useRef<HTMLAudioElement>(new Audio());

  // Keep latest state for event handlers
  const selectedSurahRef = useRef<number | null>(null);
  const repeatModeRef = useRef<RepeatMode>('none');
  const reciterRef = useRef<ReciterId>(reciter);

  useEffect(() => {
    selectedSurahRef.current = selectedSurah;
  }, [selectedSurah]);

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  useEffect(() => {
    reciterRef.current = reciter;
  }, [reciter]);

  // Load surahs list
  useEffect(() => {
    fetch('https://api.alquran.cloud/v1/surah')
      .then(r => r.json())
      .then(d => setSurahs(d.data || []))
      .catch(() => {});
  }, []);

  // Attach audio listeners once
  useEffect(() => {
    const audio = audioRef.current;
    audio.preload = 'auto';

    const onLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
      setLoading(false);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };

    const onEnded = () => {
      const current = selectedSurahRef.current;
      const mode = repeatModeRef.current;
      const rid = reciterRef.current;

      if (!current) {
        setIsPlaying(false);
        return;
      }

      if (mode === 'one') {
        void startSurah(current, rid, { autoplay: true, silentErrors: true });
        return;
      }

      if (mode === 'all') {
        const next = current >= 114 ? 1 : current + 1;
        void startSurah(next, rid, { autoplay: true, silentErrors: true });
        return;
      }

      // none: auto-next to help "sleep listening"
      if (current < 114) {
        void startSurah(current + 1, rid, { autoplay: true, silentErrors: true });
      } else {
        setIsPlaying(false);
      }
    };

    const onError = () => {
      // Only show error if we actually have a src set (avoid spurious errors on reset)
      if (audio.src && audio.src !== window.location.href) {
        setLoading(false);
        setIsPlaying(false);
        const currentReciter = getReciterById(reciterRef.current);
        toast.error(`تعذر تشغيل الصوت من "${currentReciter.name}" — جرّب قارئاً آخر`);
      }
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.pause();
      audio.src = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalizedQuery = useMemo(() => normalizeArabicForSearch(search), [search]);

  const filteredSurahs = useMemo(() => {
    if (!search.trim()) return surahs;

    return surahs.filter(s => {
      if (String(s.number) === search.trim()) return true;
      const nameNorm = normalizeArabicForSearch(s.name);
      const engNorm = normalizeArabicForSearch(s.englishName);
      return nameNorm.includes(normalizedQuery) || engNorm.includes(normalizedQuery);
    });
  }, [surahs, search, normalizedQuery]);

  async function startSurah(
    surahNumber: number,
    reciterId: string,
    opts: { autoplay: boolean; silentErrors?: boolean }
  ) {
    const audio = audioRef.current;

    setSelectedSurah(surahNumber);
    setShowSurahList(false);
    setLoading(true);

    // Stop current audio cleanly
    audio.pause();
    audio.currentTime = 0;

    const url = getSurahAudioUrl({ surahNumber, reciterId });
    audio.src = url;
    audio.load();

    if (!opts.autoplay) {
      setIsPlaying(false);
      setLoading(false);
      return;
    }

    try {
      // IMPORTANT: call play() immediately while still in user gesture (onClick/onChange)
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
      setLoading(false);
      if (!opts.silentErrors) {
        toast.error('المتصفح منع التشغيل التلقائي — اضغط تشغيل مرة واحدة');
      }
    }
  }

  const handleReciterChange = async (newReciterId: ReciterId) => {
    const audio = audioRef.current;
    const wasPlaying = !audio.paused;

    setReciter(newReciterId);
    reciterRef.current = newReciterId;
    localStorage.setItem('quran-reciter', newReciterId);

    // If a surah is selected, reload it with the new reciter.
    if (selectedSurahRef.current) {
      // Unlock audio context immediately within user gesture by calling play() on current src
      if (wasPlaying) {
        try { await audio.play(); } catch { /* expected, just unlocking */ }
      }
      await startSurah(selectedSurahRef.current, newReciterId, { autoplay: wasPlaying });
    }
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio.src) return;

    if (!audio.paused) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
      toast.error('تعذر تشغيل الصوت');
    }
  };

  const nextSurah = async () => {
    const current = selectedSurahRef.current;
    if (!current) return;
    const next = current >= 114 ? 1 : current + 1;
    await startSurah(next, reciterRef.current, { autoplay: true, silentErrors: true });
  };

  const prevSurah = async () => {
    const current = selectedSurahRef.current;
    if (!current) return;
    const prev = current <= 1 ? 114 : current - 1;
    await startSurah(prev, reciterRef.current, { autoplay: true, silentErrors: true });
  };

  const cycleRepeat = () => {
    setRepeatMode(prev => (prev === 'none' ? 'all' : prev === 'all' ? 'one' : 'none'));
  };

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    // RTL: right side = 0%, left side = 100%
    const pct = 1 - (e.clientX - rect.left) / rect.width;
    audio.currentTime = Math.max(0, Math.min(audio.duration, pct * audio.duration));
  };

  const closePlayer = () => {
    const audio = audioRef.current;
    audio.pause();
    audio.currentTime = 0;
    // Keep src so reopening keeps current selection; user asked mainly switching reliability
    setIsOpen(false);
    setIsPlaying(false);
    setSelectedSurah(null);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setSearch('');
    setShowSurahList(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const currentSurah = surahs.find(s => s.number === selectedSurah);

  return (
    <>
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="px-4 mb-4"
        >
          <button
            onClick={() => setIsOpen(true)}
            className="w-full rounded-3xl bg-card border border-border/50 p-5 text-right shadow-elevated"
          >
            <div className="flex items-center justify-between mb-2">
              <Moon className="h-5 w-5 text-primary" />
              <span className="inline-block rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary">
                🎧 استمع وأنت نائم
              </span>
            </div>
            <p className="text-sm font-bold text-foreground mb-1">مشغّل القرآن الكريم</p>
            <p className="text-xs text-muted-foreground">
              شغّل أي سورة مع تكرار أو تشغيل تلقائي — {RECITERS.length} قارئ
            </p>
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 mb-4"
          >
            <div className="rounded-3xl bg-card border border-border/50 overflow-hidden shadow-elevated">
              <div className="gradient-islamic p-4 flex items-center justify-between relative overflow-hidden">
                <div className="absolute inset-0 islamic-pattern opacity-20" />
                <button onClick={closePlayer} aria-label="إغلاق المشغّل" className="p-1.5 rounded-full bg-white/10 relative z-10">
                  <X className="h-4 w-4 text-white" />
                </button>
                <div className="text-right relative z-10">
                  <h3 className="text-sm font-bold text-white">🎧 مشغّل القرآن</h3>
                  {currentSurah && (
                    <p className="text-white/70 text-xs mt-0.5">
                      {currentSurah.number}. {currentSurah.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 border-b border-border/50">
                <label className="text-xs text-muted-foreground mb-1.5 block text-right">
                  القارئ ({RECITERS.length} قارئ)
                </label>
                <select
                  value={reciter}
                  onChange={e => void handleReciterChange(e.target.value as ReciterId)}
                  className="w-full rounded-2xl bg-muted border-0 p-2.5 text-sm text-foreground text-right"
                  dir="rtl"
                >
                  {RECITERS.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-4 border-b border-border/50">
                <button
                  onClick={() => setShowSurahList(!showSurahList)}
                  className="w-full flex items-center justify-between rounded-2xl bg-muted p-3"
                >
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-muted-foreground transition-transform',
                      showSurahList && 'rotate-180'
                    )}
                  />
                  <span className="text-sm font-medium text-foreground">
                    {currentSurah ? `${currentSurah.number}. ${currentSurah.name}` : 'اختر سورة'}
                  </span>
                </button>

                <AnimatePresence>
                  {showSurahList && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3">
                        <div className="relative mb-2">
                          <Search className="absolute end-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="ابحث عن سورة..."
                            className="pe-8 rounded-2xl text-start text-xs h-9 border-border/50"
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-0.5">
                          {filteredSurahs.map(s => (
                            <button
                              key={s.number}
                              onClick={() => void startSurah(s.number, reciterRef.current, { autoplay: true })}
                              className={cn(
                                'w-full flex items-center justify-between p-2.5 rounded-xl text-right transition-colors',
                                selectedSurah === s.number
                                  ? 'bg-primary/10 text-primary'
                                  : 'hover:bg-muted'
                              )}
                            >
                              <span className="text-xs text-muted-foreground">{s.numberOfAyahs} آية</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-foreground">{s.name}</span>
                                <span className="text-xs text-muted-foreground w-6 text-center">{s.number}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {selectedSurah && (
                <div className="p-4">
                  <div className="w-full h-1.5 rounded-full bg-muted mb-2 cursor-pointer" onClick={seekTo}>
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%`, marginInlineEnd: 'auto', marginInlineStart: 0 }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-4 tabular-nums" dir="ltr">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>

                  <div className="flex items-center justify-center gap-5">
                    <button onClick={cycleRepeat} aria-label="تغيير وضع التكرار" className="p-2">
                      {repeatMode === 'one' ? (
                        <Repeat1 className="h-5 w-5 text-primary" />
                      ) : (
                        <Repeat
                          className={cn(
                            'h-5 w-5',
                            repeatMode === 'all' ? 'text-primary' : 'text-muted-foreground'
                          )}
                        />
                      )}
                    </button>

                    <button onClick={() => void nextSurah()} aria-label="السورة التالية" className="p-2">
                      <SkipForward className="h-5 w-5 text-foreground" />
                    </button>

                    <button
                      onClick={() => void togglePlay()}
                      disabled={loading}
                      aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                      className="h-14 w-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20"
                    >
                      {loading ? (
                        <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      ) : isPlaying ? (
                        <Pause className="h-6 w-6 text-primary-foreground" />
                      ) : (
                        <Play className="h-6 w-6 text-primary-foreground" />
                      )}
                    </button>

                    <button onClick={() => void prevSurah()} aria-label="السورة السابقة" className="p-2">
                      <SkipBack className="h-5 w-5 text-foreground" />
                    </button>

                    <div className="p-2">
                      <Volume2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>

                  <p className="text-center text-xs text-muted-foreground mt-3">
                    {repeatMode === 'one' && '🔂 تكرار السورة الحالية'}
                    {repeatMode === 'all' && '🔁 تشغيل جميع السور تلقائياً'}
                    {repeatMode === 'none' && '➡️ الانتقال للسورة التالية تلقائياً'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
