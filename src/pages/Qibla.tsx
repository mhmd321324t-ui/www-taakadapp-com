import { useState, useEffect } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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

export default function Qibla() {
  const { t } = useLocale();
  const location = useGeoLocation();
  const [compass, setCompass] = useState(0);
  const qiblaAngle = calculateQiblaDirection(location.latitude, location.longitude);
  const distance = calculateDistance(location.latitude, location.longitude);

  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => {
      if ((e as any).webkitCompassHeading) {
        setCompass((e as any).webkitCompassHeading);
      } else if (e.alpha !== null) {
        setCompass(360 - e.alpha);
      }
    };

    if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission().then((r: string) => {
        if (r === 'granted') window.addEventListener('deviceorientation', handler);
      });
    } else {
      window.addEventListener('deviceorientation', handler);
    }

    return () => window.removeEventListener('deviceorientation', handler);
  }, []);

  const rotation = qiblaAngle - compass;
  const isAligned = Math.abs(((rotation % 360) + 360) % 360) < 15 || Math.abs(((rotation % 360) + 360) % 360) > 345;

  return (
    <div className="min-h-screen pb-safe" dir="rtl">
      {/* Header */}
      <div className="gradient-islamic relative px-5 pb-16 pt-12">
        <div className="text-right">
          <h1 className="text-2xl font-bold text-white">{t('qibla')}</h1>
          <p className="text-white/60 text-sm mt-1">{t('qiblaDirection')}</p>
        </div>
        <div className="absolute -bottom-6 left-0 right-0 h-12 rounded-t-[2rem] bg-background" />
      </div>

      <div className="flex flex-col items-center px-5 -mt-2">
        {/* Compass */}
        <div className="relative w-[300px] h-[300px] mb-8">
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
            style={{ transform: `rotate(${-compass}deg)` }}
            transition={{ type: 'spring', stiffness: 40, damping: 15 }}
          >
            {/* Cardinal direction labels */}
            {compassDirections.map(({ label, angle }) => {
              const rad = (angle - 90) * (Math.PI / 180);
              const r = label.length === 1 ? 105 : 108;
              const isPrimary = label.length === 1;
              return (
                <span
                  key={label}
                  className={cn(
                    'absolute text-center font-bold',
                    isPrimary ? 'text-sm text-foreground' : 'text-[9px] text-muted-foreground',
                    label === 'N' && 'text-primary'
                  )}
                  style={{
                    left: `calc(50% + ${r * Math.cos(rad)}px)`,
                    top: `calc(50% + ${r * Math.sin(rad)}px)`,
                    transform: `translate(-50%, -50%) rotate(${compass}deg)`,
                  }}
                >
                  {label}
                </span>
              );
            })}

            {/* Qibla indicator */}
            <div
              className="absolute inset-0"
              style={{
                transform: `rotate(${qiblaAngle}deg)`,
              }}
            >
              <div className="absolute left-1/2 -translate-x-1/2 top-4 flex flex-col items-center">
                <motion.div
                  animate={isAligned ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1.5 }}
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
              <div className="absolute left-1/2 top-[18%] -translate-x-[0.5px] w-[2px] h-[32%] rounded-full bg-gradient-to-b from-primary to-primary/20" />
            </div>
          </motion.div>

          {/* Center point */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={cn(
              'w-4 h-4 rounded-full border-2 transition-colors duration-500',
              isAligned
                ? 'bg-primary border-primary shadow-lg shadow-primary/30'
                : 'bg-card border-primary/50'
            )} />
          </div>

          {/* Top indicator (fixed) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1">
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-primary" />
          </div>
        </div>

        {/* Alignment indicator */}
        <AnimatePresence>
          {isAligned && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
            >
              <p className="text-sm font-medium text-primary">🕋 اتجاه القبلة ✓</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Angle display */}
        <div className="text-center mb-6">
          <p className="text-5xl font-bold text-foreground tabular-nums">
            {Math.round(qiblaAngle)}°
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
            <span className="text-xl block mb-1">🧭</span>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              {t('qiblaDirection')}
            </p>
            <p className="text-lg font-bold text-foreground">
              {Math.round(qiblaAngle)}°
            </p>
            <p className="text-[10px] text-muted-foreground">
              {qiblaAngle > 315 || qiblaAngle <= 45 ? 'N' :
               qiblaAngle > 45 && qiblaAngle <= 135 ? 'E' :
               qiblaAngle > 135 && qiblaAngle <= 225 ? 'S' : 'W'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
