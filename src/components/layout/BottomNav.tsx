import { useLocation, Link } from 'react-router-dom';
import { Home, Clock, BookOpen, MessageSquare, MoreHorizontal } from 'lucide-react';
import { useLocale } from '@/hooks/useLocale';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/', icon: Home, labelKey: 'home', label: '' },
  { path: '/prayer-times', icon: Clock, labelKey: 'prayerTimes', label: '' },
  { path: '/quran', icon: BookOpen, labelKey: 'quran', label: '' },
  { path: '/stories', icon: MessageSquare, labelKey: '', label: 'قصص' },
  { path: '/more', icon: MoreHorizontal, labelKey: 'more', label: '' },
];

export function BottomNav() {
  const location = useLocation();
  const { t } = useLocale();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-card/80 backdrop-blur-2xl">
      <div className="flex items-center justify-around pb-[env(safe-area-inset-bottom,0px)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'relative flex flex-col items-center gap-0.5 flex-1 py-2.5 text-xs transition-all duration-300 min-w-0',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-px left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon className={cn('h-5 w-5 shrink-0 transition-transform', isActive && 'scale-110 stroke-[2.5px]')} />
              <span className="font-medium text-[10px] leading-tight text-center truncate w-full px-0.5">
                {item.labelKey ? t(item.labelKey) : item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
