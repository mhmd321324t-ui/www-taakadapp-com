import { ReactNode, useEffect } from 'react';
import { BottomNav } from './BottomNav';
import InstallBanner from '@/components/InstallBanner';
import { PopUnderLoader } from '@/components/AdBanner';
import { useDailyReminders } from '@/hooks/useDailyReminders';
import { PWAUpdatePrompt } from '@/components/PWAUpdatePrompt';
import { preloadSelectedAthan } from '@/lib/athanAudio';

export function AppLayout({ children }: { children: ReactNode }) {
  // Auto-schedule daily reminders if enabled
  useDailyReminders();

  // Preload athan audio on first user interaction for autoplay policy
  useEffect(() => {
    const handler = () => {
      preloadSelectedAthan(true);
      window.removeEventListener('click', handler);
      window.removeEventListener('touchstart', handler);
    };
    window.addEventListener('click', handler, { once: true });
    window.addEventListener('touchstart', handler, { once: true });
    return () => {
      window.removeEventListener('click', handler);
      window.removeEventListener('touchstart', handler);
    };
  }, []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background">
      <main className="w-full overflow-x-hidden pb-safe">{children}</main>
      <BottomNav />
      <InstallBanner />
      <PopUnderLoader />
      <PWAUpdatePrompt />
    </div>
  );
}
