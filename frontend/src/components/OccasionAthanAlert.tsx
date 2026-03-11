import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2 } from 'lucide-react';
import { stopAthan } from '@/lib/athanAudio';
import { IslamicOccasion } from '@/data/islamicOccasions';
import { useLocale } from '@/hooks/useLocale';
import RamadanCannon from './RamadanCannon';

const PRAYER_INFO: Record<string, { nameAr: string; nameEn: string; icon: string }> = {
  fajr: { nameAr: 'الفجر', nameEn: 'Fajr', icon: '🌅' },
  dhuhr: { nameAr: 'الظهر', nameEn: 'Dhuhr', icon: '🌞' },
  asr: { nameAr: 'العصر', nameEn: 'Asr', icon: '🌤️' },
  maghrib: { nameAr: 'المغرب', nameEn: 'Maghrib', icon: '🌅' },
  isha: { nameAr: 'العشاء', nameEn: 'Isha', icon: '🌙' },
};

interface OccasionAthanAlertProps {
  prayerKey: string | null;
  prayerTime: string;
  occasion: IslamicOccasion | null;
  onDismiss: () => void;
}

// Twinkling star component
function Star({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0.3, 1, 0],
        scale: [0, 1, 0.8, 1, 0],
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 2,
      }}
      className="absolute rounded-full bg-white"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        filter: `blur(${size > 2 ? 1 : 0}px)`,
      }}
    />
  );
}

