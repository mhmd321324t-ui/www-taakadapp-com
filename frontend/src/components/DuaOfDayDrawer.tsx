import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { dailyDuas } from '@/data/dhikrDetails';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getTodayDua() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return dailyDuas[dayOfYear % dailyDuas.length];
}

export default function DuaOfDayDrawer({ open, onOpenChange }: Props) {
  const dua = getTodayDua();
  const [done, setDone] = useState(() => {
    const key = new Date().toISOString().split('T')[0];
    return localStorage.getItem(`dua-done-${key}`) === '1';
  });

  const markDone = () => {
    const key = new Date().toISOString().split('T')[0];
    localStorage.setItem(`dua-done-${key}`, '1');
    setDone(true);
    setTimeout(() => onOpenChange(false), 600);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="pb-8 max-h-[85vh]">
        <div className="flex flex-col items-center px-6 pt-4 pb-2 overflow-y-auto">
          <h3 className="text-lg font-bold text-foreground mb-1">{dua.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{dua.subtitle}</p>

          <div className="bg-muted/30 rounded-2xl p-5 mb-4 w-full">
            <p className="text-xl font-bold text-foreground text-center leading-[2.2] font-amiri" dir="rtl">
              {dua.arabic}
            </p>
          </div>

          <p className="text-sm text-muted-foreground text-center mb-2 italic">
            {dua.transliteration}
          </p>
          <p className="text-xs text-muted-foreground mb-6">{dua.reference}</p>

          <button
            onClick={markDone}
            className="relative active:scale-95 transition-transform"
          >
            <motion.div
              className={`h-16 w-16 rounded-full flex items-center justify-center ${done ? 'bg-primary' : 'bg-accent'}`}
              animate={done ? { scale: [1, 1.2, 1] } : {}}
            >
              <Check className={`h-8 w-8 ${done ? 'text-primary-foreground' : 'text-accent-foreground'}`} />
            </motion.div>
          </button>
          {!done && <p className="text-sm text-muted-foreground mt-2">اضغط لتحديد كمكتمل</p>}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
