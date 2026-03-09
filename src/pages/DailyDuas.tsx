import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ArrowRight, Sparkles, RefreshCw, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { duasData } from '@/data/duas';

interface AiDua {
  arabic: string;
  reference: string;
  count: number;
}

const CONTEXT_CONFIG: Record<string, {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: string;
  fallbackCategories: string[];
}> = {
  morning: {
    title: 'أذكار الصباح والخروج',
    subtitle: 'ابدأ يومك بذكر الله',
    emoji: '☀️',
    gradient: 'from-amber-500/20 to-orange-500/10',
    fallbackCategories: ['daily-dhikr', 'home'],
  },
  midday: {
    title: 'أدعية ومناجاة',
    subtitle: 'دعاء للوالدين والتسبيح والاستغفار',
    emoji: '🤲',
    gradient: 'from-primary/20 to-emerald-500/10',
    fallbackCategories: ['family', 'daily-revival', 'daily-dhikr'],
  },
  evening: {
    title: 'وقت القرآن',
    subtitle: 'تعال نقرأ القرآن ونتدبر',
    emoji: '📖',
    gradient: 'from-blue-500/20 to-indigo-500/10',
    fallbackCategories: ['daily-dhikr'],
  },
  bedtime: {
    title: 'أذكار قبل النوم',
    subtitle: 'حصّن نفسك قبل النوم',
    emoji: '🌙',
    gradient: 'from-indigo-500/20 to-purple-500/10',
    fallbackCategories: ['sleep'],
  },
};

function getFallbackDuas(categories: string[]): AiDua[] {
  const result: AiDua[] = [];
  for (const catKey of categories) {
    const cat = duasData[catKey];
    if (!cat) continue;
    for (const sub of cat.subCategories) {
      for (const d of sub.duas) {
        result.push({ arabic: d.arabic, reference: d.reference || '', count: d.count });
      }
    }
  }
  // Shuffle and pick 5
  const shuffled = result.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}

export default function DailyDuas() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const context = params.get('context') || 'morning';
  const config = CONTEXT_CONFIG[context] || CONTEXT_CONFIG.morning;

  const [duas, setDuas] = useState<AiDua[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAi, setIsAi] = useState(false);

  const fetchDuas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('daily-duas', {
        body: { context },
      });

      if (error) throw error;

      if (!error && data?.duas && Array.isArray(data.duas) && data.duas.length > 0) {
        setDuas(data.duas);
        setIsAi(true);
      } else {
        throw new Error("fallback");
      }
    } catch {
      setDuas(getFallbackDuas(config.fallbackCategories));
      setIsAi(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDuas();
  }, [context]);

  return (
    <div className="min-h-screen pb-24" dir="rtl">
      {/* Header */}
      <div className={cn('relative overflow-hidden pb-16 pt-safe-header')}>
        <div className={cn('absolute inset-0 bg-gradient-to-br', config.gradient)} />
        <div className="absolute inset-0 islamic-pattern opacity-10" />
        <div className="flex items-center justify-between relative z-10 px-5 gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 transition-all active:scale-95"
          >
            <ArrowRight className="h-4 w-4 text-foreground" />
          </button>
          <div className="text-center flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/12 backdrop-blur-sm border border-white/10 px-4 py-1.5">
              <span className="text-lg">{config.emoji}</span>
              <h1 className="text-lg font-bold text-foreground whitespace-nowrap">{config.title}</h1>
            </div>
            <p className="text-muted-foreground text-xs mt-2 leading-relaxed">{config.subtitle}</p>
          </div>
          <div className="w-10 shrink-0" />
        </div>
        <div className="absolute -bottom-6 left-0 right-0 h-12 rounded-t-[2rem] bg-background" />
      </div>

      <div className="px-5 -mt-4 relative z-10">
        {/* AI badge */}
        {isAi && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-3 mb-4"
          >
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <p className="text-xs text-primary leading-relaxed">أدعية مُختارة لك اليوم بالذكاء الاصطناعي ✨</p>
          </motion.div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">جارٍ تحضير أذكارك...</p>
          </div>
        ) : (
          <>
            {/* Duas list */}
            <div className="space-y-3 mb-5">
              <AnimatePresence mode="wait">
                {duas.map((dua, i) => (
                  <motion.div
                    key={`${context}-${i}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: i * 0.08 }}
                    className="rounded-3xl border border-border/50 bg-card p-5 shadow-elevated"
                  >
                    <p className="text-lg leading-[2.2] text-foreground font-arabic text-center mb-3">
                      {dua.arabic}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <span className="text-xs text-muted-foreground">{dua.reference}</span>
                      {dua.count > 1 && (
                        <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-2.5 py-0.5">
                          {dua.count}×
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Refresh button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                onClick={fetchDuas}
                variant="outline"
                className="w-full rounded-2xl h-12 gap-3"
                disabled={loading}
              >
                <Sparkles className="h-4 w-4" />
                أدعية جديدة
              </Button>
            </motion.div>

            {/* Go to Quran for evening context */}
            {context === 'evening' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-3"
              >
                <Button
                  onClick={() => navigate('/quran')}
                  className="w-full rounded-2xl h-12 gap-3"
                >
                  <BookOpen className="h-4 w-4" />
                  افتح القرآن الكريم
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
