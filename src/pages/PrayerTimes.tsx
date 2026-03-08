import { useLocale } from '@/hooks/useLocale';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { usePrayerTimes, getNextPrayer } from '@/hooks/usePrayerTimes';
import { Clock, Sun, Sunrise, Sunset, Moon, CloudSun, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const prayerIcons: Record<string, React.ReactNode> = {
  fajr: <Sunrise className="h-6 w-6" />,
  sunrise: <Sun className="h-6 w-6" />,
  dhuhr: <Sun className="h-6 w-6" />,
  asr: <CloudSun className="h-6 w-6" />,
  maghrib: <Sunset className="h-6 w-6" />,
  isha: <Moon className="h-6 w-6" />,
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

  const today = new Date();
  const dayName = today.toLocaleDateString('ar-EG', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleShare = async () => {
    const prayerText = prayers
      .map(p => `${t(p.key)}: ${p.time}`)
      .join('\n');
    const shareText = `🕌 مواقيت الصلاة - ${location.city || ''}\n${dayName}، ${dateStr}\n${hijriDate}\n\n${prayerText}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'مواقيت الصلاة', text: shareText });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success('تم نسخ مواقيت الصلاة');
    }
  };

  return (
    <div className="min-h-screen pb-safe" dir="rtl">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-xl font-bold text-foreground text-center">{t('prayerTimes')}</h1>
      </div>

      {/* Date + share */}
      <div className="px-5 mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{dayName}، {dateStr}</p>
        <button className="p-2" onClick={handleShare}>
          <Share2 className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <div className="border-t border-border" />

      {/* Prayer List */}
      <div className="px-5 py-2">
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  'flex items-center justify-between py-5 border-b border-border last:border-b-0',
                  isNext && 'bg-primary/5 -mx-5 px-5 rounded-xl border-b-0'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'flex items-center justify-center',
                    isNext ? 'text-primary' : 'text-primary'
                  )}>
                    <div className="relative">
                      <div className={cn(
                        'h-6 w-6 rounded-full border-2 flex items-center justify-center',
                        isNext ? 'border-primary bg-primary' : 'border-primary'
                      )}>
                        {isNext && <div className="h-2 w-2 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>
                  <p className={cn(
                    'text-lg tabular-nums font-semibold',
                    isNext ? 'text-primary' : 'text-foreground'
                  )}>
                    {prayer.time}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <p className={cn(
                    'font-semibold text-lg',
                    isNext ? 'text-primary' : 'text-foreground'
                  )}>
                    {t(prayer.key)}
                  </p>
                  <span className={cn(
                    isNext ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {prayerIcons[prayer.key]}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Location info */}
      <div className="px-5 mt-4 mb-8">
        <div className="rounded-2xl bg-card border border-border p-4">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <p className="text-sm font-bold text-foreground">📍 {location.city || '...'}</p>
              <p className="text-xs text-muted-foreground">{location.country || ''} • {hijriDate}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
