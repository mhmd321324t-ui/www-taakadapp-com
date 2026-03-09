import { useLocale } from '@/hooks/useLocale';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { usePrayerTimes, getNextPrayer } from '@/hooks/usePrayerTimes';
import { Clock, Sun, Sunrise, Sunset, Moon, CloudSun, Share2, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/PageHeader';
import SectionHeader from '@/components/SectionHeader';
import { toast } from 'sonner';

const prayerIcons: Record<string, React.ReactNode> = {
  fajr: <Sunrise className="h-5 w-5" />,
  sunrise: <Sun className="h-5 w-5" />,
  dhuhr: <Sun className="h-5 w-5" />,
  asr: <CloudSun className="h-5 w-5" />,
  maghrib: <Sunset className="h-5 w-5" />,
  isha: <Moon className="h-5 w-5" />,
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
    <div className="min-h-screen pb-24" dir="rtl">
      {/* Header */}
      <div className="gradient-islamic relative px-5 pb-16 pt-safe-header-compact">
        <div className="absolute inset-0 islamic-pattern opacity-20" />
        <div className="flex items-center justify-between relative z-10">
          <button className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 transition-all active:scale-95" onClick={handleShare}>
            <Share2 className="h-4 w-4 text-white" />
          </button>
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold text-white">{t('prayerTimes')}</h1>
            <p className="text-white/70 text-sm mt-1.5 leading-relaxed">{dayName}، {dateStr}</p>
          </div>
          <div className="w-10" />
        </div>
        <div className="absolute -bottom-6 left-0 right-0 h-12 rounded-t-[2rem] bg-background" />
      </div>

      {/* Location card */}
      <div className="px-5 -mt-8 relative z-10 mb-5">
        <div className="rounded-3xl bg-card border border-border/50 p-4 shadow-elevated flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{location.city || '...'}</p>
            <p className="text-xs text-muted-foreground truncate">{location.country || ''} • {hijriDate}</p>
          </div>
        </div>
      </div>

      {/* Prayer List */}
      <div className="px-5 mb-5">
        <h2 className="text-sm font-bold text-foreground mb-3">أوقات الصلاة اليوم</h2>
        <div className="rounded-3xl border border-border/50 bg-card shadow-elevated overflow-hidden divide-y divide-border/50">
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
                    'flex items-center justify-between px-5 py-4',
                    isNext && 'bg-primary/5'
                  )}
                >
                  <p className={cn(
                    'text-lg tabular-nums font-semibold',
                    isNext ? 'text-primary' : 'text-foreground'
                  )}>
                    {prayer.time}
                  </p>

                  <div className="flex items-center gap-3">
                    <p className={cn(
                      'font-semibold',
                      isNext ? 'text-primary' : 'text-foreground'
                    )}>
                      {t(prayer.key)}
                    </p>
                    <div className={cn(
                      'h-9 w-9 rounded-xl flex items-center justify-center',
                      isNext ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    )}>
                      {prayerIcons[prayer.key]}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Next prayer indicator */}
      {nextPrayer && (
        <div className="px-5 mb-5">
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">الصلاة القادمة</p>
            <p className="text-lg font-bold text-primary">{t(nextPrayer.key)} — {nextPrayer.time}</p>
          </div>
        </div>
      )}
    </div>
  );
}