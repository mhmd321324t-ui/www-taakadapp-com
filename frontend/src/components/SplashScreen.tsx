import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 300);
    }, 600);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div className="absolute inset-0 islamic-pattern opacity-30" />
          
          <motion.div
            className="absolute w-64 h-64 rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)',
            }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="relative z-10 mb-6">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="text-primary">
              <path
                d="M40 4C22.3 4 8 18.3 8 36s14.3 32 32 32c6.2 0 12-1.8 16.9-4.8C50.4 67 42 72 32.5 72 16.2 72 3 58.8 3 42.5S16.2 13 32.5 13c3.5 0 6.8.5 10 1.5C39.8 8.5 35.5 4 40 4z"
                fill="currentColor"
              />
              <circle cx="58" cy="18" r="4" fill="hsl(var(--accent))" />
            </svg>
          </div>

          <h1 className="relative z-10 text-3xl font-bold text-foreground mb-2">المؤذن العالمي</h1>
          <p className="relative z-10 text-sm text-muted-foreground">مواقيت الصلاة والأذان في كل مكان</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
