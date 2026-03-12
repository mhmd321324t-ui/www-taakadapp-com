import { useLocale } from '@/hooks/useLocale';
import { useUnifiedPrayer } from '@/hooks/useUnifiedPrayer';
import { Clock, Sun, Sunrise, Sunset, Moon, CloudSun, Share2, MapPin, Building2, Unlink } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const {
    prayers, nextPrayer, remaining, hijriDate, loading,
    source, sourceLabel, mosqueName, city, unlinkMosque,
  } = useUnifiedPrayer();

  const today = new Date();
  const dayName = today.toLocaleDateString('ar-EG', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleShare = async () => {
    const prayerText = prayers
      .map(p => `${t(p.key)}: ${p.time}`)
      .join('\n');
    const shareText = `🕌 مواقيت الصلاة - ${sourceLabel}\n${dayName}، ${dateStr}\n${hijriDate}\n\n${prayerText}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'مواقيت الصلاة', text: shareText });
      } catch {}
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success('تم نسخ مواقيت الصلاة');
    }
  };

  return (
    <div className="min-h-screen pb-24" dir="rtl">
      <PageHeader
        title={t('prayerTimes')}
        subtitle={`${dayName}، ${dateStr}`}
        image="https://images.unsplash.com/photo-1466442929976-97f336a657be?w=1200&q=85"
        actionsLeft={
          <button className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 transition-all active:scale-95" onClick={handleShare}>
            <Share2 className="h-4 w-4 text-white" />
          </button>
        }
      />

      {/* Source indicator */}
      <div className="px-5 -mt-8 relative z-10 mb-5">
        <div className="rounded-3xl bg-card border border-border/50 p-4 shadow-elevated">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              {source === 'mosque' ? (
                <Building2 className="h-5 w-5 text-primary" />
              ) : (
                <MapPin className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate" data-testid="prayer-source-label">
                {sourceLabel}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {source === 'mosque' ? 'أوقات المسجد' : city || ''} {hijriDate ? `• ${hijriDate}` : ''}
              </p>
            </div>
            {source === 'mosque' && (
              <button
                onClick={() => { unlinkMosque(); toast.success('تم إلغاء ربط المسجد'); }}
                className="flex items-center gap-1 text-xs text-destructive bg-destructive/10 px-3 py-1.5 rounded-xl"
                data-testid="unlink-mosque-btn"
              >
                <Unlink className="h-3 w-3" />
                إلغاء
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Prayer List */}
      <div className="px-5 mb-5">
        <SectionHeader icon={Clock} title="أوقات الصلاة اليوم" />
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
                  data-testid={`prayer-row-${prayer.key}`}
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
            {remaining && <p className="text-sm text-muted-foreground mt-1">متبقي {remaining}</p>}
          </div>
        </div>
      )}

      {/* Mosque times link */}
      <div className="px-5 mb-5">
        <button
          onClick={() => navigate('/mosque-times')}
          className="w-full rounded-2xl border border-border/50 bg-card p-4 shadow-elevated flex items-center gap-3 transition-all active:scale-[0.98] hover:border-primary/30"
          data-testid="mosque-times-link"
        >
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 text-start">
            <p className="text-sm font-bold text-foreground">
              {source === 'mosque' ? 'تغيير المسجد' : 'اختر مسجدك'}
            </p>
            <p className="text-xs text-muted-foreground">ابحث عن مسجدك القريب واختر أوقاته</p>
          </div>
        </button>
      </div>
    </div>
  );
}
