import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Moon, Heart } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ramadanDeeds } from '@/data/ramadanDeeds';
import PageHeader from '@/components/PageHeader';

interface DayState {
  fasting: boolean;
  deed: boolean;
}

const currentYear = new Date().getFullYear();

export default function RamadanChallenge() {
  const { user } = useAuth();
  const storageKey = `ramadan-challenge-${currentYear}`;

  const [days, setDays] = useState<Record<number, DayState>>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : {};
  });

  // Sync from DB
  useEffect(() => {
    if (!user) return;
    supabase
      .from('ramadan_challenge')
      .select('day_number, fasting_completed, deed_completed')
      .eq('user_id', user.id)
      .eq('year', currentYear)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const dbDays: Record<number, DayState> = {};
          data.forEach((r: any) => {
            dbDays[r.day_number] = { fasting: r.fasting_completed, deed: r.deed_completed };
          });
          setDays(dbDays);
          localStorage.setItem(storageKey, JSON.stringify(dbDays));
        }
      });
  }, [user]);

  const toggle = async (day: number, type: 'fasting' | 'deed') => {
    const current = days[day] || { fasting: false, deed: false };
    const updated = { ...current, [type]: !current[type] };
    const newDays = { ...days, [day]: updated };
    setDays(newDays);
    localStorage.setItem(storageKey, JSON.stringify(newDays));

    if (user) {
      await supabase.from('ramadan_challenge').upsert({
        user_id: user.id,
        year: currentYear,
        day_number: day,
        fasting_completed: updated.fasting,
        deed_completed: updated.deed,
      } as any, { onConflict: 'user_id,year,day_number' });
    }
  };

  const fastingCount = Object.values(days).filter(d => d.fasting).length;
  const deedCount = Object.values(days).filter(d => d.deed).length;
  const totalDone = fastingCount + deedCount;

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="تحدي رمضان" backTo="/" />

      <div className="px-4 pt-4">
        {/* Progress card */}
        <div className="rounded-2xl bg-card border border-border/50 p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-foreground">{totalDone}/60 مكتمل</span>
            <span className="text-xs text-muted-foreground">{Math.round((totalDone / 60) * 100)}%</span>
          </div>
          <Progress value={(totalDone / 60) * 100} className="h-2.5 mb-3" />
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">صيام {fastingCount}/30</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-accent" />
              <span className="text-xs text-muted-foreground">أعمال {deedCount}/30</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="fasting" dir="rtl">
          <TabsList className="w-full mb-3">
            <TabsTrigger value="fasting" className="flex-1">صيام</TabsTrigger>
            <TabsTrigger value="deeds" className="flex-1">أعمال</TabsTrigger>
          </TabsList>

          <TabsContent value="fasting">
            <div className="space-y-2">
              {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                const done = days[day]?.fasting;
                return (
                  <motion.button
                    key={day}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: day * 0.02 }}
                    onClick={() => toggle(day, 'fasting')}
                    className={cn(
                      'w-full rounded-2xl bg-card border border-border/50 p-4 flex items-center gap-3 text-right',
                      done && 'border-primary/30 bg-primary/5'
                    )}
                  >
                    <div className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
                      done ? 'bg-primary' : 'bg-muted'
                    )}>
                      {done && <Check className="h-4 w-4 text-primary-foreground" />}
                    </div>
                    <div className="flex-1">
                      <p className={cn('text-sm font-bold', done && 'text-primary line-through')}>
                        اليوم {day}
                      </p>
                    </div>
                    <Moon className={cn('h-4 w-4', done ? 'text-primary' : 'text-muted-foreground')} />
                  </motion.button>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="deeds">
            <div className="space-y-2">
              {ramadanDeeds.map((deed, i) => {
                const day = i + 1;
                const done = days[day]?.deed;
                return (
                  <motion.button
                    key={day}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: day * 0.02 }}
                    onClick={() => toggle(day, 'deed')}
                    className={cn(
                      'w-full rounded-2xl bg-card border border-border/50 p-4 flex items-center gap-3 text-right',
                      done && 'border-accent/30 bg-accent/5'
                    )}
                  >
                    <div className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
                      done ? 'bg-accent' : 'bg-muted'
                    )}>
                      {done && <Check className="h-4 w-4 text-accent-foreground" />}
                    </div>
                    <div className="flex-1">
                      <p className={cn('text-sm font-bold', done && 'text-accent line-through')}>
                        يوم {day}: {deed}
                      </p>
                    </div>
                    <Heart className={cn('h-4 w-4', done ? 'text-accent' : 'text-muted-foreground')} />
                  </motion.button>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
