import { useLocation, Link } from 'react-router-dom';
import { Home, Clock, BookOpen, Heart, MoreHorizontal } from 'lucide-react';
import { useLocale } from '@/hooks/useLocale';
import { cn } from '@/lib/utils';

// Order: Right to Left in RTL → Home, PrayerTimes, Quran, Duas, More
const navItems = [
  { path: '/', icon: Home, labelKey: 'home' },
  { path: '/prayer-times', icon: Clock, labelKey: 'prayerTimes' },
  { path: '/quran', icon: BookOpen, labelKey: 'quran' },
  { path: '/duas', icon: Heart, labelKey: 'duas' },
  { path: '/more', icon: MoreHorizontal, labelKey: 'more' },
];

export function BottomNav() {
  const location = useLocation();
  const { t } = useLocale();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg">
      <div className="flex items-center justify-around pb-[env(safe-area-inset-bottom,0px)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-0.5 flex-1 py-2.5 text-xs transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'stroke-[2.5px]')} />
              <span className="font-medium text-[10px] leading-tight">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
