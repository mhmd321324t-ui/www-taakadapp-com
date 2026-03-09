import { useState, useMemo } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/PageHeader';
import SectionHeader from '@/components/SectionHeader';
import {
  Search, Bookmark, ChevronRight, ArrowRight, X,
  Bed, Droplets, Home, Shirt, Plane, UtensilsCrossed,
  Heart, Stethoscope, Frown, SmilePlus, Shield,
  Landmark, Users
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { duasData } from '@/data/duas';

interface CatItem {
  icon: any;
  label: string;
  dataKey: string;
  useEmoji?: boolean;
}

const getDailyCategories = (t: (k: string) => string): CatItem[] => [
  { icon: Bed, label: t('catSleep'), dataKey: 'sleep' },
  { icon: Droplets, label: t('catWudu'), dataKey: 'wudu' },
  { icon: Landmark, label: t('catMosque'), dataKey: 'mosque' },
  { icon: Heart, label: t('catSalah'), dataKey: 'salah' },
  { icon: Home, label: t('catHome'), dataKey: 'home' },
  { icon: Shirt, label: t('catClothes'), dataKey: 'clothes' },
  { icon: Plane, label: t('catTravel'), dataKey: 'travel' },
  { icon: UtensilsCrossed, label: t('catFood'), dataKey: 'food' },
];

const getAdhkarCategories = (t: (k: string) => string): CatItem[] => [
  { icon: '📿', label: t('catDailyDhikr'), dataKey: 'daily-dhikr', useEmoji: true },
  { icon: '🌙', label: t('catDailyRevival'), dataKey: 'daily-revival', useEmoji: true },
  { icon: '🤲', label: t('catAfterPrayer'), dataKey: 'after-prayer', useEmoji: true },
  { icon: '🍎', label: t('catRizq'), dataKey: 'rizq', useEmoji: true },
  { icon: '📖', label: t('catKnowledge'), dataKey: 'knowledge', useEmoji: true },
  { icon: '🕌', label: t('catFaith'), dataKey: 'faith', useEmoji: true },
  { icon: '⚖️', label: t('catJudgment'), dataKey: 'judgment', useEmoji: true },
  { icon: '💚', label: t('catForgiveness'), dataKey: 'forgiveness', useEmoji: true },
  { icon: '🤲', label: t('catPraising'), dataKey: 'praising', useEmoji: true },
];

const getMoreCategories = (t: (k: string) => string): CatItem[] => [
  { icon: Users, label: t('catFamily'), dataKey: 'family' },
  { icon: Stethoscope, label: t('catHealth'), dataKey: 'health' },
  { icon: Frown, label: t('catLoss'), dataKey: 'loss' },
  { icon: SmilePlus, label: t('catSadness'), dataKey: 'sadness' },
  { icon: Shield, label: t('catPatience'), dataKey: 'patience' },
  { icon: Heart, label: t('catDebt'), dataKey: 'debt' },
  { icon: Heart, label: t('catMenstruation'), dataKey: 'menstruation' },
];

const getOccasionalCategories = (t: (k: string) => string): CatItem[] => [
  { icon: '🪦', label: t('catDeceased'), dataKey: 'deceased', useEmoji: true },
  { icon: '🕋', label: t('catHajj'), dataKey: 'hajj', useEmoji: true },
  { icon: '🌙', label: t('catRamadan'), dataKey: 'ramadan', useEmoji: true },
  { icon: '🌳', label: t('catNature'), dataKey: 'nature', useEmoji: true },
  { icon: '🤝', label: t('catGoodManners'), dataKey: 'goodManners', useEmoji: true },
  { icon: '🪧', label: t('catGuidance'), dataKey: 'guidance', useEmoji: true },
];

const getAllCategories = (t: (k: string) => string) => [...getDailyCategories(t), ...getAdhkarCategories(t), ...getMoreCategories(t), ...getOccasionalCategories(t)];

type ViewMode = 'categories' | 'subCategories' | 'duas';

export default function Duas() {
  const { t } = useLocale();
  const [viewMode, setViewMode] = useState<ViewMode>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubIndex, setSelectedSubIndex] = useState<number | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('dua-favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [showFavorites, setShowFavorites] = useState(false);

  const openCategory = (dataKey: string) => {
    setSelectedCategory(dataKey);
    setSelectedSubIndex(null);
    setViewMode('subCategories');
    setShowFavorites(false);
    setShowSearch(false);
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
    } else if (showFavorites) {
      setShowFavorites(false);
    }
  };

  const toggleFavorite = (duaId: string) => {
    setFavorites(prev => {
      const next = prev.includes(duaId) ? prev.filter(id => id !== duaId) : [...prev, duaId];
      localStorage.setItem('dua-favorites', JSON.stringify(next));
      return next;
    });
  };

  const category = selectedCategory ? duasData[selectedCategory] : null;
  const subCategories = category?.subCategories || [];
  const selectedSub = selectedSubIndex !== null ? subCategories[selectedSubIndex] : null;
  const totalDuasInCategory = subCategories.reduce((sum, sub) => sum + sub.duas.length, 0);

  const findCatLabel = (dataKey: string) => {
    return getAllCategories(t).find(c => c.dataKey === dataKey)?.label || '';
  };

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: { arabic: string; translationKey: string; reference?: string; count: number; catLabel: string; subLabel: string; duaId: string }[] = [];
    for (const [catKey, catData] of Object.entries(duasData)) {
      const catLabel = findCatLabel(catKey);
      for (const sub of catData.subCategories) {
        for (const dua of sub.duas) {
          const translation = t(dua.translationKey);
          if (
            dua.arabic.includes(q) ||
            translation.toLowerCase().includes(q) ||
            (dua.reference && dua.reference.toLowerCase().includes(q))
          ) {
            results.push({
              ...dua,
              catLabel,
              subLabel: t(sub.labelKey) || sub.labelKey,
              duaId: `${catKey}-${sub.labelKey}-${dua.arabic.slice(0, 20)}`,
            });
          }
        }
      }
    }
    return results;
  }, [searchQuery, t]);

  // Favorite duas
  const favoriteDuas = useMemo(() => {
    const results: { arabic: string; translationKey: string; reference?: string; count: number; catLabel: string; subLabel: string; duaId: string }[] = [];
    for (const [catKey, catData] of Object.entries(duasData)) {
      const catLabel = findCatLabel(catKey);
      for (const sub of catData.subCategories) {
        for (const dua of sub.duas) {
          const duaId = `${catKey}-${sub.labelKey}-${dua.arabic.slice(0, 20)}`;
          if (favorites.includes(duaId)) {
            results.push({ ...dua, catLabel, subLabel: t(sub.labelKey) || sub.labelKey, duaId });
          }
        }
      }
    }
    return results;
  }, [favorites, t]);

  const renderDuaCard = (dua: typeof searchResults[0], j: number) => (
    <motion.div
      key={j}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: j * 0.05 }}
      className="rounded-2xl bg-card border border-border/50 p-5 shadow-elevated"
    >
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => toggleFavorite(dua.duaId)} className="p-1.5 rounded-xl hover:bg-muted transition-colors">
          <Heart className={cn("h-4 w-4", favorites.includes(dua.duaId) ? "text-destructive fill-destructive" : "text-muted-foreground")} />
        </button>
        <span className="text-[10px] text-muted-foreground">{dua.catLabel} › {dua.subLabel}</span>
      </div>
      <p className="text-lg font-arabic text-foreground leading-[2] text-center mb-2">
        {dua.arabic}
      </p>
      <p className="text-xs text-muted-foreground mb-1">{t(dua.translationKey)}</p>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-primary font-medium">×{dua.count}</span>
        {dua.reference && <span className="text-[10px] text-muted-foreground">📖 {dua.reference}</span>}
      </div>
    </motion.div>
  );

  const renderSection = (title: string, items: CatItem[], emoji?: string) => (
    <>
      <div className="px-5 mt-6 mb-2">
        <SectionHeader emoji={emoji} title={title} />
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
              className="w-full flex items-center justify-between py-5 border-b border-border/50"
            >
              <div className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
                <span className="text-[10px] text-muted-foreground">({totalDuas})</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="font-medium text-foreground block">{cat.label}</span>
                  <span className="text-[10px] text-muted-foreground">{subCount} {t('sectionsLabel')}</span>
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

  return (
    <div className="min-h-screen pb-24" dir="rtl">
      <PageHeader
        title={t('duasAndDhikr')}
        subtitle={t('duasSubtitle')}
        image="https://images.unsplash.com/photo-1447619297994-b829cc1ab44a?w=1200&q=85"
        compact
        actionsLeft={
          <div className="flex gap-2">
            {(viewMode !== 'categories' || showFavorites) ? (
              <button onClick={goBack} className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 transition-all active:scale-95">
                <ArrowRight className="h-4 w-4 text-white" />
              </button>
            ) : (
              <>
                <button className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 transition-all active:scale-95" onClick={() => { setShowSearch(!showSearch); setShowFavorites(false); }}>
                  {showSearch ? <X className="h-4 w-4 text-white" /> : <Search className="h-4 w-4 text-white" />}
                </button>
                <button className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 transition-all active:scale-95" onClick={() => { setShowFavorites(!showFavorites); setShowSearch(false); }}>
                  <Bookmark className={cn("h-4 w-4", showFavorites ? "text-white fill-white" : "text-white/70")} />
                </button>
              </>
            )}
          </div>
        }
      />

      {/* Search bar */}
      <AnimatePresence>
        {showSearch && viewMode === 'categories' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-5 -mt-4 relative z-10 mb-4 overflow-hidden"
          >
            <div className="relative">
              <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchDua')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pe-9 rounded-2xl bg-card border-border/50"
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={showSearch && searchQuery ? 'search' : showFavorites ? 'favs' : viewMode + (selectedCategory || '') + (selectedSubIndex ?? '')}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.2 }}
        >
          {showSearch && searchQuery ? (
            <div className="px-5 pt-2 space-y-3">
              <p className="text-xs text-muted-foreground">{searchResults.length} {t('resultCount')}</p>
              {searchResults.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">{t('noResultsFound')}</p>
                </div>
              ) : searchResults.map((dua, j) => renderDuaCard(dua, j))}
            </div>
          ) : showFavorites ? (
            <div className="px-5 pt-2 space-y-3">
              <p className="text-sm font-bold text-foreground mb-3">⭐ {t('favoritesLabel')} ({favoriteDuas.length})</p>
              {favoriteDuas.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">{t('noFavoriteDuas')}</p>
                </div>
              ) : favoriteDuas.map((dua, j) => renderDuaCard(dua, j))}
            </div>
          ) : viewMode === 'categories' ? (
            <>
              {renderSection(t('daily'), getDailyCategories(t), '📅')}
              {renderSection(t('adhkar'), getAdhkarCategories(t), '📿')}
              {renderSection(t('otherDuas'), getMoreCategories(t), '📂')}
              {renderSection(t('occasional'), getOccasionalCategories(t), '🗓️')}
            </>
          ) : viewMode === 'subCategories' ? (
            <div className="px-5 pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] text-muted-foreground">{totalDuasInCategory} {t('totalDuas')}</span>
                <h2 className="text-lg font-bold text-foreground">{findCatLabel(selectedCategory!)}</h2>
              </div>
              <div className="space-y-3">
                {subCategories.map((sub, i) => (
                  <button
                    key={i}
                    onClick={() => openSubCategory(i)}
                    className="w-full flex items-center justify-between p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors shadow-elevated"
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
          ) : (
            <div className="px-5 pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] text-muted-foreground">{selectedSub?.duas.length} {t('totalDuas')}</span>
                <div className="text-right">
                  <h2 className="text-lg font-bold text-foreground">
                    {selectedSub?.emoji} {t(selectedSub?.labelKey || '')}
                  </h2>
                  <span className="text-[10px] text-muted-foreground">{findCatLabel(selectedCategory!)}</span>
                </div>
              </div>
              <div className="space-y-3">
                {selectedSub?.duas.map((dua, j) => {
                  const duaId = `${selectedCategory}-${selectedSub.labelKey}-${dua.arabic.slice(0, 20)}`;
                  return (
                    <motion.div
                      key={j}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: j * 0.05 }}
                      className="rounded-2xl bg-card border border-border/50 p-5 shadow-elevated"
                    >
                      <div className="flex items-center justify-end mb-2">
                        <button onClick={() => toggleFavorite(duaId)} className="p-1">
                          <Heart className={cn("h-4 w-4", favorites.includes(duaId) ? "text-destructive fill-destructive" : "text-muted-foreground")} />
                        </button>
                      </div>
                      <p className="text-lg font-arabic text-foreground leading-[2] text-center mb-2">
                        {dua.arabic}
                      </p>
                      <p className="text-xs text-muted-foreground mb-1">{t(dua.translationKey)}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-primary font-medium">×{dua.count}</span>
                        {dua.reference && <span className="text-[10px] text-muted-foreground">📖 {dua.reference}</span>}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      
    </div>
  );
}
