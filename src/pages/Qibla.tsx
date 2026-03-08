import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { MapPin, AlertTriangle, RotateCcw, Smartphone, Info, Map, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import QiblaMap from '@/components/QiblaMap';

function calculateQiblaDirection(lat: number, lng: number): number {
  const makkahLat = 21.4225 * (Math.PI / 180);
  const makkahLng = 39.8262 * (Math.PI / 180);
  const userLat = lat * (Math.PI / 180);
  const userLng = lng * (Math.PI / 180);
  const dLng = makkahLng - userLng;
  const x = Math.sin(dLng);
  const y = Math.cos(userLat) * Math.tan(makkahLat) - Math.sin(userLat) * Math.cos(dLng);
  let qibla = Math.atan2(x, y) * (180 / Math.PI);
  return (qibla + 360) % 360;
}

function calculateDistance(lat1: number, lng1: number): number {
  const R = 6371;
  const dLat = (21.4225 - lat1) * (Math.PI / 180);
  const dLng = (39.8262 - lng1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(21.4225 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const compassDirections = [
  { label: 'N', angle: 0 },
  { label: 'NE', angle: 45 },
  { label: 'E', angle: 90 },
  { label: 'SE', angle: 135 },
  { label: 'S', angle: 180 },
  { label: 'SW', angle: 225 },
  { label: 'W', angle: 270 },
  { label: 'NW', angle: 315 },
];

// Smooth compass heading to avoid jitter
function useSmoothedCompass() {
  const [heading, setHeading] = useState(0);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [hasCompass, setHasCompass] = useState<boolean | null>(null);
  const [permissionNeeded, setPermissionNeeded] = useState(false);
  const headingBuffer = useRef<number[]>([]);
  const BUFFER_SIZE = 8;

  const smoothHeading = useCallback((raw: number) => {
    const buf = headingBuffer.current;
    buf.push(raw);
    if (buf.length > BUFFER_SIZE) buf.shift();

    // Circular mean to handle wrap-around at 0/360
    let sinSum = 0, cosSum = 0;
    for (const h of buf) {
      sinSum += Math.sin(h * Math.PI / 180);
      cosSum += Math.cos(h * Math.PI / 180);
    }
    const avg = Math.atan2(sinSum / buf.length, cosSum / buf.length) * 180 / Math.PI;
    return ((avg % 360) + 360) % 360;
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const r = await (DeviceOrientationEvent as any).requestPermission();
        if (r === 'granted') {
          setPermissionNeeded(false);
          startListening();
        }
      } catch {
        setHasCompass(false);
      }
    }
  }, []);

  const startListening = useCallback(() => {
    const handler = (e: DeviceOrientationEvent) => {
      let raw: number | null = null;

      // iOS Safari
      if ((e as any).webkitCompassHeading != null) {
        raw = (e as any).webkitCompassHeading;
        if ((e as any).webkitCompassAccuracy != null) {
          setAccuracy((e as any).webkitCompassAccuracy);
        }
      }
      // Android / standard
      else if (e.alpha != null) {
        raw = (360 - e.alpha) % 360;
        // Check if absolute orientation is available
        if ((e as any).absolute === false) {
          setAccuracy(null); // Unknown accuracy for relative orientation
        } else {
          setAccuracy(15); // Reasonable estimate for absolute
        }
      }

      if (raw != null) {
        setHasCompass(true);
        setHeading(smoothHeading(raw));
      }
    };

    window.addEventListener('deviceorientation', handler, true);
    
    // Detect if compass events ever fire
    const timeout = setTimeout(() => {
      if (headingBuffer.current.length === 0) {
        setHasCompass(false);
      }
    }, 3000);

    return () => {
      window.removeEventListener('deviceorientation', handler, true);
      clearTimeout(timeout);
    };
  }, [smoothHeading]);

  useEffect(() => {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      // iOS - needs permission
      setPermissionNeeded(true);
    } else {
      // Android / desktop - start directly
      const cleanup = startListening();
      return cleanup;
    }
  }, [startListening]);

  return { heading, accuracy, hasCompass, permissionNeeded, requestPermission };
}

export default function Qibla() {
  const { t } = useLocale();
  const location = useGeoLocation();
  const { heading: compass, accuracy, hasCompass, permissionNeeded, requestPermission } = useSmoothedCompass();
  const [showInstructions, setShowInstructions] = useState(true);
  const [calibrating, setCalibrating] = useState(false);
  const [viewMode, setViewMode] = useState<'compass' | 'map'>('compass');

  const qiblaAngle = calculateQiblaDirection(location.latitude, location.longitude);
  const distance = calculateDistance(location.latitude, location.longitude);
  const rotation = qiblaAngle - compass;
  const normalizedRotation = ((rotation % 360) + 360) % 360;
  const isAligned = normalizedRotation < 10 || normalizedRotation > 350;
  const isLowAccuracy = accuracy != null && accuracy > 25;
  const isNoLocation = location.latitude === 0 && location.longitude === 0;

  const calibrate = () => {
    setCalibrating(true);
    setTimeout(() => setCalibrating(false), 3000);
  };

  return (
    <div className="min-h-screen pb-24 overflow-x-hidden" dir="rtl">
      {/* Header */}
      <div className="gradient-islamic relative px-5 pb-24 pt-safe-header">
        <div className="absolute inset-0 islamic-pattern opacity-20" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="glass-card rounded-full p-2.5"
            >
              <Info className="h-5 w-5 text-white/80" />
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'compass' ? 'map' : 'compass')}
              className="glass-card rounded-full p-2.5"
            >
              {viewMode === 'compass' ? (
                <Map className="h-5 w-5 text-white/80" />
              ) : (
                <Compass className="h-5 w-5 text-white/80" />
              )}
            </button>
          </div>
          <div className="text-right">
            <h1 className="text-xl font-bold text-white">{t('qibla')}</h1>
            <p className="text-white/70 text-sm mt-1.5 leading-relaxed">{t('qiblaDirection')}</p>
          </div>
        </div>
        <div className="absolute -bottom-6 left-0 right-0 h-12 rounded-t-[2rem] bg-background" />
      </div>

      <div className="-mt-2 flex w-full flex-col items-center px-5 pt-2">

        {/* Instructions panel */}
        <AnimatePresence>
          {showInstructions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full max-w-sm mb-5 overflow-hidden"
            >
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 space-y-4">
                <div className="flex items-center gap-2 justify-end">
                  <h3 className="font-bold text-foreground text-base">📋 كيف تستخدم البوصلة</h3>
                </div>
                <div className="space-y-4 text-sm text-muted-foreground" style={{ lineHeight: '2' }}>
                  <div className="flex items-start gap-3 justify-end">
                    <p className="min-w-0 break-words text-right flex-1">
                      <span className="text-primary font-bold">١.</span> ضع الهاتف بشكل <span className="text-foreground font-medium">أفقي مسطّح</span> على راحة يدك
                    </p>
                    <span className="text-2xl shrink-0 mt-0.5">📱</span>
                  </div>
                  <div className="flex items-start gap-3 justify-end">
                    <p className="min-w-0 break-words text-right flex-1">
                      <span className="text-primary font-bold">٢.</span> ابتعد عن <span className="text-foreground font-medium">المعادن والأجهزة الإلكترونية</span> (سماعات، لابتوب)
                    </p>
                    <span className="text-2xl shrink-0 mt-0.5">🧲</span>
                  </div>
                  <div className="flex items-start gap-3 justify-end">
                    <p className="min-w-0 break-words text-right flex-1">
                      <span className="text-primary font-bold">٣.</span> لمعايرة البوصلة: حرّك الهاتف بشكل <span className="text-foreground font-medium">رقم 8</span> عدة مرات
                    </p>
                    <span className="text-2xl shrink-0 mt-0.5">♾️</span>
                  </div>
                  <div className="flex items-start gap-3 justify-end">
                    <p className="min-w-0 break-words text-right flex-1">
                      <span className="text-primary font-bold">٤.</span> أدِر جسمك حتى تظهر <span className="text-foreground font-medium">🕋 في الأعلى</span> ويتحول اللون إلى <span className="text-primary font-medium">أخضر</span>
                    </p>
                    <span className="text-2xl shrink-0 mt-0.5">🧭</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="w-full text-center text-sm text-primary font-medium pt-2"
                >
                  فهمت ✓
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* iOS Permission request */}
        {permissionNeeded && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={requestPermission}
            className="w-full max-w-sm mb-5 rounded-2xl border border-primary bg-primary/10 p-4 flex items-center gap-3 justify-center"
          >
            <Smartphone className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">اضغط هنا لتفعيل البوصلة</span>
          </motion.button>
        )}

        {/* No compass warning */}
        {hasCompass === false && (
          <div className="w-full max-w-sm mb-5 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
            <div className="flex items-center gap-2 justify-end mb-2">
              <p className="text-sm font-bold text-destructive">البوصلة غير متاحة</p>
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <p className="text-xs text-muted-foreground text-right leading-relaxed break-words">
              جهازك لا يدعم البوصلة الرقمية أو أنك تستخدم متصفح كمبيوتر. استخدم الزاوية المعروضة ({Math.round(qiblaAngle)}°) مع بوصلة خارجية أو تطبيق خرائط.
            </p>
          </div>
        )}

        {/* Low accuracy warning */}
        <AnimatePresence>
          {isLowAccuracy && !calibrating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-4 flex w-full max-w-sm flex-col gap-2 rounded-xl border border-[hsl(var(--islamic-gold))]/30 bg-[hsl(var(--islamic-gold))]/5 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <button
                onClick={calibrate}
                className="flex items-center justify-center gap-1 self-start rounded-full bg-[hsl(var(--islamic-gold))]/20 px-3 py-1.5 text-xs font-medium text-[hsl(var(--islamic-gold))] sm:self-auto"
              >
                <RotateCcw className="h-3 w-3" />
                معايرة
              </button>
              <div className="flex min-w-0 items-center gap-2">
                <p className="min-w-0 text-xs text-muted-foreground break-words">دقة البوصلة منخفضة - حرّك الهاتف بشكل ∞</p>
                <AlertTriangle className="h-4 w-4 shrink-0 text-[hsl(var(--islamic-gold))]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Calibration animation */}
        <AnimatePresence>
          {calibrating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-sm mb-4 rounded-xl bg-primary/5 border border-primary/20 p-5 text-center"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                className="text-3xl inline-block mb-2"
              >
                ♾️
              </motion.div>
              <p className="text-sm text-primary font-medium">حرّك هاتفك بشكل رقم 8...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* No location warning */}
        {isNoLocation && (
          <div className="mb-4 flex w-full max-w-sm items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 justify-end">
            <p className="min-w-0 text-xs text-muted-foreground break-words text-right">لم يتم تحديد موقعك - فعّل خدمات الموقع</p>
            <MapPin className="h-4 w-4 shrink-0 text-destructive" />
          </div>
        )}

        {viewMode === 'compass' ? (
          <>
            {/* Compass */}
            <div className="relative mb-6 aspect-square w-full max-w-[300px]">
              {/* Outer decorative ring */}
              <div className="absolute inset-0 rounded-full border-2 border-border" />
              
              {/* Tick marks */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 300">
                {Array.from({ length: 72 }).map((_, i) => {
                  const angle = i * 5;
                  const isMajor = angle % 45 === 0;
                  const r1 = isMajor ? 138 : 142;
                  const r2 = 148;
                  const rad = (angle - 90) * (Math.PI / 180);
                  return (
                    <line
                      key={i}
                      x1={150 + r1 * Math.cos(rad)}
                      y1={150 + r1 * Math.sin(rad)}
                      x2={150 + r2 * Math.cos(rad)}
                      y2={150 + r2 * Math.sin(rad)}
                      className={cn(
                        isMajor ? 'stroke-foreground/40' : 'stroke-muted-foreground/20'
                      )}
                      strokeWidth={isMajor ? 2 : 1}
                    />
                  );
                })}
              </svg>

              {/* Rotating compass body */}
              <motion.div
                className="absolute inset-3 rounded-full bg-card border border-border shadow-lg"
                animate={{ rotate: -compass }}
                transition={{ type: 'spring', stiffness: 60, damping: 20 }}
              >
                {/* Cardinal direction labels */}
                {compassDirections.map(({ label, angle }) => {
                  const rad = (angle - 90) * (Math.PI / 180);
                  const r = label.length === 1 ? 105 : 108;
                  const isPrimary = label.length === 1;
                  return (
                    <motion.span
                      key={label}
                      className={cn(
                        'absolute text-center font-bold',
                        isPrimary ? 'text-sm text-foreground' : 'text-[9px] text-muted-foreground',
                        label === 'N' && 'text-primary'
                      )}
                      style={{
                        left: `calc(50% + ${r * Math.cos(rad)}px)`,
                        top: `calc(50% + ${r * Math.sin(rad)}px)`,
                        transform: `translate(-50%, -50%)`,
                      }}
                      animate={{ rotate: compass }}
                      transition={{ type: 'spring', stiffness: 60, damping: 20 }}
                    >
                      {label}
                    </motion.span>
                  );
                })}

                {/* Qibla indicator */}
                <div
                  className="absolute inset-0"
                  style={{ transform: `rotate(${qiblaAngle}deg)` }}
                >
                  <div className="absolute left-1/2 -translate-x-1/2 top-3 flex flex-col items-center">
                    <motion.div
                      animate={isAligned ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                      transition={{ repeat: isAligned ? Infinity : 0, duration: 1.2 }}
                      className="text-3xl"
                      style={{ transform: `rotate(${-qiblaAngle + compass}deg)` }}
                    >
                      🕋
                    </motion.div>
                  </div>
                </div>

                {/* Inner decorative circle */}
                <div className="absolute inset-[35%] rounded-full border border-border/50" />

                {/* Qibla line */}
                <div
                  className="absolute inset-0"
                  style={{ transform: `rotate(${qiblaAngle}deg)` }}
                >
                  <div className={cn(
                    "absolute left-1/2 top-[18%] -translate-x-[0.5px] w-[2px] h-[32%] rounded-full transition-colors duration-500",
                    isAligned
                      ? "bg-gradient-to-b from-primary to-primary/40"
                      : "bg-gradient-to-b from-muted-foreground/50 to-muted-foreground/10"
                  )} />
                </div>
              </motion.div>

              {/* Center point */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                  animate={isAligned ? { scale: [1, 1.3, 1], boxShadow: ['0 0 0 0 hsl(var(--primary) / 0)', '0 0 20px 8px hsl(var(--primary) / 0.3)', '0 0 0 0 hsl(var(--primary) / 0)'] } : {}}
                  transition={{ repeat: isAligned ? Infinity : 0, duration: 1.5 }}
                  className={cn(
                    'w-4 h-4 rounded-full border-2 transition-colors duration-500',
                    isAligned
                      ? 'bg-primary border-primary'
                      : 'bg-card border-primary/50'
                  )}
                />
              </div>

              {/* Top indicator (fixed) */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1">
                <div className={cn(
                  "w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] transition-colors duration-500",
                  isAligned ? "border-t-primary" : "border-t-muted-foreground"
                )} />
              </div>
            </div>

            {/* Alignment indicator */}
            <AnimatePresence>
              {isAligned && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="mb-4 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20"
                >
                  <p className="text-sm font-bold text-primary">🕋 هذا اتجاه القبلة ✓</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Angle display */}
            <div className="text-center mb-6">
              <p className="text-5xl font-bold text-foreground tabular-nums">
                {Math.round(qiblaAngle)}°
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {qiblaAngle > 315 || qiblaAngle <= 45 ? t('qiblaFromNorth') || 'من الشمال' :
                 qiblaAngle > 45 && qiblaAngle <= 135 ? t('qiblaFromEast') || 'من الشرق' :
                 qiblaAngle > 135 && qiblaAngle <= 225 ? t('qiblaFromSouth') || 'من الجنوب' :
                 t('qiblaFromWest') || 'من الغرب'}
              </p>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              <div className="rounded-2xl border border-border bg-card p-4 text-center">
                <MapPin className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  {t('distanceToMakkah')}
                </p>
                <p className="text-lg font-bold text-foreground">
                  {Math.round(distance).toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground">{t('km')}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4 text-center">
                <span className="text-xl block mb-1">📍</span>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  {t('location')}
                </p>
                <p className="text-sm font-bold text-foreground truncate">
                  {location.city || '...'}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {location.country || t('detectLocation')}
                </p>
              </div>
            </div>

            {/* Accuracy info */}
            {accuracy != null && (
              <div className="mt-4 flex items-center gap-2 text-[10px] text-muted-foreground">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  accuracy <= 10 ? 'bg-primary' :
                  accuracy <= 25 ? 'bg-[hsl(var(--islamic-gold))]' :
                  'bg-destructive'
                )} />
                <span>
                  {accuracy <= 10 ? 'دقة عالية' :
                   accuracy <= 25 ? 'دقة متوسطة' :
                   'دقة منخفضة - يرجى المعايرة'}
                  {' '}(±{Math.round(accuracy)}°)
                </span>
              </div>
            )}
          </>
        ) : (
          <>
            <QiblaMap
              userLat={location.latitude}
              userLng={location.longitude}
              city={location.city}
            />
            <div className="text-center mt-5 mb-4">
              <p className="text-3xl font-bold text-foreground tabular-nums">
                {Math.round(qiblaAngle)}°
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('distanceToMakkah')}: {Math.round(distance).toLocaleString()} {t('km')}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
