import { useLocale } from '@/hooks/useLocale';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { usePrayerTimes, getNextPrayer } from '@/hooks/usePrayerTimes';
import { MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const prayerIcons: Record<string, string> = {
  fajr: '🌅',
  sunrise: '☀️',
  dhuhr: '🌞',
  asr: '🌤️',
  maghrib: '🌅',
  isha: '🌙',
};

export default function PrayerTimes() {
  const { t } = useLocale();
  const location = useGeoLocation();
  const { prayers, hijriDate, loading } = usePrayerTimes(
    location.latitude,
    location.longitude,
    location.calculationMethod
  );
  const { prayer: nextPrayer } = getNextPrayer(prayers);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="gradient-islamic px-5 pb-6 pt-12">
        <h1 className="text-2xl font-bold text-primary-foreground mb-1">{t('prayerTimes')}</h1>
        <div className="flex items-center gap-1.5 text-primary-foreground/70 text-sm">
          <MapPin className="h-3.5 w-3.5" />
          <span>{location.city}, {location.country}</span>
        </div>
        <p className="text-primary-foreground/60 text-xs mt-2 font-arabic">{hijriDate}</p>
        <div className="absolute -bottom-6 left-0 right-0 h-12 rounded-t-[50%] bg-background" />
      </div>

      {/* Prayer List */}
      <div className="px-5 pt-2 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Clock className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          prayers.map((prayer, i) => {
            const isNext = nextPrayer?.key === prayer.key;
            return (
              <motion.div
                key={prayer.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className={cn(
                  'flex items-center justify-between rounded-xl border p-4 transition-all',
                  isNext
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border bg-card'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{prayerIcons[prayer.key]}</span>
                  <div>
                    <p className={cn(
                      'font-semibold',
                      isNext ? 'text-primary' : 'text-foreground'
                    )}>
                      {t(prayer.key)}
                    </p>
                    {isNext && (
                      <span className="text-xs text-primary/70">{t('nextPrayer')}</span>
                    )}
                  </div>
                </div>
                <p className={cn(
                  'text-xl font-semibold tabular-nums',
                  isNext ? 'text-primary' : 'text-foreground'
                )}>
                  {prayer.time}
                </p>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
