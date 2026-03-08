import { useState } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Search, Bookmark, ChevronDown, ChevronRight, ArrowRight,
  Bed, Droplets, Home, Shirt, Plane, UtensilsCrossed,
  Heart, Stethoscope, Frown, SmilePlus, Shield,
  Landmark, Users
} from 'lucide-react';
import { duasData } from '@/data/duas';

interface CatItem {
  icon: any;
  label: string;
  dataKey: string;
  useEmoji?: boolean;
}

const dailyCategories: CatItem[] = [
  { icon: Bed, label: 'النوم', dataKey: 'sleep' },
  { icon: Droplets, label: 'الوضوء', dataKey: 'wudu' },
  { icon: Landmark, label: 'مسجد', dataKey: 'mosque' },
  { icon: Heart, label: 'صلاة', dataKey: 'salah' },
  { icon: Home, label: 'منزل', dataKey: 'home' },
  { icon: Shirt, label: 'ملابس', dataKey: 'clothes' },
  { icon: Plane, label: 'سفر', dataKey: 'travel' },
  { icon: UtensilsCrossed, label: 'طعام', dataKey: 'food' },
];

const adhkarCategories: CatItem[] = [
  { icon: '📿', label: 'الذكر اليومي', dataKey: 'daily-dhikr', useEmoji: true },
  { icon: '🌙', label: 'إحياء الذكرى اليومي', dataKey: 'daily-revival', useEmoji: true },
  { icon: '🤲', label: 'بعد الصلوات', dataKey: 'after-prayer', useEmoji: true },
  { icon: '🍎', label: 'رزق', dataKey: 'rizq', useEmoji: true },
  { icon: '📖', label: 'معرفة', dataKey: 'knowledge', useEmoji: true },
  { icon: '🕌', label: 'الإيمان', dataKey: 'faith', useEmoji: true },
  { icon: '⚖️', label: 'يوم الحساب', dataKey: 'judgment', useEmoji: true },
  { icon: '💚', label: 'مغفرة', dataKey: 'forgiveness', useEmoji: true },
  { icon: '🤲', label: 'مشيداً بالله', dataKey: 'praising', useEmoji: true },
];

const moreCategories: CatItem[] = [
  { icon: Users, label: 'عائلة', dataKey: 'family' },
  { icon: Stethoscope, label: 'الصحة / المرض', dataKey: 'health' },
  { icon: Frown, label: 'الخسارة / الفشل', dataKey: 'loss' },
  { icon: SmilePlus, label: 'الحزن / السعادة', dataKey: 'sadness' },
  { icon: Shield, label: 'الصبر', dataKey: 'patience' },
  { icon: Heart, label: 'الدّين', dataKey: 'debt' },
  { icon: Heart, label: 'أثناء الحيض', dataKey: 'menstruation' },
];

const occasionalCategories: CatItem[] = [
  { icon: '🪦', label: 'المتوفى', dataKey: 'deceased', useEmoji: true },
  { icon: '🕋', label: 'الحج / العمرة', dataKey: 'hajj', useEmoji: true },
  { icon: '🌙', label: 'رمضان', dataKey: 'ramadan', useEmoji: true },
  { icon: '🌳', label: 'طبيعة', dataKey: 'nature', useEmoji: true },
  { icon: '🤝', label: 'السلوكيات الحميدة', dataKey: 'goodManners', useEmoji: true },
  { icon: '🪧', label: 'إتخاذ القرار / التوجيه', dataKey: 'guidance', useEmoji: true },
];

type ViewMode = 'categories' | 'subCategories' | 'duas';

