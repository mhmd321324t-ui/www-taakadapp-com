import { useState, useEffect } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { usePrayerTimes, getNextPrayer } from '@/hooks/usePrayerTimes';
import { useAthanNotifications, requestNotificationPermission } from '@/hooks/useAthanNotifications';
import { Link } from 'react-router-dom';
import { MapPin, Compass, BookOpen, Heart, Calculator, Moon, Bell, BellOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const quickAccessItems = [
  { icon: Compass, labelKey: 'qibla', path: '/qibla', color: 'bg-primary/10 text-primary' },
  { icon: BookOpen, labelKey: 'quran', path: '/quran', color: 'bg-islamic-green/10 text-islamic-green' },
  { icon: Heart, labelKey: 'tasbeeh', path: '/tasbeeh', color: 'bg-accent/10 text-accent-foreground' },
  { icon: Moon, labelKey: 'duas', path: '/duas', color: 'bg-secondary text-secondary-foreground' },
  { icon: Calculator, labelKey: 'zakatCalculator', path: '/zakat', color: 'bg-islamic-gold/10 text-islamic-gold' },
];

export default function Index() {
  const { t, isRTL } = useLocale();
  const location = useGeoLocation();
  const { prayers, hijriDate, loading } = usePrayerTimes(location.latitude, location.longitude);
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
        toast.success('تم تفعيل إشعارات الأذان 🔔');
      } else {
        toast.error('لم يتم السماح بالإشعارات');
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem('athan-notifications', 'false');
      toast.success('تم إيقاف إشعارات الأذان');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="gradient-islamic islamic-pattern relative overflow-hidden px-5 pb-8 pt-12">
        <div className="relative z-10">
          {/* Location */}
          <div className="flex items-center gap-1.5 text-primary-foreground/80 text-sm mb-6">
            <MapPin className="h-3.5 w-3.5" />
            <span>{location.loading ? '...' : `${location.city}, ${location.country}`}</span>
          </div>

          {/* Next Prayer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-primary-foreground"
          >
            <p className="text-sm opacity-80 mb-1">{t('nextPrayer')}</p>
            <h1 className="text-4xl font-bold font-arabic mb-2">
              {nextPrayer ? t(nextPrayer.key) : '—'}
            </h1>
            <p className="text-5xl font-light tabular-nums tracking-tight mb-2">
              {nextPrayer?.time || '—'}
            </p>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-4 py-1.5 text-sm backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-islamic-gold animate-pulse-glow" />
              <span>{t('timeRemaining')}: {remaining || '—'}</span>
            </div>
          </motion.div>
        </div>

        {/* Decorative arc */}
        <div className="absolute -bottom-6 left-0 right-0 h-12 rounded-t-[50%] bg-background" />
      </div>

      {/* Hijri Date */}
      <div className="px-5 -mt-1 mb-5">
        <div className="rounded-xl border border-border bg-card p-4 text-center shadow-sm">
          <p className="text-xs text-muted-foreground mb-0.5">{t('hijriDate')}</p>
          <p className="text-lg font-arabic font-bold text-foreground">
            {loading ? '...' : hijriDate}
          </p>
        </div>
      </div>

      {/* Today's Prayers Mini */}
      <div className="px-5 mb-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">{t('prayerTimes')}</h2>
        <div className="grid grid-cols-3 gap-2">
          {prayers.filter(p => p.key !== 'sunrise').map((prayer, i) => {
            const isNext = nextPrayer?.key === prayer.key;
            return (
              <motion.div
                key={prayer.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  'rounded-xl border p-3 text-center transition-all',
                  isNext
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border bg-card'
                )}
              >
                <p className={cn('text-xs mb-1', isNext ? 'text-primary font-semibold' : 'text-muted-foreground')}>
                  {t(prayer.key)}
                </p>
                <p className={cn('text-lg font-semibold tabular-nums', isNext ? 'text-primary' : 'text-foreground')}>
                  {prayer.time}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Quick Access */}
      <div className="px-5 mb-8">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">{t('quickAccess')}</h2>
        <div className="grid grid-cols-3 gap-3">
          {quickAccessItems.map((item, i) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
            >
              <Link
                to={item.path}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                <div className={cn('rounded-full p-2.5', item.color)}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-foreground">{t(item.labelKey)}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
