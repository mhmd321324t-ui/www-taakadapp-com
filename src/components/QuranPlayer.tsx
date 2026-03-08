import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Play, Pause, SkipForward, SkipBack, Repeat, Repeat1,
  X, ChevronDown, Search, Volume2, Moon
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
}

// Popular reciters with their API identifiers
const RECITERS = [
  { id: 'ar.alafasy', name: 'مشاري العفاسي' },
  { id: 'ar.abdulbasitmurattal', name: 'عبد الباسط عبد الصمد' },
  { id: 'ar.abdurrahmaansudais', name: 'عبد الرحمن السديس' },
  { id: 'ar.saaborealshaatree', name: 'سعود الشريم' },
  { id: 'ar.maaborealshaatree', name: 'أبو بكر الشاطري' },
  { id: 'ar.husaborealshaatree', name: 'هاني الرفاعي' },
  { id: 'ar.muhammadayyoub', name: 'محمد أيوب' },
];

type RepeatMode = 'none' | 'one' | 'all';

export default function QuranPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [reciter, setReciter] = useState(RECITERS[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const [loading, setLoading] = useState(false);
  const [showSurahList, setShowSurahList] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval>>();

  // Load surahs list
  useEffect(() => {
    fetch('https://api.alquran.cloud/v1/surah')
      .then(r => r.json())
      .then(d => setSurahs(d.data || []))
      .catch(() => {});
  }, []);

  const filteredSurahs = surahs.filter(s =>
    s.name.includes(search) ||
    s.englishName.toLowerCase().includes(search.toLowerCase()) ||
    String(s.number).includes(search)
  );

  const getAudioUrl = (surahNum: number) =>
    `https://cdn.islamic.network/quran/audio-surah/128/${reciter}/${surahNum}.mp3`;

  const playSurah = useCallback((surahNum: number) => {
    setSelectedSurah(surahNum);
    setLoading(true);
    setShowSurahList(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener('ended', handleEnded);
    }

    const audio = new Audio(getAudioUrl(surahNum));
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
      setLoading(false);
    });

    audio.addEventListener('canplay', () => {
      audio.play();
      setIsPlaying(true);
      setLoading(false);
    });

    audio.addEventListener('ended', handleEnded);

    audio.addEventListener('error', () => {
      setLoading(false);
      setIsPlaying(false);
    });

    // Progress tracking
    if (progressInterval.current) clearInterval(progressInterval.current);
    progressInterval.current = setInterval(() => {
      if (audio && !audio.paused) {
        setCurrentTime(audio.currentTime);
        setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
      }
    }, 500);
  }, [reciter]);

  const handleEnded = useCallback(() => {
    if (repeatMode === 'one' && selectedSurah) {
      playSurah(selectedSurah);
    } else if (repeatMode === 'all' && selectedSurah) {
      const nextSurah = selectedSurah >= 114 ? 1 : selectedSurah + 1;
      playSurah(nextSurah);
    } else if (repeatMode === 'none' && selectedSurah) {
      // Auto-play next surah
      if (selectedSurah < 114) {
        playSurah(selectedSurah + 1);
      } else {
        setIsPlaying(false);
      }
    }
  }, [repeatMode, selectedSurah, playSurah]);

  // Update ended listener when repeat mode changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.removeEventListener('ended', handleEnded);
      audio.addEventListener('ended', handleEnded);
    }
    return () => {
      audio?.removeEventListener('ended', handleEnded);
    };
  }, [handleEnded]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const nextSurah = () => {
    if (!selectedSurah) return;
    const next = selectedSurah >= 114 ? 1 : selectedSurah + 1;
    playSurah(next);
  };

  const prevSurah = () => {
    if (!selectedSurah) return;
    const prev = selectedSurah <= 1 ? 114 : selectedSurah - 1;
    playSurah(prev);
  };

  const cycleRepeat = () => {
    setRepeatMode(prev =>
      prev === 'none' ? 'all' : prev === 'all' ? 'one' : 'none'
    );
  };

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    // RTL: right side = 0%, left side = 100%
    const pct = 1 - (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * duration;
  };

  const closePlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (progressInterval.current) clearInterval(progressInterval.current);
    setIsOpen(false);
    setIsPlaying(false);
    setSelectedSurah(null);
    setProgress(0);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const currentSurah = surahs.find(s => s.number === selectedSurah);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  return (
    <>
      {/* Entry card on home */}
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="px-4 mb-4"
        >
          <button
            onClick={() => setIsOpen(true)}
            className="w-full rounded-2xl bg-card border border-border p-5 text-right"
          >
            <div className="flex items-center justify-between mb-2">
              <Moon className="h-5 w-5 text-primary" />
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                🎧 استمع وأنت نائم
              </span>
            </div>
            <p className="text-sm font-bold text-foreground mb-1">مشغّل القرآن الكريم</p>
            <p className="text-xs text-muted-foreground">
              شغّل أي سورة مع تكرار أو تشغيل تلقائي لجميع السور
            </p>
          </button>
        </motion.div>
      )}

      {/* Player panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 mb-4"
          >
            <div className="rounded-2xl bg-card border border-border overflow-hidden">
              {/* Header */}
              <div className="gradient-islamic p-4 flex items-center justify-between">
                <button onClick={closePlayer} className="p-1.5 rounded-full bg-white/10">
                  <X className="h-4 w-4 text-white" />
                </button>
                <div className="text-right">
                  <h3 className="text-sm font-bold text-white">🎧 مشغّل القرآن</h3>
                  {currentSurah && (
                    <p className="text-white/70 text-xs mt-0.5">
                      {currentSurah.number}. {currentSurah.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Reciter selector */}
              <div className="p-4 border-b border-border">
                <label className="text-[10px] text-muted-foreground mb-1.5 block text-right">القارئ</label>
                <select
                  value={reciter}
                  onChange={e => setReciter(e.target.value)}
                  className="w-full rounded-xl bg-muted border-0 p-2.5 text-sm text-foreground text-right"
                  dir="rtl"
                >
                  {RECITERS.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              {/* Surah selector */}
              <div className="p-4 border-b border-border">
                <button
                  onClick={() => setShowSurahList(!showSurahList)}
                  className="w-full flex items-center justify-between rounded-xl bg-muted p-3"
                >
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showSurahList && "rotate-180")} />
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
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="ابحث عن سورة..."
                            className="pl-8 rounded-lg text-right text-xs h-9"
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-0.5">
                          {filteredSurahs.map(s => (
                            <button
                              key={s.number}
                              onClick={() => playSurah(s.number)}
                              className={cn(
                                "w-full flex items-center justify-between p-2.5 rounded-lg text-right transition-colors",
                                selectedSurah === s.number
                                  ? "bg-primary/10 text-primary"
                                  : "hover:bg-muted"
                              )}
                            >
                              <span className="text-[10px] text-muted-foreground">{s.numberOfAyahs} آية</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-foreground">{s.name}</span>
                                <span className="text-[10px] text-muted-foreground w-6 text-center">{s.number}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Player controls */}
              {selectedSurah && (
                <div className="p-4">
                  {/* Progress bar */}
                  <div
                    className="w-full h-1.5 rounded-full bg-muted mb-2 cursor-pointer"
                    onClick={seekTo}
                  >
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%`, marginRight: 'auto', marginLeft: 0 }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-4 tabular-nums" dir="ltr">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-5">
                    {/* Repeat */}
                    <button onClick={cycleRepeat} className="p-2">
                      {repeatMode === 'one' ? (
                        <Repeat1 className="h-5 w-5 text-primary" />
                      ) : (
                        <Repeat className={cn("h-5 w-5", repeatMode === 'all' ? "text-primary" : "text-muted-foreground")} />
                      )}
                    </button>

                    {/* Next (RTL: appears on right = previous) */}
                    <button onClick={nextSurah} className="p-2">
                      <SkipForward className="h-5 w-5 text-foreground" />
                    </button>

                    {/* Play/Pause */}
                    <button
                      onClick={selectedSurah && !isPlaying && !audioRef.current ? () => playSurah(selectedSurah) : togglePlay}
                      disabled={loading}
                      className="h-14 w-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20"
                    >
                      {loading ? (
                        <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      ) : isPlaying ? (
                        <Pause className="h-6 w-6 text-primary-foreground" />
                      ) : (
                        <Play className="h-6 w-6 text-primary-foreground mr-[-2px]" />
                      )}
                    </button>

                    {/* Previous (RTL: appears on left = next) */}
                    <button onClick={prevSurah} className="p-2">
                      <SkipBack className="h-5 w-5 text-foreground" />
                    </button>

                    {/* Volume indicator */}
                    <div className="p-2">
                      <Volume2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Repeat mode label */}
                  <p className="text-center text-[10px] text-muted-foreground mt-3">
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
