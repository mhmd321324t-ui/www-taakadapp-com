import { useState, useMemo } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

// Islamic events by Hijri month and day
const islamicEvents: Record<string, { key: string; emoji: string }> = {
  '1-1': { key: 'newYear', emoji: '🌙' },
  '1-10': { key: 'ashura', emoji: '📿' },
  '3-12': { key: 'mawlidNabi', emoji: '🕌' },
  '7-27': { key: 'israMiraj', emoji: '✨' },
  '8-15': { key: 'shaabanMid', emoji: '🌕' },
  '9-1': { key: 'ramadanStart', emoji: '🌙' },
  '9-27': { key: 'lailatAlQadr', emoji: '⭐' },
  '10-1': { key: 'eidFitr', emoji: '🎉' },
  '12-8': { key: 'hajjStart', emoji: '🕋' },
  '12-9': { key: 'dayArafah', emoji: '🤲' },
  '12-10': { key: 'eidAdha', emoji: '🐑' },
};

// Approximate Hijri date calculation
function gregorianToHijri(date: Date): { year: number; month: number; day: number } {
  const jd = Math.floor((date.getTime() / 86400000) + 2440587.5);
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const remainder = l - 10631 * n + 354;
  const j = Math.floor((10985 - remainder) / 5316) * Math.floor((50 * remainder) / 17719) +
    Math.floor(remainder / 5670) * Math.floor((43 * remainder) / 15238);
  const newRemainder = remainder - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * newRemainder) / 709);
  const day = newRemainder - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { year, month, day };
}

function hijriToApproxGregorian(hYear: number, hMonth: number, hDay: number): Date {
  const jd = Math.floor((11 * hYear + 3) / 30) + 354 * hYear + 30 * hMonth -
    Math.floor((hMonth - 1) / 2) + hDay + 1948440 - 385;
  const a = jd + 68569;
  const b = Math.floor(4 * a / 146097);
  const c = a - Math.floor((146097 * b + 3) / 4);
  const d = Math.floor(4000 * (c + 1) / 1461001);
  const e = c - Math.floor(1461 * d / 4) + 31;
  const f = Math.floor(80 * e / 2447);
  const gDay = e - Math.floor(2447 * f / 80);
  const g = Math.floor(f / 11);
  const gMonth = f + 2 - 12 * g;
  const gYear = 100 * (b - 49) + d + g;
  return new Date(gYear, gMonth - 1, gDay);
}

const hijriMonthNames: Record<string, string> = {
  ar: '',
};

const hijriMonthsArabic = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر',
  'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
];

function getDaysInHijriMonth(month: number, year: number): number {
  // Odd months = 30, even = 29, except month 12 in leap years = 30
  const isLeap = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29].includes(year % 30);
  if (month === 12 && isLeap) return 30;
  return month % 2 === 1 ? 30 : 29;
}

function getFirstDayOfHijriMonth(year: number, month: number): number {
  const approx = hijriToApproxGregorian(year, month, 1);
  return approx.getDay(); // 0=Sun
}

export default function HijriCalendar() {
  const { t } = useLocale();
  const today = useMemo(() => gregorianToHijri(new Date()), []);
  const [viewYear, setViewYear] = useState(today.year);
  const [viewMonth, setViewMonth] = useState(today.month);

  const daysInMonth = getDaysInHijriMonth(viewMonth, viewYear);
  const firstDay = getFirstDayOfHijriMonth(viewYear, viewMonth);

  // Ramadan countdown
  const ramadanCountdown = useMemo(() => {
    let targetYear = today.year;
    let targetMonth = 9;
    if (today.month > 9 || (today.month === 9 && today.day > 1)) {
      targetYear++;
    }
    const ramadanDate = hijriToApproxGregorian(targetYear, targetMonth, 1);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = Math.ceil((ramadanDate.getTime() - now.getTime()) / 86400000);
    if (today.month === 9) return 0; // We're in Ramadan
    return Math.max(0, diff);
  }, [today]);

  const navigate = (dir: number) => {
    let newMonth = viewMonth + dir;
    let newYear = viewYear;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    if (newMonth < 1) { newMonth = 12; newYear--; }
    setViewMonth(newMonth);
    setViewYear(newYear);
  };

  const goToToday = () => {
    setViewMonth(today.month);
    setViewYear(today.year);
  };

  // Upcoming events
  const upcomingEvents = useMemo(() => {
    const events: { month: number; day: number; key: string; emoji: string; daysAway: number }[] = [];
    for (const [md, ev] of Object.entries(islamicEvents)) {
      const [m, d] = md.split('-').map(Number);
      let targetYear = today.year;
      if (m < today.month || (m === today.month && d < today.day)) {
        targetYear++;
      }
      const evDate = hijriToApproxGregorian(targetYear, m, d);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const diff = Math.ceil((evDate.getTime() - now.getTime()) / 86400000);
      events.push({ month: m, day: d, ...ev, daysAway: Math.max(0, diff) });
    }
    return events.sort((a, b) => a.daysAway - b.daysAway).slice(0, 4);
  }, [today]);

  const dayLabels = [t('sunday'), t('monday'), t('tuesday'), t('wednesday'), t('thursday'), t('friday'), t('saturday')];

  return (
    <div className="space-y-4">
      {/* Ramadan Countdown */}
      {ramadanCountdown > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">{t('ramadanCountdown')}</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{ramadanCountdown}</p>
          <p className="text-xs text-muted-foreground">{t('daysRemaining')}</p>
        </motion.div>
      )}
      {ramadanCountdown === 0 && today.month === 9 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center"
        >
          <p className="text-2xl">🌙</p>
          <p className="text-sm font-bold text-primary">{t('ramadanMubarak')}</p>
        </motion.div>
      )}

      {/* Calendar Header */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(1)} className="rounded-full p-1.5 hover:bg-muted transition-colors">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button onClick={goToToday} className="text-center">
            <p className="text-sm font-bold text-foreground">
              {hijriMonthsArabic[viewMonth - 1]} {viewYear}
            </p>
          </button>
          <button onClick={() => navigate(-1)} className="rounded-full p-1.5 hover:bg-muted transition-colors">
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayLabels.map(d => (
            <div key={d} className="text-center text-[10px] text-muted-foreground font-medium">{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday = viewYear === today.year && viewMonth === today.month && day === today.day;
            const eventKey = `${viewMonth}-${day}`;
            const event = islamicEvents[eventKey];

            return (
              <motion.div
                key={day}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  'relative flex flex-col items-center justify-center rounded-lg p-1 text-xs h-9 transition-all cursor-default',
                  isToday && 'bg-primary text-primary-foreground font-bold',
                  event && !isToday && 'bg-accent/30 font-semibold',
                  !isToday && !event && 'text-foreground hover:bg-muted'
                )}
              >
                <span>{day}</span>
                {event && (
                  <span className="absolute -top-0.5 -right-0.5 text-[8px]">{event.emoji}</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Star className="h-4 w-4 text-primary" />
          {t('upcomingEvents')}
        </h3>
        <div className="space-y-2.5">
          {upcomingEvents.map((ev) => (
            <div key={ev.key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">{ev.emoji}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{t(ev.key)}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {ev.day} {hijriMonthsArabic[ev.month - 1]}
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {ev.daysAway === 0 ? t('today') : `${ev.daysAway} ${t('days')}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
