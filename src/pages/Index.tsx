import { useState, useEffect, useCallback } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { useAuth } from '@/hooks/useAuth';
import { usePrayerTimes, getNextPrayer } from '@/hooks/usePrayerTimes';
import { useAthanNotifications, requestNotificationPermission } from '@/hooks/useAthanNotifications';
import { useAutoTheme } from '@/hooks/useAutoTheme';
import OccasionAthanAlert from '@/components/OccasionAthanAlert';
import OccasionBanner from '@/components/OccasionBanner';
import HijriCalendar from '@/components/HijriCalendar';
import { Link } from 'react-router-dom';
import { Compass, BookOpen, Heart, Calculator, Moon, Bell, BellOff, ChevronLeft, CheckCircle2, MessageSquare, Sparkles } from 'lucide-react';
import QuranPlayer from '@/components/QuranPlayer';
import { AdBanner } from '@/components/AdBanner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import meccaImage from '@/assets/mecca.jpg';
import { getCurrentOccasion, isRamadan } from '@/data/islamicOccasions';

const quickAccessItems = [
  { icon: Heart, labelKey: 'tasbeeh', path: '/tasbeeh', gradient: 'from-primary/20 to-islamic-teal/10' },
  { icon: Compass, labelKey: 'qibla', path: '/qibla', gradient: 'from-accent/20 to-islamic-gold/10' },
  { icon: BookOpen, labelKey: 'quran', path: '/quran', gradient: 'from-primary/20 to-islamic-emerald/10' },
  { icon: Moon, labelKey: 'duas', path: '/duas', gradient: 'from-islamic-purple/20 to-primary/10' },
  { icon: MessageSquare, label: 'قصص', path: '/stories', gradient: 'from-islamic-copper/20 to-accent/10' },
  { icon: Calculator, labelKey: 'zakatCalculator', path: '/zakat', gradient: 'from-islamic-teal/20 to-primary/10' },
];

