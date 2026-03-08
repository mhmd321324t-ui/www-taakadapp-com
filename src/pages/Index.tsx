import { useState, useEffect } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { useAuth } from '@/hooks/useAuth';
import { usePrayerTimes, getNextPrayer } from '@/hooks/usePrayerTimes';
import { useAthanNotifications, requestNotificationPermission } from '@/hooks/useAthanNotifications';
import HijriCalendar from '@/components/HijriCalendar';
import { Link } from 'react-router-dom';
import { Compass, BookOpen, Heart, Calculator, Moon, Bell, BellOff, ChevronLeft, User, CheckCircle2, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import meccaImage from '@/assets/mecca.jpg';

const quickAccessItems = [
  { icon: Heart, labelKey: 'tasbeeh', path: '/tasbeeh', color: 'text-primary' },
  { icon: Compass, labelKey: 'qibla', path: '/qibla', color: 'text-primary' },
  { icon: BookOpen, labelKey: 'quran', path: '/quran', color: 'text-primary' },
  { icon: Moon, labelKey: 'duas', path: '/duas', color: 'text-primary' },
  { icon: MessageSquare, label: 'قصص', path: '/stories', color: 'text-primary' },
  { icon: Calculator, labelKey: 'zakatCalculator', path: '/zakat', color: 'text-primary' },
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

  // Load real daily goals
  const [prayersDone, setPrayersDone] = useState(0);
  const [tasbeehDone, setTasbeehDone] = useState(0);

  useEffect(() => {
    const todayKey = new Date().toISOString().split('T')[0];
    // Prayer tracker
    const prayerData = localStorage.getItem('prayer-tracker');
    if (prayerData) {
      const parsed = JSON.parse(prayerData);
      setPrayersDone(parsed[todayKey]?.length || 0);
    }
    // Tasbeeh - count completed dhikr types
    const tasbeehTotal = parseInt(localStorage.getItem('tasbeeh-total') || '0');
    setTasbeehDone(Math.min(tasbeehTotal > 0 ? 1 : 0, 4));
  }, []);

  // Countdown circle progress
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!remaining || !nextPrayer) return;
    const parts = remaining.split(':');
    const totalSecs = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + (parseInt(parts[2]) || 0);
    // Approximate: max prayer gap is ~6 hours
    const maxSecs = 6 * 3600;
    setProgress(Math.max(0, Math.min(1, 1 - totalSecs / maxSecs)));
  }, [remaining, nextPrayer]);

  useAthanNotifications(prayers, notificationsEnabled);

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

  // SVG circle params
  const circleR = 52;
  const circleC = 2 * Math.PI * circleR;
  const strokeDashoffset = circleC * (1 - progress);

  // Get fajr and maghrib for Ramadan bar
  const fajrTime = prayers.find(p => p.key === 'fajr')?.time || '--:--';
  const maghribTime = prayers.find(p => p.key === 'maghrib')?.time || '--:--';

  return (
    <div className="min-h-screen pb-safe" dir="rtl">
      {/* Header with Mecca image */}
      <div className="relative">
        <img
          src={meccaImage}
          alt="المسجد الحرام"
          className="w-full h-48 object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-background" />
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-3">
          <button
            onClick={toggleNotifications}
            className="p-2 rounded-full bg-black/30 backdrop-blur-sm"
          >
            {notificationsEnabled ? (
              <Bell className="h-4 w-4 text-white fill-current" />
            ) : (
              <BellOff className="h-4 w-4 text-white" />
            )}
          </button>
          <div className="text-center">
            <p className="text-white font-semibold text-sm">
              {location.loading ? '...' : location.city}
            </p>
            <p className="text-white/70 text-xs font-arabic">
              {loading ? '...' : hijriDate}
            </p>
          </div>
          <div className="w-8" />
        </div>
      </div>

      {/* Goals card */}
      <div className="px-4 -mt-10 relative z-10 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card border border-border p-4 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">أكمل أهداف اليوم</p>
              <div className="flex gap-3 mt-1">
                <span className="flex items-center gap-1 text-[10px]">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground">{prayersDone}/5 الصلاة</span>
                </span>
                <span className="flex items-center gap-1 text-[10px]">
                  <span className="h-2 w-2 rounded-full bg-islamic-teal" />
                  <span className="text-muted-foreground">0/1 القرآن</span>
                </span>
                <span className="flex items-center gap-1 text-[10px]">
                  <span className="h-2 w-2 rounded-full bg-islamic-gold" />
                  <span className="text-muted-foreground">{tasbeehDone}/4 ذكر</span>
                </span>
              </div>
            </div>
          </div>
          <Link
            to="/tracker"
            className="block w-full text-center rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-semibold"
          >
            متابعة الصلاة اليوم
          </Link>
        </motion.div>
      </div>

      {/* Next prayer + countdown */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Next Prayer card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-card border border-border p-4 flex flex-col items-center justify-center"
          >
            <CheckCircle2 className="h-5 w-5 text-muted-foreground mb-1" />
            <p className="text-lg font-bold text-foreground">
              {nextPrayer ? t(nextPrayer.key) : '—'}
            </p>
            <p className="text-2xl font-light tabular-nums text-muted-foreground">
              {nextPrayer?.time || '—'}
            </p>
          </motion.div>

          {/* Countdown circle */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl bg-card border border-border p-4 flex items-center justify-center"
          >
            <div className="relative">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle
                  cx="60" cy="60" r={circleR}
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="6"
                />
                <circle
                  cx="60" cy="60" r={circleR}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circleC}
                  strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90 60 60)"
                  className="transition-all duration-1000"
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

      {/* Ramadan Fajr/Maghrib bar */}
      <div className="px-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl gradient-prayer-bar p-4 flex items-center justify-between"
        >
          <div className="text-white text-sm">
            <span className="text-white/60 text-xs">إفطار</span>
            <p className="font-semibold tabular-nums">{maghribTime}</p>
          </div>
          <span className="text-2xl">🌙</span>
          <div className="text-white text-sm text-left">
            <span className="text-white/60 text-xs">الفجر</span>
            <p className="font-semibold tabular-nums">{fajrTime}</p>
          </div>
        </motion.div>
      </div>

      {/* Today's Prayers */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">{t('prayerTimes')}</h2>
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
                  'rounded-2xl border p-3 text-center transition-all',
                  isNext
                    ? 'border-primary/50 bg-primary/10 shadow-sm'
                    : 'border-border bg-card'
                )}
              >
                <p className={cn('text-[10px] mb-0.5', isNext ? 'text-primary font-bold' : 'text-muted-foreground')}>
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

      {/* Quick Access */}
      <div className="px-4 mb-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">{t('quickAccess')}</h2>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {quickAccessItems.map((item, i) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.04 }}
              className="flex-shrink-0"
            >
              <Link
                to={item.path}
                className="flex flex-col items-center gap-2"
              >
                <div className="h-14 w-14 rounded-2xl bg-card border border-border flex items-center justify-center shadow-sm">
                  <item.icon className={cn('h-6 w-6', item.color)} />
                </div>
                <span className="text-[10px] font-medium text-foreground">{t(item.labelKey)}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Dua of the day */}
      <div className="px-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl bg-card border border-border p-5"
        >
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-3">
            دعاء اليوم
          </span>
          <p className="text-sm font-bold text-foreground mb-2">قل هذه الكلمات عند الشدة</p>
          <p className="text-lg font-arabic text-foreground leading-[2] text-center mb-3">
            اللَّهُ اللَّهُ رَبِّي لَا أُشْرِكُ بِهِ شَيْئًا
          </p>
          <Link
            to="/duas"
            className="inline-block rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground"
          >
            اقرأ مع الترجمة
          </Link>
        </motion.div>
      </div>

      {/* Quran goal card */}
      <div className="px-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-card border border-border p-5"
        >
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-3">
            إتمام القرآن
          </span>
          <p className="text-sm font-bold text-foreground mb-1">ابدأ تلاوة القرآن يوميًا</p>
          <p className="text-xs text-muted-foreground mb-3">حدّد وتيرتك، احصل على تذكيرات يومية وتابع تقدمك</p>
          <Link
            to="/quran"
            className="inline-block rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground"
          >
            حدّد هدف القرآن
          </Link>
        </motion.div>
      </div>

      {/* Hijri Calendar */}
      <div className="px-4 mb-8">
        <h2 className="text-sm font-semibold text-foreground mb-3">{t('hijriCalendar')}</h2>
        <HijriCalendar
          hijriDay={hijriDay}
          hijriMonth={hijriMonthNumber || undefined}
          hijriYear={hijriYear}
        />
      </div>
    </div>
  );
}
