import { useLocation, Link } from 'react-router-dom';
import { Home, Clock, BookOpen, Heart, MoreHorizontal } from 'lucide-react';
import { useLocale } from '@/hooks/useLocale';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/more', icon: MoreHorizontal, labelKey: 'more' },
  { path: '/duas', icon: Heart, labelKey: 'duas' },
  { path: '/quran', icon: BookOpen, labelKey: 'quran' },
  { path: '/prayer-times', icon: Clock, labelKey: 'prayerTimes' },
  { path: '/', icon: Home, labelKey: 'home' },
];

export function BottomNav() {
  const location = useLocation();
  const { t } = useLocale();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg" dir="rtl">
      <div className="flex items-center justify-around pb-[env(safe-area-inset-bottom,0px)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2.5 text-xs transition-colors min-w-[60px]',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'stroke-[2.5px]')} />
              <span className="font-medium truncate text-[10px]">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
