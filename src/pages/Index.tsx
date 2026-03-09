import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import DuaOfDayDrawer from '@/components/DuaOfDayDrawer';
import { dailyDuas } from '@/data/dhikrDetails';
import { useLocale } from '@/hooks/useLocale';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { useAuth } from '@/hooks/useAuth';
import { usePrayerTimes, getNextPrayer } from '@/hooks/usePrayerTimes';
import { useSavedMosqueTimes } from '@/hooks/useSavedMosqueTimes';
import { useAthanNotifications, requestNotificationPermission } from '@/hooks/useAthanNotifications';
import { useAutoTheme } from '@/hooks/useAutoTheme';
import OccasionAthanAlert from '@/components/OccasionAthanAlert';
import OccasionBanner from '@/components/OccasionBanner';
import DailyGoals from '@/components/DailyGoals';
import NotificationCard from '@/components/NotificationCard';
import { Link } from 'react-router-dom';
import { Compass, BookOpen, Heart, Calculator, Moon, Bell, BellOff, ChevronLeft, MessageSquare, Zap, Building2, Unlink, MapPin, MapPinOff, User, Volume2 } from 'lucide-react';
import { AdBanner } from '@/components/AdBanner';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
const meccaImage = '/mecca-hero.webp';
import { getCurrentOccasion, isRamadan } from '@/data/islamicOccasions';

// Lazy load below-the-fold components
const VideoContentCarousel = lazy(() => import('@/components/VideoContentCarousel'));
const QuranPlayer = lazy(() => import('@/components/QuranPlayer'));
const SuggestedGoals = lazy(() => import('@/components/SuggestedGoals'));
const HijriCalendar = lazy(() => import('@/components/HijriCalendar'));

const getQuickAccessItems = (t: (key: string) => string) => [
  { icon: Heart, label: t('quickTasbeeh'), path: '/tasbeeh', gradient: 'from-primary/20 to-primary/5' },
  { icon: Compass, label: t('quickQibla'), path: '/qibla', gradient: 'from-accent/20 to-accent/5' },
  { icon: BookOpen, label: t('quickQuran'), path: '/quran', gradient: 'from-primary/20 to-primary/5' },
  { icon: Moon, label: t('quickDuas'), path: '/duas', gradient: 'from-islamic-purple/20 to-islamic-purple/5' },
  { icon: MessageSquare, label: t('quickStories'), path: '/stories', gradient: 'from-islamic-copper/20 to-accent/5' },
  { icon: Calculator, label: t('quickZakat'), path: '/zakat', gradient: 'from-islamic-teal/20 to-primary/5' },
];

