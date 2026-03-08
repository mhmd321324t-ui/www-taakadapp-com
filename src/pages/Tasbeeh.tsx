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
      <div className="gradient-islamic relative px-5 pb-24 pt-16">
        <div className="absolute inset-0 islamic-pattern opacity-20" />
        <div className="flex items-center justify-between relative z-10">
          <button
            onClick={handleReset}
            className="glass-card rounded-2xl p-2.5 transition-transform active:scale-90"
          >
            <RotateCcw className="h-5 w-5 text-white/80" />
          </button>
          <h1 className="text-xl font-bold text-white">{t('tasbeeh')}</h1>
        </div>
        <div className="absolute -bottom-6 left-0 right-0 h-12 rounded-t-[2rem] bg-background" />
      </div>

      <div className="px-5 -mt-2">
        {!user && (
          <Link
            to="/auth"
            className="flex items-center justify-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-3 mb-5 text-sm transition-all active:scale-[0.98]"
          >
            <span className="text-primary font-medium">{t('loginPrompt')}</span>
            <LogIn className="h-4 w-4 text-primary" />
          </Link>
        )}

        {/* Dhikr selector cards */}
        <div className="grid grid-cols-4 gap-2 mb-8">
          {dhikrOptions.map((opt, i) => (
            <motion.button
              key={opt.key}
              onClick={() => handleSelectDhikr(i)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-2xl p-3 transition-all border min-w-0',
                selected === i
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg glow-emerald'
                  : 'bg-card text-foreground border-border/50 hover:border-primary/30'
              )}
            >
              <span className="text-xl shrink-0">{opt.emoji}</span>
              <span className="text-[10px] font-medium leading-tight text-center w-full break-words">
                {t(opt.key)}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Main counter area */}
        <div className="flex flex-col items-center">
          <motion.p
            key={selected}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-arabic text-foreground mb-6"
          >
            {dhikr.arabic}
          </motion.p>

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

            <svg className="w-64 h-64 -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100" cy="100" r="92"
                fill="none"
                className="stroke-muted"
                strokeWidth="5"
              />
              <circle
                cx="100" cy="100" r="82"
                fill="none"
                className="stroke-muted/30"
                strokeWidth="1"
              />
              <motion.circle
                cx="100" cy="100" r="92"
                fill="none"
                className={cn(
                  'transition-colors duration-500',
                  isComplete ? 'stroke-accent' : 'stroke-primary'
                )}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={false}
                animate={{
                  strokeDashoffset: circumference * (1 - progress / 100),
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={isComplete ? {} : { filter: 'drop-shadow(0 0 6px hsl(var(--primary) / 0.3))' }}
              />
              {count > 0 && (
                <circle
                  cx={100 + 92 * Math.cos((progress / 100) * 2 * Math.PI - Math.PI / 2)}
                  cy={100 + 92 * Math.sin((progress / 100) * 2 * Math.PI - Math.PI / 2)}
                  r="4"
                  className={cn(
                    isComplete ? 'fill-accent' : 'fill-primary'
                  )}
                />
              )}
            </svg>

            <motion.button
              className="absolute inset-0 flex flex-col items-center justify-center rounded-full active:bg-primary/5 transition-colors"
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
                    <span className="text-sm font-bold text-accent">
                      {t('completed')}!
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="counter"
                    className="flex flex-col items-center"
                  >
                    <motion.span
                      key={count}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="text-6xl font-bold text-foreground tabular-nums"
                    >
                      {count}
                    </motion.span>
                    <span className="text-sm text-muted-foreground mt-1">/ {dhikr.target}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            <div className="rounded-3xl border border-border/50 bg-card p-4 text-center shadow-elevated">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                {t('today')}
              </p>
              <p className="text-2xl font-bold text-foreground tabular-nums">{count}</p>
            </div>
            <div className="rounded-3xl border border-border/50 bg-card p-4 text-center shadow-elevated">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                {t('total')}
              </p>
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {total.toLocaleString()}
              </p>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground mt-6">{t('tasbeeh')} — {t('count')}</p>
        </div>
      </div>
    </div>
  );
}
