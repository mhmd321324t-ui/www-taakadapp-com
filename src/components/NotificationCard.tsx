import { useState } from 'react';
import { Bell, X, Settings } from 'lucide-react';
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="px-4 mb-5"
      >
        <div className="rounded-3xl bg-card border border-border/50 p-5 shadow-elevated relative overflow-hidden">
          {/* Close button */}
          <button
            onClick={() => {
              setDismissed(true);
              localStorage.setItem('notif-card-dismissed', 'true');
            }}
            className="absolute top-3 left-3 h-7 w-7 rounded-full bg-muted flex items-center justify-center z-10"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          <div className="flex items-center gap-4">
            {/* Phone mockup */}
            <div className="shrink-0 w-28 h-36 rounded-2xl bg-muted/60 border border-border/30 p-2 flex flex-col gap-1.5 overflow-hidden">
              <div className="text-center">
                <p className="text-[8px] text-muted-foreground">9:41</p>
              </div>
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-1.5 flex items-start gap-1.5">
                <div className="h-4 w-4 rounded bg-primary/20 flex items-center justify-center shrink-0">
                  <Bell className="h-2.5 w-2.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[6px] font-bold text-foreground leading-tight">حان وقت العشاء</p>
                  <p className="text-[5px] text-muted-foreground leading-tight mt-0.5">لا تنسَ تحديد صلاتك</p>
                </div>
              </div>
              <div className="rounded-lg bg-accent/10 border border-accent/20 p-1.5 flex items-start gap-1.5">
                <div className="h-4 w-4 rounded bg-accent/20 flex items-center justify-center shrink-0">
                  <Settings className="h-2.5 w-2.5 text-accent-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[6px] font-bold text-foreground leading-tight">أكمل أذكارك</p>
                  <p className="text-[5px] text-muted-foreground leading-tight mt-0.5">لديك 4 أذكار اليوم</p>
                </div>
              </div>
            </div>

            {/* Text + CTA */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-foreground mb-1 leading-snug">
                إدارة إشعاراتك في مكان واحد.
              </h4>
              <Link
                to="/notifications"
                className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-primary text-primary-foreground px-5 py-3 text-sm font-bold transition-all active:scale-[0.98]"
              >
                الذهاب إلى الإعدادات
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
