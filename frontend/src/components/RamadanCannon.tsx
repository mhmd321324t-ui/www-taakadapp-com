import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RamadanCannonProps {
  show: boolean;
  onComplete: () => void;
}

// Particle for explosion effect
function Particle({ delay, angle, distance, color }: { delay: number; angle: number; distance: number; color: string }) {
  return (
    <motion.div
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance - 100, // gravity-like upward bias
        opacity: 0,
        scale: 0.3,
      }}
      transition={{ duration: 1.5, delay, ease: 'easeOut' }}
      className="absolute rounded-full"
      style={{
        width: Math.random() * 8 + 4,
        height: Math.random() * 8 + 4,
        backgroundColor: color,
        boxShadow: `0 0 8px ${color}`,
      }}
    />
  );
}

// Smoke puff from cannon
function SmokePuff({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0.8, scale: 0.5, y: 0 }}
      animate={{ opacity: 0, scale: 3, y: -80 }}
      transition={{ duration: 2, delay, ease: 'easeOut' }}
      className="absolute rounded-full bg-white/30 blur-lg"
      style={{ width: 60, height: 60 }}
    />
  );
}

const PARTICLE_COLORS = ['#F59E0B', '#EF4444', '#8B5CF6', '#10B981', '#F97316', '#EC4899', '#FBBF24'];

export default function RamadanCannon({ show, onComplete }: RamadanCannonProps) {
  const [fired, setFired] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; angle: number; distance: number; color: string; delay: number }>>([]);

  const fire = useCallback(() => {
    setFired(true);
    
    // Generate particles
    const newParticles = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      angle: (Math.PI * 2 * i) / 40 + (Math.random() - 0.5) * 0.5,
      distance: 80 + Math.random() * 160,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      delay: Math.random() * 0.3,
    }));
    setParticles(newParticles);

    // Complete after animation
    setTimeout(onComplete, 3000);
  }, [onComplete]);

  useEffect(() => {
    if (show && !fired) {
      // Fire after a brief pause
      const timer = setTimeout(fire, 800);
      return () => clearTimeout(timer);
    }
  }, [show, fired, fire]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998] flex items-end justify-center pointer-events-none"
      >
        {/* Dark overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black pointer-events-none"
        />

        {/* Stars */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={`star-${i}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              top: `${Math.random() * 50}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}

        {/* Cannon */}
        <div className="relative mb-20 z-10">
          {/* Cannon body */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="relative"
          >
            {/* Cannon barrel */}
            <motion.div
              animate={fired ? { rotate: [-5, 0], y: [5, 0] } : {}}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <div className="text-8xl text-center" style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}>
                💣
              </div>

              {/* Explosion particles from top */}
              {fired && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2">
                  {particles.map(p => (
                    <Particle key={p.id} {...p} />
                  ))}
                  {/* Smoke puffs */}
                  <SmokePuff delay={0} />
                  <SmokePuff delay={0.2} />
                  <SmokePuff delay={0.4} />
                </div>
              )}
            </motion.div>

            {/* Flash */}
            {fired && (
              <motion.div
                initial={{ opacity: 1, scale: 0.5 }}
                animate={{ opacity: 0, scale: 4 }}
                transition={{ duration: 0.5 }}
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-amber-400"
                style={{ boxShadow: '0 0 60px 30px rgba(245,158,11,0.6)' }}
              />
            )}
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: fired ? 1 : 0, y: fired ? 0 : 20 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-center mt-6"
          >
            <p className="text-3xl font-bold text-amber-400 font-arabic" style={{ textShadow: '0 2px 10px rgba(245,158,11,0.5)' }}>
              🌙 مدفع الإفطار 🌙
            </p>
            <p className="text-white/70 text-sm mt-2 font-arabic">
              اللَّهُمَّ إِنِّي لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ
            </p>
          </motion.div>
        </div>

        {/* Crescent moon at top */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="absolute top-20 text-6xl"
        >
          🌙
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
