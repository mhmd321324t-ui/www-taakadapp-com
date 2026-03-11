import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2 } from 'lucide-react';
import { stopAthan } from '@/lib/athanAudio';

const PRAYER_INFO: Record<string, { name: string; icon: string; gradient: string }> = {
  fajr: { name: 'الفجر', icon: '🌅', gradient: 'from-indigo-900 via-purple-900 to-slate-900' },
  dhuhr: { name: 'الظهر', icon: '🌞', gradient: 'from-amber-700 via-orange-800 to-yellow-900' },
  asr: { name: 'العصر', icon: '🌤️', gradient: 'from-sky-800 via-blue-900 to-indigo-900' },
  maghrib: { name: 'المغرب', icon: '🌅', gradient: 'from-orange-800 via-red-900 to-purple-900' },
  isha: { name: 'العشاء', icon: '🌙', gradient: 'from-slate-900 via-indigo-950 to-black' },
};

interface AthanAlertProps {
  prayerKey: string | null;
  prayerTime: string;
  onDismiss: () => void;
}

export default function AthanAlert({ prayerKey, prayerTime, onDismiss }: AthanAlertProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (prayerKey) {
      setVisible(true);
    }
  }, [prayerKey]);

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

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b ${info.gradient}`}
          dir="rtl"
        >
          {/* Islamic pattern overlay */}
          <div className="absolute inset-0 islamic-pattern opacity-10" />

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-8 left-6 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all active:scale-95 z-10"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          {/* Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 20 }}
            className="flex flex-col items-center text-center px-8 relative z-10"
          >
            {/* Prayer icon */}
            <motion.span
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="text-7xl mb-6"
            >
              {info.icon}
            </motion.span>

            {/* Title */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/60 text-lg font-medium mb-2"
            >
              حان وقت الصلاة
            </motion.p>

            {/* Prayer name */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white text-5xl font-bold mb-4"
            >
              صلاة {info.name}
            </motion.h1>

            {/* Time */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-white/80 text-3xl font-light tabular-nums mb-8"
            >
              {prayerTime}
            </motion.p>

            {/* Audio indicator */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-3 border border-white/20 mb-10"
            >
              <Volume2 className="h-4 w-4 text-white/70 animate-pulse" />
              <span className="text-white/70 text-sm">جاري تشغيل الأذان...</span>
            </motion.div>

            {/* Decorative verse */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-white/30 text-sm font-arabic leading-relaxed max-w-xs"
            >
              حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَىٰ وَقُومُوا لِلَّهِ قَانِتِينَ
            </motion.p>
          </motion.div>

          {/* Dismiss button at bottom */}
          <motion.button
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={handleDismiss}
            className="absolute bottom-12 bg-white/15 backdrop-blur-sm border border-white/25 text-white font-semibold rounded-2xl px-10 py-4 text-base transition-all active:scale-95 z-10"
          >
            إغلاق
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
