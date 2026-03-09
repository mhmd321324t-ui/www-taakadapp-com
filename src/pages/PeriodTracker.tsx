import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Calendar, Moon, Clock, ChevronLeft, ChevronRight, AlertCircle, BookOpen, Droplets } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { cn } from '@/lib/utils';

interface PeriodData {
  startDate: string;
  duration: number; // days
  cycleLength: number; // days
  history: { start: string; end: string }[];
}

const STORAGE_KEY = 'period-tracker-data';

const DEFAULT_DATA: PeriodData = {
  startDate: '',
  duration: 7,
  cycleLength: 28,
  history: [],
};

const periodDuas = [
  { text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ', ref: 'متفق عليه' },
  { text: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', ref: 'متفق عليه' },
  { text: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ', ref: 'رواه أبو داود' },
  { text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ', ref: 'رواه ابن ماجه' },
  { text: 'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ', ref: 'رواه أبو داود' },
  { text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ', ref: 'صيغة الصلاة على النبي' },
];

const allowedActs = [
  { emoji: '📿', text: 'الذكر والتسبيح والتهليل والاستغفار' },
  { emoji: '🤲', text: 'الدعاء في كل وقت' },
  { emoji: '📖', text: 'قراءة تفسير القرآن (دون مسّ المصحف)' },
  { emoji: '🎧', text: 'سماع القرآن والمحاضرات الدينية' },
  { emoji: '💰', text: 'الصدقة والإنفاق في سبيل الله' },
  { emoji: '🕌', text: 'حضور مجالس العلم والذكر' },
  { emoji: '💭', text: 'التفكر والتأمل في خلق الله' },
  { emoji: '😊', text: 'الابتسامة وإفشاء السلام' },
];

const exemptedActs = [
  { emoji: '🚫', text: 'الصلاة — معفاة ولا تُقضى' },
  { emoji: '⏸️', text: 'الصيام — يُقضى بعد رمضان' },
  { emoji: '📕', text: 'مسّ المصحف — استخدمي التطبيق أو القفازات' },
  { emoji: '🕌', text: 'المكث في المسجد — يجوز المرور فقط' },
  { emoji: '🔄', text: 'الطواف حول الكعبة' },
];

function getDaysBetween(d1: string, d2: string): number {
  return Math.ceil((new Date(d2).getTime() - new Date(d1).getTime()) / 86400000);
}

export default function PeriodTracker() {
  const [data, setData] = useState<PeriodData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_DATA;
    } catch { return DEFAULT_DATA; }
  });

  const [activeTab, setActiveTab] = useState<'tracker' | 'guide' | 'duas'>('tracker');
  const [showSettings, setShowSettings] = useState(!data.startDate);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const today = new Date().toISOString().split('T')[0];

  const { isOnPeriod, currentDay, daysUntilNext, nextPeriodDate } = useMemo(() => {
    if (!data.startDate) return { isOnPeriod: false, currentDay: 0, daysUntilNext: 0, nextPeriodDate: '' };

    const start = new Date(data.startDate);
    const now = new Date(today);
    const diffDays = getDaysBetween(data.startDate, today);

    // Calculate where we are in the cycle
    const cycleDay = ((diffDays % data.cycleLength) + data.cycleLength) % data.cycleLength;
    const isOn = cycleDay < data.duration && diffDays >= 0;
    const daysLeft = isOn ? 0 : data.cycleLength - cycleDay;

    const nextDate = new Date(now);
    nextDate.setDate(nextDate.getDate() + daysLeft);

    return {
      isOnPeriod: isOn,
      currentDay: isOn ? cycleDay + 1 : 0,
      daysUntilNext: isOn ? 0 : daysLeft,
      nextPeriodDate: nextDate.toISOString().split('T')[0],
    };
  }, [data.startDate, data.duration, data.cycleLength, today]);

  const handleStartPeriod = () => {
    setData(prev => ({
      ...prev,
      startDate: today,
      history: [...prev.history, { start: today, end: '' }].slice(-12),
    }));
    setShowSettings(false);
  };

  const handleEndPeriod = () => {
    setData(prev => {
      const history = [...prev.history];
      if (history.length > 0 && !history[history.length - 1].end) {
        history[history.length - 1].end = today;
      }
      return { ...prev, history };
    });
  };

  return (
    <div className="min-h-screen pb-24" dir="rtl">
      <PageHeader title="تتبع الدورة الشهرية" backTo="/more" />

      {/* Status Card */}
      <div className="px-4 mb-4">
        <div className={cn(
          'rounded-2xl p-5 relative overflow-hidden',
          isOnPeriod
            ? 'bg-gradient-to-br from-islamic-rose/90 via-islamic-rose/80 to-islamic-copper/70 text-primary-foreground'
            : 'bg-gradient-to-br from-primary/90 via-primary to-islamic-emerald/80 text-primary-foreground'
        )}>
          <div className="absolute top-2 left-4 opacity-20 text-5xl">{isOnPeriod ? '🌸' : '🌙'}</div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="h-5 w-5" />
              <h2 className="text-lg font-bold">{isOnPeriod ? 'فترة الحيض' : 'فترة الطهارة'}</h2>
            </div>

            {data.startDate ? (
              <>
                {isOnPeriod ? (
                  <div>
                    <p className="text-sm opacity-90">اليوم {currentDay} من {data.duration}</p>
                    <div className="w-full bg-primary-foreground/20 rounded-full h-2 mt-2">
                      <motion.div
                        className="bg-primary-foreground h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentDay / data.duration) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs opacity-70 mt-2">الصلاة معفاة — أكثري من الذكر والدعاء</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm opacity-90">الدورة القادمة بعد {daysUntilNext} يوم</p>
                    <p className="text-xs opacity-70 mt-1">حافظي على صلاتك وعباداتك ✨</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm opacity-80">ابدأي بتسجيل أول يوم في الدورة</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-4 flex gap-2">
        {!isOnPeriod ? (
          <button
            onClick={handleStartPeriod}
            className="flex-1 rounded-2xl bg-islamic-rose/10 border border-islamic-rose/30 text-islamic-rose py-3 text-sm font-bold transition-all active:scale-95"
          >
            🩸 بدء الدورة اليوم
          </button>
        ) : (
          <button
            onClick={handleEndPeriod}
            className="flex-1 rounded-2xl bg-primary/10 border border-primary/30 text-primary py-3 text-sm font-bold transition-all active:scale-95"
          >
            ✅ انتهت الدورة
          </button>
        )}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="rounded-2xl bg-card border border-border/50 text-foreground px-4 py-3 text-sm font-bold transition-all active:scale-95"
        >
          ⚙️
        </button>
      </div>

      {/* Settings */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 mb-4 overflow-hidden"
          >
            <div className="rounded-2xl bg-card border border-border/50 p-4 space-y-4">
              <h4 className="text-sm font-bold text-foreground">إعدادات الدورة</h4>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">مدة الحيض (أيام)</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setData(p => ({ ...p, duration: Math.max(3, p.duration - 1) }))} className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center text-lg">−</button>
                  <span className="text-lg font-bold text-foreground w-8 text-center">{data.duration}</span>
                  <button onClick={() => setData(p => ({ ...p, duration: Math.min(15, p.duration + 1) }))} className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center text-lg">+</button>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">طول الدورة الكاملة (أيام)</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setData(p => ({ ...p, cycleLength: Math.max(21, p.cycleLength - 1) }))} className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center text-lg">−</button>
                  <span className="text-lg font-bold text-foreground w-8 text-center">{data.cycleLength}</span>
                  <button onClick={() => setData(p => ({ ...p, cycleLength: Math.min(45, p.cycleLength + 1) }))} className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center text-lg">+</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-1 rounded-xl bg-muted p-1">
          {[
            { key: 'tracker' as const, label: '📊 التتبع', },
            { key: 'guide' as const, label: '📖 الدليل', },
            { key: 'duas' as const, label: '🤲 أدعية', },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 py-2 rounded-lg text-xs font-semibold transition-all',
                activeTab === tab.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4">
        <AnimatePresence mode="wait">
          {activeTab === 'tracker' && (
            <motion.div key="tracker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {/* Calendar visual - simple cycle view */}
              <div className="rounded-2xl bg-card border border-border/50 p-4">
                <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  الدورة الحالية
                </h4>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: data.cycleLength > 35 ? 35 : data.cycleLength }, (_, i) => {
                    const isPeriodDay = i < data.duration;
                    const isToday = data.startDate && (() => {
                      const diff = getDaysBetween(data.startDate, today);
                      const cycleDay = ((diff % data.cycleLength) + data.cycleLength) % data.cycleLength;
                      return cycleDay === i;
                    })();
                    return (
                      <div
                        key={i}
                        className={cn(
                          'h-8 rounded-lg flex items-center justify-center text-[10px] font-semibold',
                          isPeriodDay ? 'bg-islamic-rose/20 text-islamic-rose' : 'bg-muted/30 text-muted-foreground',
                          isToday && 'ring-2 ring-primary'
                        )}
                      >
                        {i + 1}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded bg-islamic-rose/20" />
                    فترة الحيض
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded bg-muted/30" />
                    فترة الطهارة
                  </div>
                </div>
              </div>

              {/* History */}
              {data.history.length > 0 && (
                <div className="rounded-2xl bg-card border border-border/50 p-4">
                  <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    السجل
                  </h4>
                  <div className="space-y-2">
                    {data.history.slice(-5).reverse().map((entry, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                        <span className="text-xs text-foreground">{entry.start}</span>
                        <span className="text-xs text-muted-foreground">
                          {entry.end ? `${getDaysBetween(entry.start, entry.end)} أيام` : 'جارية...'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'guide' && (
            <motion.div key="guide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {/* Allowed */}
              <div className="rounded-2xl bg-card border border-border/50 p-4">
                <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />
                  عبادات مسموحة أثناء الحيض
                </h4>
                <div className="space-y-2">
                  {allowedActs.map((act, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-primary/5">
                      <span className="text-lg">{act.emoji}</span>
                      <span className="text-sm text-foreground">{act.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exempted */}
              <div className="rounded-2xl bg-card border border-border/50 p-4">
                <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-islamic-rose" />
                  عبادات معفاة أثناء الحيض
                </h4>
                <div className="space-y-2">
                  {exemptedActs.map((act, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-islamic-rose/5">
                      <span className="text-lg">{act.emoji}</span>
                      <span className="text-sm text-foreground">{act.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Important notes */}
              <div className="rounded-2xl bg-accent/10 border border-accent/20 p-4">
                <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-accent" />
                  ملاحظات مهمة
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• الصلاة لا تُقضى بعد الحيض — هي معفاة بالكامل</li>
                  <li>• الصيام يجب قضاؤه بعد رمضان</li>
                  <li>• يجوز قراءة القرآن من الهاتف أو الحفظ دون مسّ المصحف</li>
                  <li>• الغُسل واجب بعد انتهاء الحيض قبل استئناف الصلاة</li>
                  <li>• عند الشك في الطهارة، انتظري حتى تتأكدي تماماً</li>
                </ul>
              </div>
            </motion.div>
          )}

          {activeTab === 'duas' && (
            <motion.div key="duas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <p className="text-sm text-muted-foreground text-center mb-2">
                أدعية وأذكار يمكن قراءتها أثناء الحيض
              </p>
              {periodDuas.map((dua, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl bg-card border border-border/50 p-4"
                >
                  <p className="text-base font-amiri leading-loose text-foreground text-center mb-2">
                    {dua.text}
                  </p>
                  <p className="text-[10px] text-muted-foreground text-center">{dua.ref}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