export default function Duas() {
  const { t } = useLocale();
  const [viewMode, setViewMode] = useState<ViewMode>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubIndex, setSelectedSubIndex] = useState<number | null>(null);

  const openCategory = (dataKey: string) => {
    setSelectedCategory(dataKey);
    setSelectedSubIndex(null);
    setViewMode('subCategories');
  };

  const openSubCategory = (index: number) => {
    setSelectedSubIndex(index);
    setViewMode('duas');
  };

  const goBack = () => {
    if (viewMode === 'duas') {
      setSelectedSubIndex(null);
      setViewMode('subCategories');
    } else if (viewMode === 'subCategories') {
      setSelectedCategory(null);
      setViewMode('categories');
    }
  };

  const category = selectedCategory ? duasData[selectedCategory] : null;
  const subCategories = category?.subCategories || [];
  const selectedSub = selectedSubIndex !== null ? subCategories[selectedSubIndex] : null;

  const totalDuasInCategory = subCategories.reduce((sum, sub) => sum + sub.duas.length, 0);

  // Find the label of the current category from all category arrays
  const findCatLabel = (dataKey: string) => {
    const allCats = [...dailyCategories, ...adhkarCategories, ...moreCategories, ...occasionalCategories];
    return allCats.find(c => c.dataKey === dataKey)?.label || '';
  };

  const renderCategoriesList = () => (
    <>
      {renderSection('يومي', dailyCategories)}
      {renderSection('أذكار', adhkarCategories)}
      {renderSection('أخرى', moreCategories)}
      {renderSection('متقطع', occasionalCategories)}
    </>
  );

  const renderSection = (title: string, items: CatItem[]) => (
    <>
      <div className="px-5 mt-6 mb-2">
        <p className="text-sm font-bold text-foreground">{title}</p>
      </div>
      <div className="px-5">
        {items.map((cat) => {
          const catData = duasData[cat.dataKey];
          const totalDuas = catData?.subCategories.reduce((s, sub) => s + sub.duas.length, 0) || 0;
          const subCount = catData?.subCategories.length || 0;
          return (
            <button
              key={cat.dataKey}
              onClick={() => openCategory(cat.dataKey)}
              className="w-full flex items-center justify-between py-4 border-b border-border"
            >
              <div className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
                <span className="text-[10px] text-muted-foreground">({totalDuas})</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="font-medium text-foreground block">{cat.label}</span>
                  <span className="text-[10px] text-muted-foreground">{subCount} {t('subCategories') || 'أقسام'}</span>
                </div>
                {cat.useEmoji ? (
                  <span className="text-2xl">{cat.icon}</span>
                ) : (
                  <cat.icon className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );

  const renderSubCategories = () => (
    <div className="px-5 pt-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] text-muted-foreground">{totalDuasInCategory} {t('totalDuas') || 'دعاء'}</span>
        <h2 className="text-lg font-bold text-foreground">{findCatLabel(selectedCategory!)}</h2>
      </div>
      <div className="space-y-3">
        {subCategories.map((sub, i) => (
          <button
            key={i}
            onClick={() => openSubCategory(i)}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
              <span className="text-xs text-muted-foreground">({sub.duas.length})</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium text-foreground">{t(sub.labelKey) || sub.labelKey}</span>
              {sub.emoji && <span className="text-2xl">{sub.emoji}</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderDuas = () => (
    <div className="px-5 pt-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] text-muted-foreground">{selectedSub?.duas.length} {t('totalDuas') || 'دعاء'}</span>
        <div className="text-right">
          <h2 className="text-lg font-bold text-foreground">
            {selectedSub?.emoji} {t(selectedSub?.labelKey || '')}
          </h2>
          <span className="text-[10px] text-muted-foreground">{findCatLabel(selectedCategory!)}</span>
        </div>
      </div>
      <div className="space-y-3">
        {selectedSub?.duas.map((dua, j) => (
          <motion.div
            key={j}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: j * 0.05 }}
            className="rounded-xl bg-card border border-border p-4"
          >
            <p className="text-lg font-arabic text-foreground leading-[2] text-center mb-2">
              {dua.arabic}
            </p>
            <p className="text-xs text-muted-foreground mb-1">
              {t(dua.translationKey)}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-primary font-medium">×{dua.count}</span>
              {dua.reference && (
                <span className="text-[10px] text-muted-foreground">📖 {dua.reference}</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-safe" dir="rtl">
      <div className="px-5 pt-12 pb-3 flex items-center justify-between">
        <div className="flex gap-3">
          {viewMode !== 'categories' ? (
            <button onClick={goBack} className="p-1">
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </button>
          ) : (
            <>
              <button className="p-1"><Search className="h-5 w-5 text-muted-foreground" /></button>
              <button className="p-1"><Bookmark className="h-5 w-5 text-muted-foreground" /></button>
            </>
          )}
        </div>
        <h1 className="text-xl font-bold text-foreground">الدُعاء والذكر</h1>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode + (selectedCategory || '') + (selectedSubIndex ?? '')}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.2 }}
        >
          {viewMode === 'categories' && renderCategoriesList()}
          {viewMode === 'subCategories' && renderSubCategories()}
          {viewMode === 'duas' && renderDuas()}
        </motion.div>
      </AnimatePresence>

      <div className="h-24" />
    </div>
  );
}
