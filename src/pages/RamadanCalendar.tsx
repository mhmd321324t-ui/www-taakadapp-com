import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Sunrise, Star, ChevronLeft, ChevronRight, BookOpen, Heart, Clock, Sparkles, Share2, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { ramadanDailyDuas, laylatAlQadrDuas } from '@/data/ramadanDuas';
import PageHeader from '@/components/PageHeader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const RAMADAN_DAYS = 30;

// Hijri day 1 of Ramadan 1447 ≈ Feb 18, 2026 (approximate)
// We'll compute from the API's hijri data instead
function getRamadanDayFromHijri(hijriDay: number, hijriMonth: number): number | null {
  if (hijriMonth !== 9) return null;
  return hijriDay;
}

function detectIs12Hour(): boolean {
  try {
    const f = new Intl.DateTimeFormat(navigator.language, { hour: 'numeric' }).format(new Date(2024, 0, 1, 14, 0));
    return !f.includes('14');
  } catch { return false; }
}

function to12Hour(t24: string): string {
  const [h, m] = t24.split(':').map(Number);
  return `${h === 0 ? 12 : h > 12 ? h - 12 : h}:${String(m).padStart(2, '0')} ${h >= 12 ? 'م' : 'ص'}`;
}

const arabicDayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export default function RamadanCalendar() {
  const location = useGeoLocation();
  const { prayers, hijriDay, hijriMonthNumber, loading } = usePrayerTimes(
    location.latitude, location.longitude, location.calculationMethod, location.school
  );
  const is12h = detectIs12Hour();

  const currentRamadanDay = getRamadanDayFromHijri(parseInt(hijriDay) || 0, hijriMonthNumber);
  const [selectedDay, setSelectedDay] = useState<number>(currentRamadanDay || 1);
  const [activeTab, setActiveTab] = useState('calendar');

  useEffect(() => {
    if (currentRamadanDay) setSelectedDay(currentRamadanDay);
  }, [currentRamadanDay]);

  // Get Fajr (Imsak/Suhoor) and Maghrib (Iftar) times from today's prayer data
  const suhoorTime = prayers.find(p => p.key === 'fajr')?.time24 || '';
  const iftarTime = prayers.find(p => p.key === 'maghrib')?.time24 || '';
  const fmtTime = (t: string) => (!t ? '—' : is12h ? to12Hour(t) : t);

  const isLastTenNights = selectedDay >= 21;
  const isOddNight = selectedDay % 2 === 1;
  const isPotentialLaylatAlQadr = isLastTenNights && isOddNight;

  const todayDua = ramadanDailyDuas.find(d => d.day === selectedDay);
  const dayOfWeek = arabicDayNames[new Date().getDay()];

  return (
    <div className="min-h-screen pb-24" dir="rtl">
      <PageHeader title="تقويم رمضان ١٤٤٧" backTo="/" />

      {/* Ramadan Progress Hero */}
      <div className="px-4 mb-4">
        <div className={cn(
          "relative overflow-hidden rounded-2xl p-5",
          "bg-gradient-to-br from-primary/90 via-primary to-islamic-emerald/80 text-primary-foreground"
        )}>
          {/* Decorative */}
          <div className="absolute top-2 left-4 opacity-20 text-5xl">🌙</div>
          <div className="absolute bottom-2 right-4 opacity-15 text-4xl">✨</div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xl font-bold">رمضان كريم 🌙</h2>
                <p className="text-sm opacity-80 mt-1">
                  {currentRamadanDay ? `اليوم ${currentRamadanDay} من 30` : 'رمضان ١٤٤٧ هـ'}
                </p>
              </div>
              <div className="text-left">
                <p className="text-xs opacity-70">{dayOfWeek}</p>
                <p className="text-lg font-bold">{currentRamadanDay || '—'}/30</p>
              </div>
            </div>

            {/* Progress bar */}
            {currentRamadanDay && (
              <div className="w-full bg-primary-foreground/20 rounded-full h-2 mb-3">
                <motion.div
                  className="bg-accent h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentRamadanDay / 30) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            )}

            {/* Suhoor & Iftar */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-primary-foreground/15 rounded-xl p-3 text-center backdrop-blur-sm">
                <Sunrise className="h-5 w-5 mx-auto mb-1 opacity-80" />
                <p className="text-xs opacity-70">الإمساك / السحور</p>
                <p className="text-lg font-bold">{fmtTime(suhoorTime)}</p>
              </div>
              <div className="bg-primary-foreground/15 rounded-xl p-3 text-center backdrop-blur-sm">
                <Sun className="h-5 w-5 mx-auto mb-1 opacity-80" />
                <p className="text-xs opacity-70">الإفطار / المغرب</p>
                <p className="text-lg font-bold">{fmtTime(iftarTime)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="calendar">📅 التقويم</TabsTrigger>
            <TabsTrigger value="qadr">🌟 ليلة القدر</TabsTrigger>
            <TabsTrigger value="duas">🤲 الأدعية</TabsTrigger>
          </TabsList>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="mt-4">
            {/* Day selector grid */}
            <div className="grid grid-cols-6 gap-1.5 mb-4">
              {Array.from({ length: RAMADAN_DAYS }, (_, i) => i + 1).map(day => (
                <motion.button
                  key={day}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "relative h-10 rounded-lg text-sm font-semibold transition-all",
                    day === selectedDay
                      ? "bg-primary text-primary-foreground shadow-md"
                      : day === currentRamadanDay
                        ? "bg-accent/20 text-accent-foreground ring-1 ring-accent"
                        : currentRamadanDay && day < currentRamadanDay
                          ? "bg-muted/50 text-muted-foreground"
                          : "bg-card text-foreground border border-border/50",
                    day >= 21 && day % 2 === 1 && "ring-1 ring-accent/50"
                  )}
                >
                  {day}
                  {day >= 21 && day % 2 === 1 && (
                    <Star className="absolute -top-1 -right-1 h-3 w-3 text-accent fill-accent" />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Selected day details */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDay}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {/* Day header */}
                <div className={cn(
                  "rounded-xl p-4",
                  isPotentialLaylatAlQadr
                    ? "bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30"
                    : "bg-card border border-border/50"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    {isPotentialLaylatAlQadr && <Sparkles className="h-5 w-5 text-accent" />}
                    <h3 className="font-bold text-foreground">
                      اليوم {selectedDay} من رمضان
                    </h3>
                    {isPotentialLaylatAlQadr && (
                      <span className="text-xs bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-full">
                        ليلة وتر ✨
                      </span>
                    )}
                  </div>
                  {isPotentialLaylatAlQadr && (
                    <p className="text-sm text-muted-foreground">
                      قد تكون ليلة القدر — أكثر من الدعاء والعبادة
                    </p>
                  )}
                </div>

                {/* Daily dua */}
                {todayDua && (
                  <div className="bg-card rounded-xl p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <h4 className="text-sm font-semibold text-foreground">{todayDua.reference}</h4>
                    </div>
                    <p className="text-base leading-loose text-foreground font-amiri text-center">
                      {todayDua.dua}
                    </p>
                  </div>
                )}

                {/* Prayer times for today */}
                <div className="bg-card rounded-xl p-4 border border-border/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold text-foreground">أوقات الصلاة اليوم</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {prayers.map(p => (
                      <div key={p.key} className="flex justify-between items-center py-1.5 px-2 rounded-lg bg-muted/30">
                        <span className="text-sm text-muted-foreground capitalize">
                          {p.key === 'fajr' ? 'الفجر' : p.key === 'sunrise' ? 'الشروق' : p.key === 'dhuhr' ? 'الظهر' : p.key === 'asr' ? 'العصر' : p.key === 'maghrib' ? 'المغرب' : 'العشاء'}
                        </span>
                        <span className="text-sm font-semibold text-foreground">{p.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* Laylat al-Qadr Tab */}
          <TabsContent value="qadr" className="mt-4 space-y-4">
            {/* Hero */}
            <div className="bg-gradient-to-br from-accent/20 via-primary/10 to-accent/5 rounded-2xl p-5 border border-accent/20 text-center">
              <div className="text-4xl mb-2">🌟</div>
              <h3 className="text-xl font-bold text-foreground mb-2">ليلة القدر</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                خيرٌ من ألف شهر — تحرّاها في العشر الأواخر من رمضان في الليالي الوترية
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {[21, 23, 25, 27, 29].map(night => (
                  <span
                    key={night}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-semibold",
                      currentRamadanDay === night
                        ? "bg-accent text-accent-foreground"
                        : "bg-accent/15 text-accent-foreground"
                    )}
                  >
                    ليلة {night} {currentRamadanDay === night ? '📍' : ''}
                  </span>
                ))}
              </div>
            </div>

            {/* Dua of Laylat al-Qadr */}
            <div className="bg-card rounded-xl p-5 border border-border/50">
              <h4 className="font-bold text-foreground mb-1">الدعاء الأعظم لليلة القدر</h4>
              <p className="text-xs text-muted-foreground mb-3">عن عائشة رضي الله عنها — رواه الترمذي</p>
              <div className="bg-primary/5 rounded-xl p-4 text-center">
                <p className="text-xl font-amiri leading-loose text-foreground">
                  اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي
                </p>
              </div>
            </div>

            {/* More Duas */}
            <div className="space-y-2">
              <h4 className="font-bold text-foreground px-1">أدعية مستحبة في ليلة القدر</h4>
              {laylatAlQadrDuas.slice(1).map((dua, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl p-4 border border-border/50"
                >
                  <p className="text-base font-amiri leading-loose text-foreground text-center">
                    {dua}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* What to do */}
            <div className="bg-card rounded-xl p-4 border border-border/50">
              <h4 className="font-bold text-foreground mb-3">ماذا تفعل في ليلة القدر؟</h4>
              <div className="space-y-2">
                {[
                  { emoji: '🤲', text: 'الإكثار من الدعاء والاستغفار' },
                  { emoji: '📖', text: 'تلاوة القرآن الكريم' },
                  { emoji: '🕌', text: 'صلاة التراويح والقيام' },
                  { emoji: '💰', text: 'الصدقة والإنفاق' },
                  { emoji: '🙏', text: 'الاعتكاف في المسجد' },
                  { emoji: '💭', text: 'التفكر والتأمل' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                    <span className="text-lg">{item.emoji}</span>
                    <span className="text-sm text-foreground">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Daily Duas Tab */}
          <TabsContent value="duas" className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground text-center mb-2">
              دعاء لكل يوم من أيام رمضان المبارك
            </p>
            {ramadanDailyDuas.map((dua, i) => {
              const isToday = dua.day === currentRamadanDay;
              const isPassed = currentRamadanDay ? dua.day < currentRamadanDay : false;
              return (
                <motion.div
                  key={dua.day}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className={cn(
                    "rounded-xl p-4 border transition-all",
                    isToday
                      ? "bg-primary/10 border-primary/30 ring-2 ring-primary/20"
                      : "bg-card border-border/50",
                    isPassed && !isToday && "opacity-60"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                        isToday ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        {dua.day}
                      </span>
                      <span className="text-xs text-muted-foreground">{dua.reference}</span>
                    </div>
                    {isToday && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold">اليوم</span>}
                    {dua.day >= 21 && dua.day % 2 === 1 && (
                      <Star className="h-3.5 w-3.5 text-accent fill-accent" />
                    )}
                  </div>
                  <p className="text-sm font-amiri leading-relaxed text-foreground">
                    {dua.dua}
                  </p>
                </motion.div>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>

      {/* Links to other Ramadan features */}
      <div className="px-4 mb-4 space-y-2">
        <Link to="/ramadan-book" className="flex items-center justify-between rounded-2xl bg-card border border-border/50 p-3.5 active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-lg">📖</div>
            <div>
              <p className="text-sm font-bold text-foreground">كتاب رمضان الشامل</p>
              <p className="text-[10px] text-muted-foreground">أحكام • آداب • برنامج عبادة</p>
            </div>
          </div>
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </Link>
        <Link to="/ramadan-cards" className="flex items-center justify-between rounded-2xl bg-card border border-border/50 p-3.5 active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-accent/10 flex items-center justify-center text-lg">🎨</div>
            <div>
              <p className="text-sm font-bold text-foreground">بطاقات رمضان</p>
              <p className="text-[10px] text-muted-foreground">شارك التهاني والأدعية</p>
            </div>
          </div>
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}
