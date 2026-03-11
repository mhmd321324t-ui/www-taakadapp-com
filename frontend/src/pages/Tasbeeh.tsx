import { useState, useEffect } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { useAuth } from '@/hooks/useAuth';
import { RotateCcw, LogIn, Sparkles, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import SectionHeader from '@/components/SectionHeader';

const dhikrOptions = [
  { key: 'subhanAllah', arabic: 'سُبْحَانَ اللّهِ', target: 33, emoji: '📿' },
  { key: 'alhamdulillah', arabic: 'الْحَمْدُ لِلّهِ', target: 33, emoji: '🤲' },
  { key: 'allahuAkbar', arabic: 'اللّهُ أَكْبَرُ', target: 34, emoji: '🕌' },
  { key: 'istighfar', arabic: 'أَسْتَغْفِرُ اللّهَ', target: 100, emoji: '💚' },
];

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

export default function Tasbeeh() {
  const { t } = useLocale();
  const { user } = useAuth();
  const [selected, setSelected] = useState(0);
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showComplete, setShowComplete] = useState(false);

  const dhikr = dhikrOptions[selected];
  const today = getTodayKey();
  const TASBEEH_LOCAL_KEY = `tasbeeh-${dhikr.key}-${today}`;
  const TASBEEH_TOTAL_KEY = `tasbeeh-total-${dhikr.key}`;

  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem(TASBEEH_LOCAL_KEY) || '0');
    const savedTotal = parseInt(localStorage.getItem(TASBEEH_TOTAL_KEY) || '0');
    setCount(savedCount);
    setTotal(savedTotal);
    setLoading(false);
  }, [selected, TASBEEH_LOCAL_KEY, TASBEEH_TOTAL_KEY]);

  const loadFromDB = async () => {
    // Uses localStorage for now
    setLoading(false);
  };

  const handleTap = async () => {
    const newCount = count + 1;
    const newTotal = total + 1;
    setCount(newCount);
    setTotal(newTotal);

    if (navigator.vibrate) navigator.vibrate(30);

    if (newCount === dhikr.target) {
      setShowComplete(true);
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
      setTimeout(() => setShowComplete(false), 2000);
    }

    // Always save to localStorage
    localStorage.setItem(TASBEEH_LOCAL_KEY, String(newCount));
    localStorage.setItem(TASBEEH_TOTAL_KEY, String(newTotal));
  };

  const handleReset = async () => {
    setCount(0);
    localStorage.setItem(TASBEEH_LOCAL_KEY, '0');
  };

  const handleSelectDhikr = (i: number) => {
    setSelected(i);
    setCount(0);
  };

  const progress = Math.min((count / dhikr.target) * 100, 100);
  const circumference = 2 * Math.PI * 92;
  const isComplete = count >= dhikr.target;

  return (
    <div className="min-h-screen pb-24" dir="rtl">
      <PageHeader
        title={t('tasbeeh')}
        subtitle="اذكر الله وسبّحه"
        image="https://images.unsplash.com/photo-1762894110127-87fee1d11a57?w=1200&q=85"
        actionsLeft={
          <button
            onClick={handleReset}
            className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 transition-all active:scale-95"
            aria-label="إعادة تعيين العداد"
          >
            <RotateCcw className="h-4 w-4 text-white" />
          </button>
        }
      />

      <div className="px-4 -mt-8 relative z-10">
        {!user && (
          <Link
            to="/auth"
            className="mb-5 flex items-center justify-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed transition-all active:scale-[0.98]"
          >
            <span className="font-medium text-primary">{t('loginPrompt')}</span>
            <LogIn className="h-4 w-4 text-primary" />
          </Link>
        )}

        {/* Dhikr selector cards */}
        <div className="mb-6">
          <SectionHeader icon={Heart} title="اختر الذكر" subtitle="اختر من الأذكار المأثورة" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {dhikrOptions.map((opt, i) => (
              <motion.button
                key={opt.key}
                onClick={() => handleSelectDhikr(i)}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  'min-h-[88px] rounded-2xl border p-4 text-center transition-all',
                  'flex flex-col items-center justify-center gap-2',
                  selected === i
                    ? 'border-primary bg-primary text-primary-foreground shadow-lg glow-emerald'
                    : 'border-border/50 bg-card text-foreground hover:border-primary/30'
                )}
              >
                <span className="shrink-0 text-xl" aria-hidden="true">{opt.emoji}</span>
                <span className="w-full text-xs font-semibold leading-relaxed break-words">
                  {t(opt.key)}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Main counter area */}
        <div className="flex flex-col items-center">
          {/* Arabic text card */}
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 w-full max-w-md rounded-3xl border border-border/50 bg-card p-5 text-center shadow-elevated"
          >
            <p className="text-3xl font-arabic text-foreground leading-[2] break-words sm:text-4xl">
              {dhikr.arabic}
            </p>
          </motion.div>

          {/* Circular counter */}
          <div className="relative mb-8">
            <AnimatePresence>
              {showComplete && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1.05, opacity: 1 }}
                  exit={{ scale: 1.1, opacity: 0 }}
                  className="absolute inset-0 rounded-full border-4 border-primary/40"
                  style={{ filter: 'blur(8px)' }}
                />
              )}
            </AnimatePresence>

            <svg className="h-64 w-64 -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="92" fill="none" className="stroke-muted" strokeWidth="5" />
              <circle cx="100" cy="100" r="82" fill="none" className="stroke-muted/30" strokeWidth="1" />
              <motion.circle
                cx="100"
                cy="100"
                r="92"
                fill="none"
                className={cn('transition-colors duration-500', isComplete ? 'stroke-accent' : 'stroke-primary')}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={false}
                animate={{ strokeDashoffset: circumference * (1 - progress / 100) }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={isComplete ? {} : { filter: 'drop-shadow(0 0 6px hsl(var(--primary) / 0.3))' }}
              />
              {count > 0 && (
                <circle
                  cx={100 + 92 * Math.cos((progress / 100) * 2 * Math.PI - Math.PI / 2)}
                  cy={100 + 92 * Math.sin((progress / 100) * 2 * Math.PI - Math.PI / 2)}
                  r="4"
                  className={cn(isComplete ? 'fill-accent' : 'fill-primary')}
                />
              )}
            </svg>

            <motion.button
              className="absolute inset-0 flex flex-col items-center justify-center rounded-full transition-colors active:bg-primary/5"
              onClick={handleTap}
              whileTap={{ scale: 0.97 }}
            >
              <AnimatePresence mode="popLayout">
                {showComplete ? (
                  <motion.div
                    key="complete"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    className="flex flex-col items-center gap-1"
                  >
                    <Sparkles className="h-10 w-10 text-accent" />
                    <span className="text-sm font-bold text-accent">{t('completed')}!</span>
                  </motion.div>
                ) : (
                  <motion.div key="counter" className="flex flex-col items-center">
                    <motion.span
                      key={count}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="tabular-nums text-6xl font-bold text-foreground"
                    >
                      {count}
                    </motion.span>
                    <span className="mt-1 text-sm text-muted-foreground">/ {dhikr.target}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Stats row */}
          <div className="grid w-full max-w-sm grid-cols-2 gap-3 mb-6">
            <div className="rounded-3xl border border-border/50 bg-card p-5 text-center shadow-elevated">
              <p className="mb-1 text-xs text-muted-foreground">{t('today')}</p>
              <p className="tabular-nums text-2xl font-bold text-foreground">{count}</p>
            </div>
            <div className="rounded-3xl border border-border/50 bg-card p-5 text-center shadow-elevated">
              <p className="mb-1 text-xs text-muted-foreground">{t('total')}</p>
              <p className="tabular-nums text-2xl font-bold text-foreground">{total.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}