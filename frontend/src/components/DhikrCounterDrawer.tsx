import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import type { DhikrDetail } from '@/data/dhikrDetails';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dhikr: DhikrDetail | null;
  currentProgress: number;
  onComplete: (key: string, target: number) => void;
}

export default function DhikrCounterDrawer({ open, onOpenChange, dhikr, currentProgress, onComplete }: Props) {
  const [count, setCount] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (open && dhikr) {
      setCount(currentProgress);
      setCompleted(currentProgress >= dhikr.target);
    }
  }, [open, dhikr, currentProgress]);

  if (!dhikr) return null;

  const target = dhikr.target;
  const progress = count / target;
  const circleR = 60;
  const circleC = 2 * Math.PI * circleR;
  const offset = circleC * (1 - progress);

  const handleTap = () => {
    if (completed) return;
    const next = count + 1;
    setCount(next);
    if (next >= target) {
      setCompleted(true);
      onComplete(dhikr.key, target);
      setTimeout(() => onOpenChange(false), 800);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="pb-8">
        <div className="flex flex-col items-center px-6 pt-4 pb-2">
          {/* Title */}
          <h3 className="text-lg font-bold text-foreground mb-1">{dhikr.title}</h3>
          
          {/* Arabic text */}
          <p className="text-xl font-bold text-foreground text-center leading-loose mb-2 font-amiri" dir="rtl">
            {dhikr.arabic}
          </p>
          
          {/* Transliteration */}
          <p className="text-sm text-muted-foreground text-center mb-6 italic">
            {dhikr.transliteration}
          </p>

          {/* Counter circle */}
          <button
            onClick={handleTap}
            className="relative mb-4 active:scale-95 transition-transform"
          >
            <svg width="150" height="150" viewBox="0 0 150 150">
              <circle
                cx="75" cy="75" r={circleR}
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="6"
              />
              <circle
                cx="75" cy="75" r={circleR}
                fill="none"
                stroke={completed ? 'hsl(var(--primary))' : 'hsl(var(--accent))'}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circleC}
                strokeDashoffset={offset}
                transform="rotate(-90 75 75)"
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {completed ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-16 w-16 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Check className="h-8 w-8 text-primary-foreground" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="count"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-3xl font-bold text-foreground tabular-nums">{count}</span>
                    <span className="text-xs text-muted-foreground">/{target}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </button>

          {!completed && (
            <p className="text-sm text-muted-foreground">اضغط للعد</p>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