export default function OccasionAthanAlert({ prayerKey, prayerTime, occasion, onDismiss }: OccasionAthanAlertProps) {
  const { t, locale } = useLocale();
  const isAr = locale === 'ar';
  const [visible, setVisible] = useState(false);
  const [showCannon, setShowCannon] = useState(false);
  const [cannonDone, setCannonDone] = useState(false);

  useEffect(() => {
    if (prayerKey) {
      if (occasion?.hasCannon && prayerKey === 'maghrib') {
        setShowCannon(true);
      } else {
        setVisible(true);
      }
    }
  }, [prayerKey, occasion]);

  const handleCannonComplete = useCallback(() => {
    setCannonDone(true);
    setShowCannon(false);
    setVisible(true);
  }, []);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    stopAthan();
    setTimeout(onDismiss, 400);
  }, [onDismiss]);

  // Auto-dismiss after 5 minutes
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(handleDismiss, 5 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [visible, handleDismiss]);

  const info = prayerKey ? PRAYER_INFO[prayerKey] : null;
  if (!info) return null;

  const gradient = occasion?.gradient || getDefaultGradient(prayerKey!);
  const isTakbirat = occasion?.takbirat;
  const isIftar = occasion?.hasCannon && prayerKey === 'maghrib';

  const prayerName = isAr ? info.nameAr : info.nameEn;
  const titleText = isIftar
    ? (isAr ? 'حان وقت الإفطار' : 'Time to break your fast')
    : isTakbirat
      ? 'اللّهُ أَكْبَرُ'
      : (isAr ? 'حان وقت الصلاة' : 'Time for Prayer');
  const prayerLabel = isIftar
    ? (isAr ? 'الإفطار' : 'Iftar')
    : (isAr ? `صلاة ${info.nameAr}` : `${info.nameEn} Prayer`);
  const audioText = isTakbirat
    ? (isAr ? 'جاري تشغيل التكبيرات...' : 'Playing Takbirat...')
    : (isAr ? 'جاري تشغيل الأذان...' : 'Playing Athan...');
  const dismissText = isAr ? 'إغلاق' : 'Dismiss';

  // Generate stars
  const stars = Array.from({ length: 30 }, (_, i) => ({
    delay: Math.random() * 3,
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 60}%`,
    size: Math.random() > 0.7 ? 3 : Math.random() > 0.4 ? 2 : 1,
  }));

  return (
    <>
      <RamadanCannon show={showCannon} onComplete={handleCannonComplete} />

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b ${gradient}`}
            dir={isAr ? 'rtl' : 'ltr'}
          >
            {/* Stars layer */}
            {stars.map((star, i) => (
              <Star key={i} {...star} />
            ))}

            {/* Islamic pattern overlay */}
            <div className="absolute inset-0 islamic-pattern opacity-10" />

            {/* Crescent moon decoration */}
            <motion.div
              initial={{ opacity: 0, y: -50, rotate: -30 }}
              animate={{ opacity: 0.15, y: 0, rotate: 0 }}
              transition={{ delay: 0.5, duration: 1.5, type: 'spring' }}
              className="absolute top-16 right-8 text-8xl select-none pointer-events-none"
            >
              🌙
            </motion.div>

            {/* Animated occasion particles */}
            {occasion && Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={`p-${i}`}
                initial={{ opacity: 0, y: 100 }}
                animate={{
                  opacity: [0, 0.5, 0],
                  y: [-20, -250],
                  x: [0, (Math.random() - 0.5) * 120],
                }}
                transition={{
                  duration: 3.5 + Math.random() * 2,
                  delay: i * 0.4,
                  repeat: Infinity,
                }}
                className="absolute bottom-0 text-2xl"
                style={{ left: `${Math.random() * 100}%` }}
              >
                {occasion.emoji}
              </motion.div>
            ))}

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-8 left-6 p-3.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 transition-all active:scale-90 z-10"
            >
              <X className="h-5 w-5 text-white" />
            </button>

            {/* Main content */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: cannonDone ? 0 : 0.2, type: 'spring', damping: 20 }}
              className="flex flex-col items-center text-center px-8 relative z-10"
            >
              {/* Occasion badge */}
              {occasion && (
                <motion.div
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/15 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 mb-5"
                >
                  <span className="text-white/90 text-xs font-bold tracking-wide">
                    {isAr ? occasion.nameAr : occasion.nameEn}
                  </span>
                </motion.div>
              )}

              {/* Prayer icon with glow */}
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="relative mb-6"
              >
                <div className="absolute inset-0 blur-2xl bg-white/20 rounded-full scale-150" />
                <span className="text-8xl relative">{isIftar ? '🌙' : info.icon}</span>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-white/50 text-lg font-medium mb-2"
              >
                {titleText}
              </motion.p>

              {/* Prayer name */}
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-white text-5xl font-bold mb-4 drop-shadow-lg"
              >
                {prayerLabel}
              </motion.h1>

              {/* Time */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-white/80 text-4xl font-light tabular-nums mb-6 drop-shadow-md"
              >
                {prayerTime}
              </motion.p>

              {/* Iftar dua */}
              {isIftar && occasion?.duaAr && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 px-6 py-4 mb-6 max-w-xs"
                >
                  <p className="text-white text-base font-arabic leading-[2] text-center">
                    {occasion.duaAr}
                  </p>
                  <p className="text-white/40 text-xs mt-2">
                    {isAr ? 'دعاء الإفطار' : 'Iftar Dua'}
                  </p>
                </motion.div>
              )}

              {/* Audio indicator with animated bars */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-6 py-3.5 border border-white/20 mb-10"
              >
                <div className="flex items-end gap-0.5 h-4">
                  {[0, 0.1, 0.2, 0.15, 0.05].map((delay, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: ['40%', '100%', '40%'] }}
                      transition={{ duration: 0.8, delay, repeat: Infinity }}
                      className="w-0.5 bg-white/60 rounded-full"
                    />
                  ))}
                </div>
                <span className="text-white/70 text-sm font-medium">{audioText}</span>
              </motion.div>

              {/* Verse / occasion message */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-white/25 text-sm font-arabic leading-relaxed max-w-xs"
              >
                {occasion?.message || 'حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَىٰ وَقُومُوا لِلَّهِ قَانِتِينَ'}
              </motion.p>
            </motion.div>

            {/* Dismiss button */}
            <motion.button
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              onClick={handleDismiss}
              className="absolute bottom-12 bg-white/15 backdrop-blur-md border border-white/25 text-white font-bold rounded-2xl px-12 py-4 text-base transition-all active:scale-95 z-10 shadow-lg"
            >
              {dismissText}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function getDefaultGradient(prayerKey: string): string {
  const gradients: Record<string, string> = {
    fajr: 'from-indigo-900 via-purple-900 to-slate-900',
    dhuhr: 'from-amber-700 via-orange-800 to-yellow-900',
    asr: 'from-sky-800 via-blue-900 to-indigo-900',
    maghrib: 'from-orange-800 via-red-900 to-purple-900',
    isha: 'from-slate-900 via-indigo-950 to-black',
  };
  return gradients[prayerKey] || gradients.isha;
}
