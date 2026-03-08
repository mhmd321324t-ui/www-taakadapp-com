import { useState, useEffect } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { RotateCcw, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const dhikrOptions = [
  { key: 'subhanAllah', arabic: 'سُبْحَانَ اللّهِ', target: 33 },
  { key: 'alhamdulillah', arabic: 'الْحَمْدُ لِلّهِ', target: 33 },
  { key: 'allahuAkbar', arabic: 'اللّهُ أَكْبَرُ', target: 34 },
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

  const dhikr = dhikrOptions[selected];
  const today = getTodayKey();

  // Load data
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

    // Get today's count for selected dhikr
    const { data: todayData } = await supabase
      .from('tasbeeh_counts')
      .select('count, total')
      .eq('user_id', user.id)
      .eq('dhikr_key', dhikr.key)
      .eq('date', today)
      .maybeSingle();

    // Get overall total
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

  return (
    <div className="min-h-screen">
      <div className="gradient-islamic px-5 pb-6 pt-12">
        <h1 className="text-2xl font-bold text-primary-foreground">{t('tasbeeh')}</h1>
        <div className="absolute -bottom-6 left-0 right-0 h-12 rounded-t-[50%] bg-background" />
      </div>

      <div className="px-5 pt-4">
        {!user && (
          <Link
            to="/auth"
            className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3 mb-4 text-sm"
          >
            <LogIn className="h-4 w-4 text-primary" />
            <span className="text-primary">{t('loginPrompt')}</span>
          </Link>
        )}

        {/* Dhikr selector */}
        <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide">
          {dhikrOptions.map((opt, i) => (
            <button
              key={opt.key}
              onClick={() => handleSelectDhikr(i)}
              className={cn(
                'whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all',
                selected === i
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              )}
            >
              {t(opt.key)}
            </button>
          ))}
        </div>

        {/* Counter */}
        <div className="flex flex-col items-center">
          <p className="text-3xl font-arabic text-foreground mb-8">{dhikr.arabic}</p>

          {/* Circular counter */}
          <div className="relative mb-6">
            <svg className="w-56 h-56 -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="90" fill="none" className="stroke-muted" strokeWidth="6" />
              <circle
                cx="100" cy="100" r="90" fill="none"
                className="stroke-primary transition-all duration-300"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
              />
            </svg>
            <motion.button
              className="absolute inset-0 flex flex-col items-center justify-center"
              onClick={handleTap}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={count}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="text-5xl font-bold text-foreground"
                >
                  {count}
                </motion.span>
              </AnimatePresence>
              <span className="text-sm text-muted-foreground">/ {dhikr.target}</span>
            </motion.button>
          </div>

          {/* Reset */}
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-2 mb-6">
            <RotateCcw className="h-4 w-4" />
            {t('reset')}
          </Button>

          {/* Total */}
          <div className="rounded-xl border border-border bg-card p-4 text-center w-full max-w-xs">
            <p className="text-xs text-muted-foreground">{t('total')}</p>
            <p className="text-2xl font-bold text-foreground">{total.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
