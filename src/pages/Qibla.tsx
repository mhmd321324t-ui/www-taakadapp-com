import { useState, useEffect } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

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

  return (
    <div className="min-h-screen">
      <div className="gradient-islamic px-5 pb-6 pt-12">
        <h1 className="text-2xl font-bold text-primary-foreground">{t('qibla')}</h1>
        <p className="text-primary-foreground/70 text-sm">{t('qiblaDirection')}</p>
        <div className="absolute -bottom-6 left-0 right-0 h-12 rounded-t-[50%] bg-background" />
      </div>

      <div className="flex flex-col items-center pt-8 px-5">
        {/* Compass */}
        <motion.div
          className="relative w-72 h-72 rounded-full border-4 border-primary/20 flex items-center justify-center mb-8"
          style={{ transform: `rotate(${-compass}deg)` }}
          transition={{ type: 'spring', stiffness: 50 }}
        >
          {/* Cardinal directions */}
          {['N', 'E', 'S', 'W'].map((dir, i) => (
            <span
              key={dir}
              className="absolute text-xs font-bold text-muted-foreground"
              style={{
                top: i === 0 ? '8px' : i === 2 ? 'auto' : '50%',
                bottom: i === 2 ? '8px' : 'auto',
                left: i === 3 ? '8px' : i === 1 ? 'auto' : '50%',
                right: i === 1 ? '8px' : 'auto',
                transform: i === 0 || i === 2 ? 'translateX(-50%)' : 'translateY(-50%)',
              }}
            >
              {dir}
            </span>
          ))}

          {/* Qibla needle */}
          <motion.div
            className="absolute"
            style={{
              transform: `rotate(${qiblaAngle}deg)`,
              transformOrigin: 'center center',
            }}
          >
            <div className="flex flex-col items-center -mt-28">
              <div className="text-2xl">🕋</div>
              <div className="w-0.5 h-20 bg-primary rounded-full" />
            </div>
          </motion.div>

          <Navigation className="h-8 w-8 text-primary" />
        </motion.div>

        {/* Info */}
        <div className="text-center space-y-2">
          <p className="text-3xl font-bold text-foreground">{Math.round(qiblaAngle)}°</p>
          <p className="text-sm text-muted-foreground">
            {t('distanceToMakkah')}: {Math.round(distance).toLocaleString()} {t('km')}
          </p>
        </div>
      </div>
    </div>
  );
}
