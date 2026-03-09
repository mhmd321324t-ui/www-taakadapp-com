import { useState, useEffect, useCallback } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, Flame, LogIn, ListChecks } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import SectionHeader from '@/components/SectionHeader';

const prayerKeys = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

export default function PrayerTracker() {
  const { t } = useLocale();
  const { user } = useAuth();
  const todayKey = getTodayKey();

  const [todayPrayers, setTodayPrayers] = useState<string[]>([]);
  const [allTracking, setAllTracking] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFromDB();
    } else {
      const saved = localStorage.getItem('prayer-tracker');
      const parsed = saved ? JSON.parse(saved) : {};
      setAllTracking(parsed);
      setTodayPrayers(parsed[todayKey] || []);
      setLoading(false);
    }
  }, [user, todayKey]);

  const loadFromDB = async () => {
    if (!user) return;
    setLoading(true);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data } = await supabase
      .from('prayer_tracking')
      .select('date, prayers_completed')
      .eq('user_id', user.id)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false });

    const trackingMap: Record<string, string[]> = {};
    data?.forEach(row => {
      trackingMap[row.date] = row.prayers_completed || [];
    });

    setAllTracking(trackingMap);
    setTodayPrayers(trackingMap[todayKey] || []);
    setLoading(false);
  };

  const togglePrayer = async (key: string) => {
    const updated = todayPrayers.includes(key)
      ? todayPrayers.filter(k => k !== key)
      : [...todayPrayers, key];

    setTodayPrayers(updated);
    setAllTracking(prev => ({ ...prev, [todayKey]: updated }));

    if (user) {
      await supabase
        .from('prayer_tracking')
        .upsert(
          { user_id: user.id, date: todayKey, prayers_completed: updated },
          { onConflict: 'user_id,date' }
        );
    } else {
      const saved = JSON.parse(localStorage.getItem('prayer-tracker') || '{}');
      saved[todayKey] = updated;
      localStorage.setItem('prayer-tracker', JSON.stringify(saved));
    }
  };

  const streak = (() => {
    let count = 0;
    const d = new Date();
    d.setDate(d.getDate() - 1);
    while (true) {
      const key = d.toISOString().split('T')[0];
      if (allTracking[key]?.length === 5) {
        count++;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    if (todayPrayers.length === 5) count++;
    return count;
  })();

  const progress = (todayPrayers.length / 5) * 100;

  return (
    <div className="min-h-screen pb-24" dir="rtl">
      <PageHeader title={t('tracker')} subtitle="تابع صلواتك اليومية" image="https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800&q=80" />

      <div className="px-5 -mt-8 relative z-10">
        {!user && (
          <Link
            to="/auth"
            className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-3 mb-4 text-sm transition-all active:scale-[0.98]"
          >
            <LogIn className="h-4 w-4 text-primary" />
            <span className="text-primary">{t('loginToSaveProgress')}</span>
          </Link>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-3xl border border-border/50 bg-card p-5 text-center shadow-elevated">
            <p className="text-xs text-muted-foreground mb-2">{t('completed')}</p>
            <p className="text-3xl font-bold text-primary">{todayPrayers.length}/5</p>
          </div>
          <div className="rounded-3xl border border-border/50 bg-card p-5 text-center shadow-elevated">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <Flame className="h-3.5 w-3.5 text-accent" />
              <p className="text-xs text-muted-foreground">{t('streak')}</p>
            </div>
            <p className="text-3xl font-bold text-accent">{streak} <span className="text-sm font-normal text-muted-foreground">{t('days')}</span></p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-elevated mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
            <p className="text-sm font-bold text-foreground">تقدم اليوم</p>
          </div>
          <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              style={{ boxShadow: '0 0 8px hsl(var(--primary) / 0.4)' }}
            />
          </div>
        </div>

        {/* Prayer checklist */}
        <SectionHeader icon={ListChecks} title="صلوات اليوم" />
        <div className="rounded-3xl border border-border/50 bg-card shadow-elevated overflow-hidden divide-y divide-border/50">
          {prayerKeys.map((key, i) => {
            const done = todayPrayers.includes(key);
            return (
              <motion.button
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => togglePrayer(key)}
                className={cn(
                  'w-full flex items-center justify-between p-5 transition-all',
                  done && 'bg-primary/5'
                )}
              >
                <div className={cn(
                  'h-7 w-7 rounded-full flex items-center justify-center transition-all',
                  done ? 'bg-primary' : 'border-2 border-muted-foreground/30'
                )}>
                  {done && <Check className="h-4 w-4 text-primary-foreground" />}
                </div>
                <span className={cn('font-semibold text-base', done ? 'text-primary' : 'text-foreground')}>
                  {t(key)}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
