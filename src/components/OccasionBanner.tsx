import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star } from 'lucide-react';
import { IslamicOccasion } from '@/data/islamicOccasions';

interface OccasionBannerProps {
  occasion: IslamicOccasion;
}

function hashStringToInt(str: string): number {
  // simple, deterministic hash (32-bit)
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function OccasionBanner({ occasion }: OccasionBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [showFull, setShowFull] = useState(false);

  // Check if already dismissed today
  useEffect(() => {
    const key = `occasion-dismissed-${occasion.id}`;
    const today = new Date().toISOString().split('T')[0];
    const savedDate = localStorage.getItem(key);
    if (savedDate === today) {
      setDismissed(true);
    }
  }, [occasion.id]);

  const dismiss = () => {
    setDismissed(true);
    const key = `occasion-dismissed-${occasion.id}`;
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(key, today);
  };

  const particles = useMemo(() => {
    // Stable "random" particles (prevents re-render jitter that Lighthouse can count as CLS)
    const seedBase = hashStringToInt(String(occasion.id));
    return Array.from({ length: 8 }).map((_, i) => {
      const rand = mulberry32(seedBase + i * 9973);
      const size = 2 + rand() * 6;
      return {
        size,
        top: rand() * 100,
        left: rand() * 100,
        delay: i * 0.4,
      };
    });
  }, [occasion.id]);

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mx-4 mb-4 relative overflow-hidden rounded-3xl"
    >
      <div className={`bg-gradient-to-r ${occasion.gradient} p-5 relative`}>
        {/* Islamic pattern overlay */}
        <div className="absolute inset-0 islamic-pattern opacity-15" />

        {/* Decorative particles */}
        {particles.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 3, delay: p.delay, repeat: Infinity }}
            className="absolute rounded-full bg-white/10"
            style={{
              width: p.size,
              height: p.size,
              top: `${p.top}%`,
              left: `${p.left}%`,
            }}
          />
        ))}

        {/* Close button */}
        <button
          onClick={dismiss}
          aria-label="إغلاق"
          className="absolute top-3 left-3 p-1.5 rounded-full bg-white/10 backdrop-blur-sm z-10"
        >
          <X className="h-3.5 w-3.5 text-white/70" />
        </button>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            <span className="text-white/60 text-xs font-medium">مناسبة إسلامية</span>
          </div>

          {/* Occasion name */}
          <h3 className="text-white text-xl font-bold font-arabic mb-2">{occasion.nameAr}</h3>

          {/* Message */}
          <p className="text-white/80 text-sm leading-relaxed mb-3">{occasion.message}</p>

          {/* Expand button */}
          <button
            onClick={() => setShowFull(!showFull)}
            className="bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-medium rounded-2xl px-4 py-2 transition-all active:scale-95"
          >
            {showFull ? 'إخفاء الدعاء' : 'اقرأ الدعاء ✨'}
          </button>

          {/* Dua section */}
          {showFull && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
                <p className="text-white text-lg font-arabic text-center leading-[2.2]">{occasion.duaAr}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

