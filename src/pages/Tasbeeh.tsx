import { useState, useEffect } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { RotateCcw, LogIn, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

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

  useEffect(() => {
    if (user) {
      loadFromDB();
    } else {
      const saved = localStorage.getItem('tasbeeh-total');
      setTotal(saved ? parseInt(saved) : 0);
      setCount(0);
      setLoading(false);
    }
  }, [user, selected]);

  const loadFromDB = async () => {
    if (!user) return;
    setLoading(true);
    const { data: todayData } = await supabase
      .from('tasbeeh_counts')
      .select('count, total')
      .eq('user_id', user.id)
      .eq('dhikr_key', dhikr.key)
      .eq('date', today)
      .maybeSingle();

    const { data: totalData } = await supabase
      .from('tasbeeh_counts')
      .select('total')
      .eq('user_id', user.id)
      .eq('dhikr_key', dhikr.key);

    const overallTotal = totalData?.reduce((sum, row) => sum + (row.total || 0), 0) || 0;
    setCount(todayData?.count || 0);
    setTotal(overallTotal);
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

    if (user) {
      await supabase
        .from('tasbeeh_counts')
        .upsert(
          { user_id: user.id, dhikr_key: dhikr.key, date: today, count: newCount, total: newCount },
          { onConflict: 'user_id,dhikr_key,date' }
        );
    } else {
      localStorage.setItem('tasbeeh-total', String(newTotal));
    }
  };

  const handleReset = async () => {
    setCount(0);
    if (user) {
      await supabase
        .from('tasbeeh_counts')
        .upsert(
          { user_id: user.id, dhikr_key: dhikr.key, date: today, count: 0, total: 0 },
          { onConflict: 'user_id,dhikr_key,date' }
        );
    }
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
      {/* Header */}
      <div className="gradient-islamic relative px-4 pb-20 pt-safe-header">
        <div className="absolute inset-0 islamic-pattern opacity-20" />
        <div className="relative z-10 flex items-center justify-between gap-3">
          <button
            onClick={handleReset}
            className="glass-card rounded-2xl p-2.5 transition-transform active:scale-90"
            aria-label="إعادة تعيين العداد"
          >
            <RotateCcw className="h-5 w-5 text-white/85" />
          </button>
          <h1 className="text-2xl font-bold text-white leading-relaxed">{t('tasbeeh')}</h1>
          <div className="w-10" />
        </div>
        <div className="absolute -bottom-6 left-0 right-0 h-12 rounded-t-[2rem] bg-background" />
      </div>

      <div className="px-4 -mt-2">
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
        <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
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

        {/* Main counter area */}
        <div className="flex flex-col items-center">
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 w-full max-w-md rounded-2xl border border-border/50 bg-card p-4 text-center shadow-elevated"
          >
            <p className="text-4xl font-arabic text-foreground leading-[1.9] break-words sm:text-5xl">
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
          <div className="grid w-full max-w-sm grid-cols-2 gap-3">
            <div className="rounded-3xl border border-border/50 bg-card p-5 text-center shadow-elevated">
              <p className="mb-1 text-xs text-muted-foreground">{t('today')}</p>
              <p className="tabular-nums text-2xl font-bold text-foreground">{count}</p>
            </div>
            <div className="rounded-3xl border border-border/50 bg-card p-5 text-center shadow-elevated">
              <p className="mb-1 text-xs text-muted-foreground">{t('total')}</p>
              <p className="tabular-nums text-2xl font-bold text-foreground">{total.toLocaleString()}</p>
            </div>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            {t('tasbeeh')} — {t('count')}
          </p>
        </div>
      </div>
    </div>
  );
}
