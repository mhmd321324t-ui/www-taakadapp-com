import { useState } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Search, Bookmark, ChevronDown, Moon, Bed, Droplets, Home, Shirt, Plane, UtensilsCrossed } from 'lucide-react';

// Categories like Athan app
const dailyCategories = [
  { icon: Bed, label: 'النوم', key: 'sleep' },
  { icon: Droplets, label: 'الوضوء', key: 'wudu' },
  { icon: Home, label: 'مسجد', key: 'mosque' },
  { icon: Moon, label: 'صلاة', key: 'salah' },
  { icon: Home, label: 'منزل', key: 'home' },
  { icon: Shirt, label: 'ملابس', key: 'clothes' },
  { icon: Plane, label: 'سفر', key: 'travel' },
  { icon: UtensilsCrossed, label: 'طعام', key: 'food' },
];

const adhkarCategories = [
  { icon: '📿', label: 'الذكر اليومي', key: 'daily-dhikr' },
  { icon: '🌙', label: 'إحياء الذكرى اليومي', key: 'daily-revival' },
  { icon: '🤲', label: 'بعد الصلوات', key: 'after-prayer' },
  { icon: '🍎', label: 'رزق', key: 'rizq' },
  { icon: '📖', label: 'معرفة', key: 'knowledge' },
  { icon: '🕌', label: 'الإيمان', key: 'faith' },
  { icon: '⚖️', label: 'يوم الحساب', key: 'judgment' },
  { icon: '💚', label: 'مغفرة', key: 'forgiveness' },
  { icon: '🤲', label: 'مشيداً بالله', key: 'praising' },
];

// Sample duas for expanded sections
const sampleDuas: Record<string, Array<{ arabic: string; translation: string; count: number }>> = {
  sleep: [
    { arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', translation: 'In Your name, O Allah, I die and I live.', count: 1 },
    { arabic: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ', translation: 'O Allah, protect me from Your punishment on the Day You resurrect Your servants.', count: 3 },
  ],
  'daily-dhikr': [
    { arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', translation: 'Glory be to Allah and praise Him.', count: 100 },
    { arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', translation: 'None has the right to be worshipped except Allah alone.', count: 10 },
  ],
};

export default function Duas() {
  const { t } = useLocale();
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const toggle = (key: string) => {
    setExpandedKey(expandedKey === key ? null : key);
  };

  return (
    <div className="min-h-screen pb-safe" dir="rtl">
      {/* Header */}
      <div className="px-5 pt-12 pb-3 flex items-center justify-between">
        <div className="flex gap-3">
          <button className="p-1"><Search className="h-5 w-5 text-muted-foreground" /></button>
          <button className="p-1"><Bookmark className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <h1 className="text-xl font-bold text-foreground">الدُعاء والذكر</h1>
      </div>

      {/* Daily section */}
      <div className="px-5 mb-2">
        <p className="text-sm font-bold text-foreground mb-3">يومي</p>
      </div>
      <div className="px-5 space-y-0">
        {dailyCategories.map((cat, i) => (
          <motion.div
            key={cat.key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
          >
            <button
              onClick={() => toggle(cat.key)}
              className="w-full flex items-center justify-between py-4 border-b border-border"
            >
              <ChevronDown className={cn(
                'h-4 w-4 text-muted-foreground transition-transform',
                expandedKey === cat.key && 'rotate-180'
              )} />
              <div className="flex items-center gap-3">
                <span className="font-medium text-foreground">{cat.label}</span>
                <cat.icon className="h-6 w-6 text-muted-foreground" />
              </div>
            </button>
            {expandedKey === cat.key && sampleDuas[cat.key] && (
              <div className="py-3 space-y-3">
                {sampleDuas[cat.key].map((dua, j) => (
                  <div key={j} className="rounded-xl bg-card border border-border p-4">
                    <p className="text-lg font-arabic text-foreground leading-[2] text-center mb-2">{dua.arabic}</p>
                    <p className="text-xs text-muted-foreground mb-1">{dua.translation}</p>
                    <span className="text-[10px] text-primary font-medium">×{dua.count}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Adhkar section */}
      <div className="px-5 mt-6 mb-2">
        <p className="text-sm font-bold text-foreground mb-3">أذكار</p>
      </div>
      <div className="px-5 space-y-0 mb-8">
        {adhkarCategories.map((cat, i) => (
          <motion.div
            key={cat.key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.03 }}
          >
            <button
              onClick={() => toggle(cat.key)}
              className="w-full flex items-center justify-between py-4 border-b border-border"
            >
              <ChevronDown className={cn(
                'h-4 w-4 text-muted-foreground transition-transform',
                expandedKey === cat.key && 'rotate-180'
              )} />
              <div className="flex items-center gap-3">
                <span className="font-medium text-foreground">{cat.label}</span>
                <span className="text-2xl">{cat.icon}</span>
              </div>
            </button>
            {expandedKey === cat.key && sampleDuas[cat.key] && (
              <div className="py-3 space-y-3">
                {sampleDuas[cat.key].map((dua, j) => (
                  <div key={j} className="rounded-xl bg-card border border-border p-4">
                    <p className="text-lg font-arabic text-foreground leading-[2] text-center mb-2">{dua.arabic}</p>
                    <p className="text-xs text-muted-foreground mb-1">{dua.translation}</p>
                    <span className="text-[10px] text-primary font-medium">×{dua.count}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
