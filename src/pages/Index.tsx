import { useState } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { usePrayerTimes, getNextPrayer } from '@/hooks/usePrayerTimes';
import { useAthanNotifications, requestNotificationPermission } from '@/hooks/useAthanNotifications';
import HijriCalendar from '@/components/HijriCalendar';
import MosqueScene from '@/components/MosqueScene';
import { Link } from 'react-router-dom';
import { MapPin, Compass, BookOpen, Heart, Calculator, Moon, Bell, BellOff, Clock, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const quickAccessItems = [
  { icon: Compass, labelKey: 'qibla', path: '/qibla', gradient: 'from-primary to-accent' },
  { icon: BookOpen, labelKey: 'quran', path: '/quran', gradient: 'from-accent to-islamic-teal' },
  { icon: Heart, labelKey: 'tasbeeh', path: '/tasbeeh', gradient: 'from-primary to-islamic-purple' },
  { icon: Moon, labelKey: 'duas', path: '/duas', gradient: 'from-accent to-primary' },
  { icon: Calculator, labelKey: 'zakatCalculator', path: '/zakat', gradient: 'from-islamic-gold to-accent' },
];

export default function Index() {
  const { t, isRTL } = useLocale();
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

  return (
    <div className="min-h-screen">
      {/* Hero Section with 3D */}
      <div className="gradient-islamic islamic-pattern relative overflow-hidden pb-16 pt-10">
        <div className="relative z-10">
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 mb-2">
            <div className="flex items-center gap-1.5 text-white/70 text-xs">
              <MapPin className="h-3 w-3" />
              <span>{location.loading ? '...' : `${location.city}, ${location.country}`}</span>
            </div>
            <button
              onClick={toggleNotifications}
              className="flex items-center gap-1 rounded-full glass-card px-3 py-1.5 text-xs text-white transition-all active:scale-95"
            >
              {notificationsEnabled ? (
                <Bell className="h-3 w-3 fill-current" />
              ) : (
                <BellOff className="h-3 w-3" />
              )}
              <span>{notificationsEnabled ? '🔔' : '🔕'}</span>
            </button>
          </div>

          {/* 3D Mosque */}
          <MosqueScene />

          {/* Next Prayer overlay */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white px-5 -mt-4"
          >
            <p className="text-xs text-white/60 mb-0.5">{t('nextPrayer')}</p>
            <h1 className="text-3xl font-bold mb-1">
              {nextPrayer ? t(nextPrayer.key) : '—'}
            </h1>
            <p className="text-4xl font-light tabular-nums tracking-tight mb-2">
              {nextPrayer?.time || '—'}
            </p>
            <div className="inline-flex items-center gap-2 rounded-full glass-card px-4 py-1.5 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-glow" />
              <span>{t('timeRemaining')}: {remaining || '—'}</span>
            </div>
          </motion.div>
        </div>

        {/* Curved bottom */}
        <div className="absolute -bottom-6 left-0 right-0 h-12 rounded-t-[50%] bg-background" />
      </div>

      {/* Hijri Date Card */}
      <div className="px-5 -mt-2 mb-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-4 text-center shadow-lg glow-purple"
        >
          <p className="text-[10px] text-muted-foreground mb-0.5">{t('hijriDate')}</p>
          <p className="text-lg font-arabic font-bold text-foreground">
            {loading ? '...' : hijriDate}
          </p>
        </motion.div>
      </div>

      {/* Today's Prayers */}
      <div className="px-5 mb-5">
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
                transition={{ delay: 0.15 + i * 0.04 }}
                className={cn(
                  'rounded-2xl border p-3 text-center transition-all',
                  isNext
                    ? 'border-primary/50 bg-primary/8 shadow-md glow-purple'
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
      <div className="px-5 mb-5">
        <h2 className="text-sm font-semibold text-foreground mb-3">{t('quickAccess')}</h2>
        <div className="grid grid-cols-3 gap-3">
          {quickAccessItems.map((item, i) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 + i * 0.04 }}
            >
              <Link
                to={item.path}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all active:scale-95"
              >
                <div className={cn('rounded-xl p-2.5 bg-gradient-to-br', item.gradient)}>
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-[11px] font-medium text-foreground">{t(item.labelKey)}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Hijri Calendar */}
      <div className="px-5 mb-8">
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
