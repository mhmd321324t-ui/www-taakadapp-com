import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Check, BookOpen, HandHeart, Moon, Sunrise } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SuggestedGoal {
  key: string;
  label: string;
  icon: React.ReactNode;
}

const suggestions: SuggestedGoal[] = [
  { key: 'surah_mulk', label: 'قراءة سورة الملك قبل النوم', icon: <BookOpen className="h-4 w-4" /> },
  { key: 'nafilah', label: 'أداء صلاة نافلة', icon: <Sunrise className="h-4 w-4" /> },
  { key: 'sadaqah', label: 'إعطاء صدقة', icon: <HandHeart className="h-4 w-4" /> },
  { key: 'monday_fast', label: 'صيام يوم الاثنين أو الخميس', icon: <Moon className="h-4 w-4" /> },
  { key: 'surah_kahf', label: 'اقرأ سورة الكهف يوم الجمعة', icon: <BookOpen className="h-4 w-4" /> },
];

export default function SuggestedGoals() {
  const [added, setAdded] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('suggested-goals-added');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const toggleGoal = (key: string) => {
    const updated = new Set(added);
    if (updated.has(key)) {
      updated.delete(key);
    } else {
      updated.add(key);
      toast.success('تمت إضافة الهدف!');
    }
    setAdded(updated);
    localStorage.setItem('suggested-goals-added', JSON.stringify([...updated]));
  };

  return (
    <div className="px-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">🎯</span>
        <h3 className="text-sm font-bold text-foreground">الأهداف المقترحة</h3>
      </div>
      <div className="space-y-2">
        {suggestions.map((goal, i) => {
          const isAdded = added.has(goal.key);
          return (
            <motion.button
              key={goal.key}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => toggleGoal(goal.key)}
              className={cn(
                'w-full rounded-2xl border p-3 flex items-center gap-3 transition-all active:scale-[0.98]',
                isAdded
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-border/40 bg-card'
              )}
            >
              <div className={cn(
                'h-9 w-9 rounded-xl flex items-center justify-center shrink-0',
                isAdded ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
              )}>
                {goal.icon}
              </div>
              <span className={cn(
                'text-sm font-medium flex-1 text-right',
                isAdded ? 'text-primary' : 'text-foreground'
              )}>
                {goal.label}
              </span>
              <div className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-colors',
                isAdded ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}>
                {isAdded ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
