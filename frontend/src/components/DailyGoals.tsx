import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Moon, BookOpen, MessageSquare, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { isRamadan } from '@/data/islamicOccasions';
import { dhikrDetails } from '@/data/dhikrDetails';
import DhikrCounterDrawer from '@/components/DhikrCounterDrawer';

interface Goal {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  target: number;
  category: 'prayer' | 'dhikr' | 'quran' | 'general';
  hasDhikrDrawer?: boolean;
}

const defaultGoals: Goal[] = [
  {
    key: 'fasting',
    label: 'صيام رمضان',
    description: 'اليوم من رمضان',
    icon: <Moon className="h-4 w-4" />,
    color: 'text-primary',
    bgColor: 'bg-primary/15',
    target: 1,
    category: 'general',
  },
  {
    key: 'strengthen_faith',
    label: 'قوّي إيمانك',
    description: 'سبحان الله وبحمده',
    icon: <RefreshCw className="h-4 w-4" />,
    color: 'text-accent',
    bgColor: 'bg-accent/15',
    target: 7,
    category: 'dhikr',
    hasDhikrDrawer: true,
  },
  {
    key: 'quran_reward',
    label: 'ثواب ثلث القرآن',
    description: 'قل هو الله أحد',
    icon: <BookOpen className="h-4 w-4" />,
    color: 'text-islamic-purple',
    bgColor: 'bg-islamic-purple/15',
    target: 3,
    category: 'quran',
    hasDhikrDrawer: true,
  },
  {
    key: 'repentance',
    label: 'للتوبة والمغفرة',
    description: 'أستغفر الله العظيم',
    icon: <RefreshCw className="h-4 w-4" />,
    color: 'text-primary',
    bgColor: 'bg-primary/15',
    target: 11,
    category: 'dhikr',
    hasDhikrDrawer: true,
  },
  {
    key: 'listen_quran',
    label: 'استمع إلى القرآن',
    description: '15 دقيقة على الأقل',
    icon: <BookOpen className="h-4 w-4" />,
    color: 'text-islamic-purple',
    bgColor: 'bg-islamic-purple/15',
    target: 1,
    category: 'quran',
  },
  {
    key: 'share_islam',
    label: 'حدّث شخصًا عن الإسلام',
    description: 'انشر الخير',
    icon: <MessageSquare className="h-4 w-4" />,
    color: 'text-islamic-teal',
    bgColor: 'bg-islamic-teal/15',
    target: 1,
    category: 'general',
  },
];

interface GoalProgress {
  [key: string]: { progress: number; completed: boolean };
}

export default function DailyGoals({ hijriMonthNumber }: { hijriMonthNumber: number | null }) {
  const { user } = useAuth();
  const todayKey = new Date().toISOString().split('T')[0];
  const ramadan = isRamadan(hijriMonthNumber);

  const [goals, setGoals] = useState<GoalProgress>(() => {
    const saved = localStorage.getItem(`daily-goals-${todayKey}`);
    return saved ? JSON.parse(saved) : {};
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeDhikrKey, setActiveDhikrKey] = useState<string | null>(null);

  const activeDhikr = activeDhikrKey ? dhikrDetails.find(d => d.key === activeDhikrKey) || null : null;

  useEffect(() => {
    // Always use localStorage for goals (cloud sync can be added later)
    return;
  }, [user, todayKey]);

  const updateGoal = async (goalKey: string, target: number) => {
    const current = goals[goalKey] || { progress: 0, completed: false };
    const newProgress = current.completed ? 0 : Math.min(current.progress + 1, target);
    const newCompleted = newProgress >= target;

    const updated = {
      ...goals,
      [goalKey]: { progress: newCompleted ? target : newProgress, completed: newCompleted },
    };
    setGoals(updated);
    localStorage.setItem(`daily-goals-${todayKey}`, JSON.stringify(updated));
  };

  const completeFromDrawer = async (goalKey: string, target: number) => {
    const updated = {
      ...goals,
      [goalKey]: { progress: target, completed: true },
    };
    setGoals(updated);
    localStorage.setItem(`daily-goals-${todayKey}`, JSON.stringify(updated));
  };

  const resetGoal = async (goalKey: string) => {
    const updated = { ...goals, [goalKey]: { progress: 0, completed: false } };
    setGoals(updated);
    localStorage.setItem(`daily-goals-${todayKey}`, JSON.stringify(updated));
  };

  const handleGoalClick = (goal: Goal) => {
    const state = goals[goal.key] || { progress: 0, completed: false };
    if (state.completed) {
      resetGoal(goal.key);
      return;
    }
    if (goal.hasDhikrDrawer) {
      setActiveDhikrKey(goal.key);
      setDrawerOpen(true);
    } else {
      updateGoal(goal.key, goal.target);
    }
  };

  const visibleGoals = ramadan ? defaultGoals : defaultGoals.filter(g => g.key !== 'fasting');
  const completedCount = Object.values(goals).filter(g => g.completed).length;

  return (
    <div className="px-4 mb-4">
      <DhikrCounterDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        dhikr={activeDhikr}
        currentProgress={activeDhikrKey ? (goals[activeDhikrKey]?.progress || 0) : 0}
        onComplete={completeFromDrawer}
      />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">✨</span>
          <h3 className="text-sm font-bold text-foreground">الأهداف اليومية</h3>
        </div>
        <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
          {completedCount}/{visibleGoals.length} مكتمل
        </span>
      </div>

      <div className="space-y-2">
        {visibleGoals.map((goal, i) => {
          const state = goals[goal.key] || { progress: 0, completed: false };
          const progressPercent = goal.target > 1 ? (state.progress / goal.target) : (state.completed ? 1 : 0);

          return (
            <motion.div
              key={goal.key}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn(
                'rounded-2xl bg-card border p-3.5 flex items-center gap-3 transition-all cursor-pointer active:scale-[0.98]',
                state.completed
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-border/40'
              )}
              onClick={() => handleGoalClick(goal)}
            >
              {/* Icon */}
              <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0', goal.bgColor)}>
                <span className={goal.color}>{goal.icon}</span>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm font-bold leading-tight',
                  state.completed ? 'text-primary line-through' : 'text-foreground'
                )}>
                  {goal.label}
                </p>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">{goal.description}</p>
              </div>

              {/* Progress circle */}
              <div className="relative shrink-0">
                <div className={cn(
                  'h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all',
                  state.completed
                    ? 'border-primary bg-primary'
                    : 'border-border/60 bg-transparent'
                )}>
                  {state.completed ? (
                    <Check className="h-4 w-4 text-primary-foreground" />
                  ) : goal.target > 1 ? (
                    <span className="text-[10px] font-bold text-muted-foreground tabular-nums">
                      {state.progress}/{goal.target}
                    </span>
                  ) : null}
                </div>
                {/* Progress ring for multi-count goals */}
                {!state.completed && goal.target > 1 && progressPercent > 0 && (
                  <svg className="absolute inset-0" width="40" height="40" viewBox="0 0 40 40">
                    <circle
                      cx="20" cy="20" r="18"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 18}
                      strokeDashoffset={2 * Math.PI * 18 * (1 - progressPercent)}
                      transform="rotate(-90 20 20)"
                      className="transition-all duration-500"
                    />
                  </svg>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
