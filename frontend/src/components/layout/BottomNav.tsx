import { useLocation, Link } from 'react-router-dom';
import { Home, Clock, BookOpen, Moon, MoreHorizontal } from 'lucide-react';
import { useLocale } from '@/hooks/useLocale';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/', icon: Home, label: 'الرئيسية' },
  { path: '/prayer-times', icon: Clock, label: 'أوقات الصلاة' },
  { path: '/quran', icon: BookOpen, label: 'القرآن' },
  { path: '/duas', icon: Moon, label: 'ادعية' },
  { path: '/more', icon: MoreHorizontal, label: 'المزيد' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-card/85 backdrop-blur-2xl">
      <div className="flex items-center justify-around pb-[env(safe-area-inset-bottom,0px)]" dir="rtl">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'relative flex flex-col items-center gap-1 flex-1 py-3 transition-all duration-300 min-w-0',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-px left-1/2 -translate-x-1/2 h-0.5 w-10 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon className={cn('h-[22px] w-[22px] shrink-0 transition-transform', isActive && 'scale-110 stroke-[2.5px]')} />
              <span className="font-semibold text-xs leading-tight text-center truncate w-full px-1">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