export default function Index() {
  const { t, isRTL } = useLocale();
  const { user } = useAuth();
  const location = useGeoLocation();
  const { prayers: apiPrayers, hijriDate, hijriDay, hijriMonthNumber, hijriYear, loading } = usePrayerTimes(
    location.latitude,
    location.longitude,
    location.calculationMethod
  );
  const { mosqueName, prayers: mosquePrayers, loading: mosqueLoading, unlinkMosque, source: mosqueSource } = useSavedMosqueTimes();
  
  const prayers = mosquePrayers || apiPrayers;
  const usingMosque = !!mosquePrayers;
  const { prayer: nextPrayer, remaining } = getNextPrayer(prayers);

  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('athan-notifications') === 'true';
  });

  const currentOccasion = getCurrentOccasion(hijriMonthNumber, parseInt(hijriDay) || 1);
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
    const hMatch = remaining.match(/(\d+)h/);
    const mMatch = remaining.match(/(\d+)m/);
    const hours = hMatch ? parseInt(hMatch[1]) : 0;
    const mins = mMatch ? parseInt(mMatch[1]) : 0;
    const totalSecs = hours * 3600 + mins * 60;
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

  const circleR = 48;
  const circleC = 2 * Math.PI * circleR;
  const strokeDashoffset = isNaN(circleC * (1 - progress)) ? 0 : circleC * (1 - progress);

  const fajrTime = prayers.find(p => p.key === 'fajr')?.time || '--:--';
  const maghribTime = prayers.find(p => p.key === 'maghrib')?.time || '--:--';

  const ramadanActive = isRamadan(hijriMonthNumber);
  const totalGoals = 5 + (ramadanActive ? 2 : 0);
  const completedGoals = prayersDone + tasbeehDone;
  const overallPercent = Math.round((completedGoals / totalGoals) * 100);

  const [duaDrawerOpen, setDuaDrawerOpen] = useState(false);
  const todayDua = dailyDuas[Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000) % dailyDuas.length];

  const prayerNames: Record<string, string> = {
    fajr: t('fajr'), sunrise: t('sunrise'), dhuhr: t('dhuhr'), asr: t('asr'), maghrib: t('maghrib'), isha: t('isha')
  };

  const prayerIcons: Record<string, string> = {
    fajr: '🌅', sunrise: '☀️', dhuhr: '🕐', asr: '🌤️', maghrib: '🌇', isha: '🌙'
  };

  return (
    <div className="min-h-screen pb-24" dir="rtl">
      <DuaOfDayDrawer open={duaDrawerOpen} onOpenChange={setDuaDrawerOpen} />
      {alertPrayer && (
        <OccasionAthanAlert
          prayerKey={alertPrayer.key}
          prayerTime={alertPrayer.time}
          occasion={currentOccasion}
          onDismiss={() => setAlertPrayer(null)}
        />
      )}

      {/* ===== HERO ===== */}
      <div className="relative overflow-hidden h-[280px]">
        <img
          src={meccaImage}
          alt="المسجد الحرام"
          className="w-full h-full object-cover scale-105"
          loading="eager"
          fetchPriority="high"
          width="1335"
          height="280"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-background" />
        
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 pt-[calc(1rem+env(safe-area-inset-top,0px))]">
          <button
            onClick={toggleNotifications}
            aria-label={notificationsEnabled ? 'إيقاف الإشعارات' : 'تفعيل الإشعارات'}
            className="p-2.5 rounded-2xl bg-black/30 backdrop-blur-xl border border-white/10 transition-all active:scale-95"
          >
            {notificationsEnabled ? (
              <Bell className="h-5 w-5 text-white fill-current" />
            ) : (
              <BellOff className="h-5 w-5 text-white/70" />
            )}
          </button>
          <div className="flex-1" />
          <Link
            to="/account"
            className="p-2.5 rounded-2xl bg-black/30 backdrop-blur-xl border border-white/10 transition-all active:scale-95"
          >
            <User className="h-5 w-5 text-white/90" />
          </Link>
        </div>

        {/* City + Hijri on hero */}
        <div className="absolute bottom-16 left-0 right-0 text-center">
          <p className="text-white/60 text-xs tracking-widest uppercase mb-1">
            {loading ? '...' : hijriDate}
          </p>
          <div className="flex items-center justify-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-white/70" />
            <p className="text-white font-bold text-base">
              {location.loading ? '...' : location.city || 'تحديد الموقع...'}
            </p>
          </div>
        </div>
      </div>

      {/* ===== NEXT PRAYER CARD (overlapping hero) ===== */}
      <div className="px-4 -mt-14 relative z-10 mb-4">
        <div className="rounded-3xl bg-card/95 backdrop-blur-xl border border-border/50 p-5 shadow-elevated animate-fade-in">
          <div className="flex items-center gap-4">
            {/* Countdown circle */}
            <div className="relative shrink-0">
              <svg width="110" height="110" viewBox="0 0 110 110">
                <circle cx="55" cy="55" r={circleR} fill="none" stroke="hsl(var(--border))" strokeWidth="4" opacity="0.5" />
                <circle
                  cx="55" cy="55" r={circleR}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circleC}
                  strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90 55 55)"
                  className="transition-all duration-1000"
                  style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.4))' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] text-muted-foreground mb-0.5">{t('remaining')}</span>
                <span className="text-lg font-bold tabular-nums text-foreground leading-none">
                  {remaining || '00:00'}
                </span>
              </div>
            </div>

            {/* Next prayer info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">{t('nextPrayerLabel')}</p>
              <p className="text-2xl font-bold text-foreground leading-tight">
                {nextPrayer ? prayerNames[nextPrayer.key] || t(nextPrayer.key) : '—'}
              </p>
              <p className="text-xl font-light tabular-nums text-primary mt-1">
                {nextPrayer?.time || '—'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Link
                  to="/tracker"
                  className="text-xs text-primary font-bold bg-primary/10 px-3 py-1.5 rounded-xl transition-all active:scale-95"
                >
                  {t('prayerTracking')}
                </Link>
                <Link
                  to="/notifications"
                  className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-xl transition-all active:scale-95"
                >
                  <Volume2 className="h-3 w-3 inline me-1" />
                  {t('athanLabel')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== OCCASION BANNER ===== */}
      {currentOccasion && <OccasionBanner occasion={currentOccasion} />}

      {/* ===== LOCATION ERROR ===== */}
      {location.error && prayers.length === 0 && (
        <div className="px-4 mb-4">
          <div className="rounded-3xl bg-destructive/10 border border-destructive/30 p-5 flex flex-col items-center gap-3">
            <MapPinOff className="h-8 w-8 text-destructive" />
            <p className="text-sm font-bold text-foreground text-center">{location.error}</p>
            <button
              onClick={() => location.detectLocation()}
              className="rounded-2xl bg-primary text-primary-foreground px-6 py-2.5 text-sm font-bold transition-all active:scale-95"
            >
              {t('enableLocation')}
            </button>
          </div>
        </div>
      )}

      <AdBanner position="home-top" />

      {/* ===== PRAYER TIMES GRID ===== */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🕌</span>
            <h3 className="text-sm font-bold text-foreground">{t('prayerTimes')}</h3>
          </div>
          <Link to="/prayer-times" className="text-xs text-primary font-semibold flex items-center gap-0.5">
            {t('moreLabel')}
            <ChevronLeft className="h-3.5 w-3.5" />
          </Link>
        </div>
        
        {usingMosque && mosqueName && (
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-[11px] text-primary flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              {mosqueName}
              {mosqueSource === 'mawaqit' && (
                <span className="bg-primary/15 text-primary text-[8px] px-1.5 py-0.5 rounded-full font-bold">{t('liveLabel')}</span>
              )}
            </p>
            <button
              onClick={() => {
                unlinkMosque();
                toast.success(t('mosqueUnlinked'));
              }}
              className="flex items-center gap-0.5 text-[10px] text-destructive"
            >
              <Unlink className="h-2.5 w-2.5" />
              {t('unlinkMosque')}
            </button>
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-2">
          {prayers.map((prayer) => {
            const isNext = nextPrayer?.key === prayer.key;
            return (
              <div
                key={prayer.key}
                className={cn(
                  'rounded-2xl border p-3 text-center transition-all',
                  isNext
                    ? 'border-primary/40 bg-primary/8 glow-emerald'
                    : 'border-border/40 bg-card/80'
                )}
              >
                <span className="text-base mb-1 block">{prayerIcons[prayer.key] || '🕐'}</span>
                <p className={cn('text-[11px] mb-0.5 font-semibold', isNext ? 'text-primary' : 'text-muted-foreground')}>
                  {prayerNames[prayer.key] || t(prayer.key)}
                </p>
                <p className={cn('text-sm font-bold tabular-nums', isNext ? 'text-primary' : 'text-foreground')}>
                  {prayer.time}
                </p>
              </div>
            );
          })}
        </div>

        {/* Mosque link */}
        <Link
          to="/mosque-times"
          className="mt-3 flex items-center justify-between rounded-2xl border border-border/40 bg-card/80 p-3.5 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{t('mosqueTimes')}</p>
              <p className="text-[10px] text-muted-foreground">{t('chooseNearbyMosque')}</p>
            </div>
          </div>
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>

      {/* ===== RAMADAN BAR ===== */}
      {ramadanActive && (
        <div className="px-4 mb-4">
          <Link to="/ramadan-challenge">
            <div className="rounded-3xl gradient-prayer-bar p-5 flex items-center justify-between relative overflow-hidden active:scale-[0.98] transition-transform">
              <div className="absolute inset-0 islamic-pattern opacity-20" />
              <div className="text-white text-sm relative z-10">
                <span className="text-white/50 text-xs font-medium">{t('iftar')}</span>
                <p className="font-bold tabular-nums text-lg">{maghribTime}</p>
              </div>
              <div className="text-center relative z-10">
                <span className="text-3xl">🌙</span>
                <p className="text-white/70 text-[10px] mt-1">{t('ramadanChallenge')}</p>
              </div>
              <div className="text-white text-sm text-start relative z-10">
                <span className="text-white/50 text-xs font-medium">الفجر</span>
                <p className="font-bold tabular-nums text-lg">{fajrTime}</p>
              </div>
            </div>
          </Link>
        </div>
      )}

      <AdBanner position="home-middle" />

      {/* ===== VIDEO CONTENT (lazy) ===== */}
      <Suspense fallback={<div className="h-40" />}>
        <VideoContentCarousel />
      </Suspense>

      {/* ===== DAILY GOALS ===== */}
      <DailyGoals hijriMonthNumber={hijriMonthNumber} />

      {/* ===== NOTIFICATION CARD ===== */}
      <NotificationCard />

      {/* ===== QURAN PLAYER (lazy) ===== */}
      <Suspense fallback={<div className="h-32" />}>
        <QuranPlayer />
      </Suspense>

      {/* ===== DUA OF DAY ===== */}
      <div className="px-4 mb-4">
        <div
          onClick={() => setDuaDrawerOpen(true)}
          className="rounded-3xl bg-card border border-border/40 p-5 shadow-elevated relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
          <span className="inline-block rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-[11px] font-bold text-primary mb-3">
            دعاء اليوم
          </span>
          <p className="text-sm font-bold text-foreground mb-2">{todayDua.subtitle}</p>
          <p className="text-lg font-arabic text-foreground leading-[2.2] text-center mb-3 line-clamp-2">
            {todayDua.arabic}
          </p>
          <span className="inline-block rounded-2xl border border-primary/30 bg-primary/5 px-5 py-2 text-xs font-bold text-primary transition-all">
            اقرأ مع الترجمة →
          </span>
        </div>
      </div>

      {/* ===== SUGGESTED GOALS (lazy) ===== */}
      <Suspense fallback={<div className="h-24" />}>
        <SuggestedGoals />
      </Suspense>

      {/* ===== QUICK ACCESS ===== */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">وصول سريع</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {quickAccessItems.map((item) => (
            <Link key={item.path} to={item.path} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-card border border-border/40 transition-all active:scale-95">
              <div className={cn(
                'h-12 w-12 rounded-2xl bg-gradient-to-br flex items-center justify-center',
                item.gradient
              )}>
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-[11px] font-semibold text-foreground text-center">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ===== QURAN GOAL ===== */}
      <div className="px-4 mb-4">
        <div className="rounded-3xl bg-card border border-border/40 p-5 shadow-elevated relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-accent/5 to-transparent rounded-tr-full" />
          <span className="inline-block rounded-full bg-accent/10 border border-accent/20 px-3 py-1 text-[11px] font-bold text-accent-foreground mb-2">
            📖 إتمام القرآن
          </span>
          <p className="text-sm font-bold text-foreground mb-1">ابدأ تلاوة القرآن يوميًا</p>
          <p className="text-xs text-muted-foreground mb-3">حدّد وتيرتك واحصل على تذكيرات يومية</p>
          <Link
            to="/quran-goal"
            className="inline-block rounded-2xl bg-primary/10 border border-primary/20 px-5 py-2 text-xs font-bold text-primary transition-all active:scale-95"
          >
            حدّد هدف القرآن →
          </Link>
        </div>
      </div>

      {/* ===== HIJRI CALENDAR (lazy) ===== */}
      <div className="px-4 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">📅</span>
          <h3 className="text-sm font-bold text-foreground">التقويم الهجري</h3>
        </div>
        <Suspense fallback={<div className="h-48" />}>
          <HijriCalendar
            hijriDay={hijriDay}
            hijriMonth={hijriMonthNumber || undefined}
            hijriYear={hijriYear}
          />
        </Suspense>
      </div>
    </div>
  );
}