export default function Index() {
  const { t, isRTL } = useLocale();
  const { user } = useAuth();
  const location = useGeoLocation();
  const { prayers, hijriDate, hijriDay, hijriMonthNumber, hijriYear, loading } = usePrayerTimes(
    location.latitude,
    location.longitude,
    location.calculationMethod
  );
  const { prayer: nextPrayer, remaining } = getNextPrayer(prayers);

  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('athan-notifications') === 'true';
  });

  // Current Islamic occasion
  const currentOccasion = getCurrentOccasion(hijriMonthNumber, hijriDay);

  // Full-screen athan alert state
  const [alertPrayer, setAlertPrayer] = useState<{ key: string; time: string } | null>(null);

  const handleAthanAlert = useCallback((prayerKey: string, prayerTime: string) => {
    setAlertPrayer({ key: prayerKey, time: prayerTime });
  }, []);

  const [prayersDone, setPrayersDone] = useState(0);
  const [tasbeehDone, setTasbeehDone] = useState(0);

  useEffect(() => {
    const todayKey = new Date().toISOString().split('T')[0];
    const prayerData = localStorage.getItem('prayer-tracker');
    if (prayerData) {
      const parsed = JSON.parse(prayerData);
      setPrayersDone(parsed[todayKey]?.length || 0);
    }
    const tasbeehTotal = parseInt(localStorage.getItem('tasbeeh-total') || '0');
    setTasbeehDone(Math.min(tasbeehTotal > 0 ? 1 : 0, 4));
  }, []);

  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!remaining || !nextPrayer) return;
    const parts = remaining.split(':');
    const totalSecs = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + (parseInt(parts[2]) || 0);
    const maxSecs = 6 * 3600;
    setProgress(Math.max(0, Math.min(1, 1 - totalSecs / maxSecs)));
  }, [remaining, nextPrayer]);

  useAthanNotifications(prayers, notificationsEnabled, handleAthanAlert);
  useAutoTheme(prayers);

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationsEnabled(true);
        localStorage.setItem('athan-notifications', 'true');
        toast.success(t('notificationsEnabled'));
      } else {
        toast.error(t('notificationsDenied'));
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem('athan-notifications', 'false');
      toast.success(t('notificationsDisabled'));
    }
  };

  const circleR = 52;
  const circleC = 2 * Math.PI * circleR;
  const strokeDashoffset = isNaN(circleC * (1 - progress)) ? 0 : circleC * (1 - progress);

  const fajrTime = prayers.find(p => p.key === 'fajr')?.time || '--:--';
  const maghribTime = prayers.find(p => p.key === 'maghrib')?.time || '--:--';

  return (
    <div className="min-h-screen pb-24" dir="rtl">
      {/* Full-screen Athan Alert with Occasion support */}
      {alertPrayer && (
        <OccasionAthanAlert
          prayerKey={alertPrayer.key}
          prayerTime={alertPrayer.time}
          occasion={currentOccasion}
          onDismiss={() => setAlertPrayer(null)}
        />
      )}
      <div className="relative overflow-hidden">
        <img
          src={meccaImage}
          alt="المسجد الحرام"
          className="w-full h-56 object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-background" />
        
        {/* Decorative geometric overlay */}
        <div className="absolute inset-0 islamic-pattern opacity-30" />
        
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-[calc(1rem+env(safe-area-inset-top,0px))]">
          <button
            onClick={toggleNotifications}
            className="p-2.5 rounded-2xl bg-black/25 backdrop-blur-xl border border-white/10 transition-all active:scale-95"
          >
            {notificationsEnabled ? (
              <Bell className="h-4 w-4 text-white fill-current" />
            ) : (
              <BellOff className="h-4 w-4 text-white/70" />
            )}
          </button>
          <div className="text-center">
            <p className="text-white font-semibold text-sm tracking-wide">
              {location.loading ? '...' : location.city}
            </p>
            <p className="text-white/60 text-xs font-arabic mt-0.5">
              {loading ? '...' : hijriDate}
            </p>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <AdBanner position="home-top" />

      {/* Islamic Occasion Banner */}
      {currentOccasion && <OccasionBanner occasion={currentOccasion} />}


      {/* Goals card */}
      <div className="px-4 -mt-12 relative z-10 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="rounded-3xl bg-card border border-border/50 p-5 shadow-elevated"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">أكمل أهداف اليوم</p>
              <div className="flex flex-wrap gap-3 mt-1.5">
                <span className="flex items-center gap-1.5 text-xs leading-relaxed">
                  <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                  <span className="text-muted-foreground">{prayersDone}/5 الصلاة</span>
                </span>
                <span className="flex items-center gap-1.5 text-xs leading-relaxed">
                  <span className="h-2 w-2 rounded-full bg-islamic-teal shrink-0" />
                  <span className="text-muted-foreground">0/1 القرآن</span>
                </span>
                <span className="flex items-center gap-1.5 text-xs leading-relaxed">
                  <span className="h-2 w-2 rounded-full bg-accent shrink-0" />
                  <span className="text-muted-foreground">{tasbeehDone}/4 ذكر</span>
                </span>
              </div>
            </div>
          </div>
          <Link
            to="/tracker"
            className="block w-full text-center rounded-2xl bg-primary text-primary-foreground py-3 text-sm font-bold transition-all active:scale-[0.98]"
          >
            متابعة الصلاة اليوم
          </Link>
        </motion.div>
      </div>

      {/* Next prayer + countdown */}
      <div className="px-4 mb-5">
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, type: 'spring', damping: 20 }}
            className="rounded-3xl bg-card border border-border/50 p-5 flex flex-col items-center justify-center shadow-elevated"
          >
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <p className="text-lg font-bold text-foreground">
              {nextPrayer ? t(nextPrayer.key) : '—'}
            </p>
            <p className="text-2xl font-light tabular-nums text-muted-foreground mt-1">
              {nextPrayer?.time || '—'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, type: 'spring', damping: 20 }}
            className="rounded-3xl bg-card border border-border/50 p-5 flex items-center justify-center shadow-elevated"
          >
            <div className="relative">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle
                  cx="60" cy="60" r={circleR}
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="5"
                />
                <circle
                  cx="60" cy="60" r={circleR}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={circleC}
                  strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90 60 60)"
                  className="transition-all duration-1000"
                  style={{ filter: 'drop-shadow(0 0 6px hsl(var(--primary) / 0.3))' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  -{remaining || '00:00'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Ramadan Fajr/Maghrib bar - only in Ramadan */}
      {isRamadan(hijriMonthNumber) && (
        <div className="px-4 mb-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl gradient-prayer-bar p-5 flex items-center justify-between relative overflow-hidden"
          >
            <div className="absolute inset-0 islamic-pattern opacity-20" />
            <div className="text-white text-sm relative z-10">
              <span className="text-white/50 text-xs font-medium uppercase tracking-wider">إفطار</span>
              <p className="font-bold tabular-nums text-lg">{maghribTime}</p>
            </div>
            <span className="text-3xl relative z-10">🌙</span>
            <div className="text-white text-sm text-left relative z-10">
              <span className="text-white/50 text-xs font-medium uppercase tracking-wider">الفجر</span>
              <p className="font-bold tabular-nums text-lg">{fajrTime}</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Today's Prayers */}
      <div className="px-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">{t('prayerTimes')}</h2>
          <Link to="/prayer-times" className="text-xs text-primary font-medium flex items-center gap-0.5">
            {t('more')}
            <ChevronLeft className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {prayers.filter(p => p.key !== 'sunrise').map((prayer, i) => {
            const isNext = nextPrayer?.key === prayer.key;
            return (
              <motion.div
                key={prayer.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.04 }}
                className={cn(
                  'rounded-2xl border p-4 text-center transition-all min-w-0',
                  isNext
                    ? 'border-primary/40 bg-primary/8 shadow-sm glow-emerald'
                    : 'border-border/50 bg-card'
                )}
              >
              <p className={cn('text-xs mb-1 truncate leading-relaxed', isNext ? 'text-primary font-bold' : 'text-muted-foreground')}>
                {t(prayer.key)}
              </p>
              <p className={cn('text-base font-semibold tabular-nums', isNext ? 'text-primary' : 'text-foreground')}>
                  {prayer.time}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AdBanner position="home-middle" />

      {/* Quick Access */}
      <div className="px-4 mb-5">
        <h2 className="text-sm font-bold text-foreground mb-3">{t('quickAccess')}</h2>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
          {quickAccessItems.map((item, i) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.04 }}
            >
              <Link
                to={item.path}
                className="flex flex-col items-center gap-2 min-w-0"
              >
                <div className={cn(
                  'h-14 w-14 rounded-2xl bg-gradient-to-br border border-border/50 flex items-center justify-center shadow-elevated shrink-0 transition-transform active:scale-95',
                  item.gradient
                )}>
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-medium text-foreground text-center w-full break-words leading-tight">
                  {(item as any).label || t((item as any).labelKey)}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Dua of the day */}
      <div className="px-4 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-3xl bg-card border border-border/50 p-6 shadow-elevated relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
          <span className="inline-block rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary mb-3">
            دعاء اليوم
          </span>
          <p className="text-sm font-bold text-foreground mb-3">قل هذه الكلمات عند الشدة</p>
          <p className="text-lg font-arabic text-foreground leading-[2.2] text-center mb-4">
            اللَّهُ اللَّهُ رَبِّي لَا أُشْرِكُ بِهِ شَيْئًا
          </p>
          <Link
            to="/duas"
            className="inline-block rounded-2xl border border-border/50 px-5 py-2.5 text-xs font-semibold text-foreground transition-all active:scale-95 hover:bg-muted/50"
          >
            اقرأ مع الترجمة
          </Link>
        </motion.div>
      </div>

      {/* Quran Audio Player */}
      <QuranPlayer />

      {/* Quran goal card */}
      <div className="px-4 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-3xl bg-card border border-border/50 p-6 shadow-elevated relative overflow-hidden"
        >
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-accent/5 to-transparent rounded-tr-full" />
          <span className="inline-block rounded-full bg-accent/10 border border-accent/20 px-3 py-1 text-xs font-semibold text-accent-foreground mb-3">
            إتمام القرآن
          </span>
          <p className="text-sm font-bold text-foreground mb-1">ابدأ تلاوة القرآن يوميًا</p>
          <p className="text-xs text-muted-foreground mb-4">حدّد وتيرتك، احصل على تذكيرات يومية وتابع تقدمك</p>
          <Link
            to="/quran"
            className="inline-block rounded-2xl border border-border/50 px-5 py-2.5 text-xs font-semibold text-foreground transition-all active:scale-95 hover:bg-muted/50"
          >
            حدّد هدف القرآن
          </Link>
        </motion.div>
      </div>

      {/* Hijri Calendar */}
      <div className="px-4 mb-8">
        <h2 className="text-sm font-bold text-foreground mb-3">{t('hijriCalendar')}</h2>
        <HijriCalendar
          hijriDay={hijriDay}
          hijriMonth={hijriMonthNumber || undefined}
          hijriYear={hijriYear}
        />
      </div>
    </div>
  );
}
