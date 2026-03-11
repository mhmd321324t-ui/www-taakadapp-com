import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function NotificationCard() {
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('notif-card-dismissed') === 'true';
  });

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="px-4 mb-4"
      >
        <div className="rounded-3xl gradient-islamic p-5 relative overflow-hidden">
          <div className="absolute inset-0 islamic-pattern opacity-15" />
          
          {/* Close */}
          <button
            onClick={() => {
              setDismissed(true);
              localStorage.setItem('notif-card-dismissed', 'true');
            }}
            className="absolute top-3 start-3 h-7 w-7 rounded-full bg-white/15 flex items-center justify-center z-10 backdrop-blur-sm"
          >
            <X className="h-3.5 w-3.5 text-white/80" />
          </button>

          <div className="relative z-10 flex items-center gap-4">
            {/* Bell icon */}
            <div className="shrink-0 h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center">
              <Bell className="h-7 w-7 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white mb-1 leading-snug">
                لا تفوّت أي صلاة
              </p>
              <p className="text-[11px] text-white/60 mb-3">
                فعّل الإشعارات لتصلك تنبيهات الأذان
              </p>
              <Link
                to="/notifications"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/20 backdrop-blur-sm text-white px-4 py-2 text-xs font-bold transition-all active:scale-95 border border-white/10"
              >
                إعدادات الإشعارات
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
