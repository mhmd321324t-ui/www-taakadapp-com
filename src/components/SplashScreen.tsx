import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 600);
    }, 1800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {/* Geometric Islamic pattern background */}
          <div className="absolute inset-0 islamic-pattern opacity-30" />
          
          {/* Glowing orb */}
          <motion.div
            className="absolute w-64 h-64 rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)',
            }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Crescent + Star */}
          <motion.div
            className="relative z-10 mb-6"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
          >
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="text-primary">
              <path
                d="M40 4C22.3 4 8 18.3 8 36s14.3 32 32 32c6.2 0 12-1.8 16.9-4.8C50.4 67 42 72 32.5 72 16.2 72 3 58.8 3 42.5S16.2 13 32.5 13c3.5 0 6.8.5 10 1.5C39.8 8.5 35.5 4 40 4z"
                fill="currentColor"
              />
              <circle cx="58" cy="18" r="4" fill="hsl(var(--accent))" />
            </svg>
          </motion.div>

          {/* App name */}
          <motion.h1
            className="relative z-10 text-3xl font-bold text-foreground mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            صلاتي
          </motion.h1>

          <motion.p
            className="relative z-10 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            رفيقك الإسلامي اليومي
          </motion.p>

          {/* Loading dots */}
          <motion.div
            className="relative z-10 flex gap-1.5 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-primary"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
