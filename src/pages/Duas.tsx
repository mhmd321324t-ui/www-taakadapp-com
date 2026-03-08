import { useState } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Search, Bookmark, ChevronDown,
  Bed, Droplets, Home, Shirt, Plane, UtensilsCrossed,
  Moon, Heart, Stethoscope, Frown, SmilePlus, Shield,
  Landmark, TreePine, Handshake, Signpost, Users
} from 'lucide-react';

const dailyCategories = [
  { icon: Bed, label: 'النوم' },
  { icon: Droplets, label: 'الوضوء' },
  { icon: Landmark, label: 'مسجد' },
  { icon: Heart, label: 'صلاة' },
  { icon: Home, label: 'منزل' },
  { icon: Shirt, label: 'ملابس' },
  { icon: Plane, label: 'سفر' },
  { icon: UtensilsCrossed, label: 'طعام' },
];

const adhkarCategories = [
  { icon: '📿', label: 'الذكر اليومي' },
  { icon: '🌙', label: 'إحياء الذكرى اليومي' },
  { icon: '🤲', label: 'بعد الصلوات' },
  { icon: '🍎', label: 'رزق' },
  { icon: '📖', label: 'معرفة' },
  { icon: '🕌', label: 'الإيمان' },
  { icon: '⚖️', label: 'يوم الحساب' },
  { icon: '💚', label: 'مغفرة' },
  { icon: '🤲', label: 'مشيداً بالله' },
];

const moreCategories = [
  { icon: Users, label: 'عائلة' },
  { icon: Stethoscope, label: 'الصحة / المرض' },
  { icon: Frown, label: 'الخسارة / الفشل' },
  { icon: SmilePlus, label: 'الحزن / السعادة' },
  { icon: Shield, label: 'الصبر' },
  { icon: Heart, label: 'الدّين' },
  { icon: Heart, label: 'أثناء الحيض' },
];

const occasionalCategories = [
  { icon: '🪦', label: 'المتوفى' },
  { icon: '🕋', label: 'الحج / العمرة' },
  { icon: '🌙', label: 'رمضان' },
  { icon: '🌳', label: 'طبيعة' },
  { icon: '🤝', label: 'السلوكيات الحميدة' },
  { icon: '🪧', label: 'إتخاذ القرار / التوجيه' },
];

const sampleDuas: Record<string, Array<{ arabic: string; translation: string; count: number }>> = {
  'النوم': [
    { arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', translation: 'In Your name, O Allah, I die and I live.', count: 1 },
    { arabic: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ', translation: 'O Allah, protect me from Your punishment on the Day You resurrect Your servants.', count: 3 },
  ],
  'الذكر اليومي': [
    { arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', translation: 'Glory be to Allah and praise Him.', count: 100 },
    { arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', translation: 'None has the right to be worshipped except Allah alone.', count: 10 },
  ],
  'الوضوء': [
    { arabic: 'بِسْمِ اللَّهِ', translation: 'In the name of Allah.', count: 1 },
    { arabic: 'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ', translation: 'I bear witness that none has the right to be worshipped except Allah alone, and I bear witness that Muhammad is His slave and Messenger.', count: 1 },
  ],
  'بعد الصلوات': [
    { arabic: 'أَسْتَغْفِرُ اللَّهَ (ثلاثًا) اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ', translation: 'I seek the forgiveness of Allah (3x). O Allah, You are Peace and from You comes peace. Blessed are You, O Owner of Majesty and Honor.', count: 1 },
  ],
};

export default function Duas() {
  const { t } = useLocale();
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const toggle = (label: string) => {
    setExpandedKey(expandedKey === label ? null : label);
  };

  const renderSection = (
    title: string,
    items: Array<{ icon: any; label: string }>,
    startDelay: number,
    useEmoji: boolean
  ) => (
    <>
      <div className="px-5 mt-6 mb-2">
        <p className="text-sm font-bold text-foreground">{title}</p>
      </div>
      <div className="px-5">
        {items.map((cat, i) => (
          <motion.div
            key={cat.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: startDelay + i * 0.02 }}
          >
            <button
              onClick={() => toggle(cat.label)}
              className="w-full flex items-center justify-between py-4 border-b border-border"
            >
              <ChevronDown className={cn(
                'h-4 w-4 text-muted-foreground transition-transform',
                expandedKey === cat.label && 'rotate-180'
              )} />
              <div className="flex items-center gap-3">
                <span className="font-medium text-foreground">{cat.label}</span>
                {useEmoji ? (
                  <span className="text-2xl">{cat.icon}</span>
                ) : (
                  <cat.icon className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
            </button>
            {expandedKey === cat.label && sampleDuas[cat.label] && (
              <div className="py-3 space-y-3">
                {sampleDuas[cat.label].map((dua, j) => (
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
    </>
  );

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

      {renderSection('يومي', dailyCategories, 0, false)}
      {renderSection('أذكار', adhkarCategories, 0.15, true)}
      {renderSection('أخرى', moreCategories, 0.3, false)}
      {renderSection('متقطع', occasionalCategories, 0.4, true)}

      <div className="h-8" />
    </div>
  );
}
