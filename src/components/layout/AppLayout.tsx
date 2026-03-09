import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import InstallBanner from '@/components/InstallBanner';
import { PopUnderLoader } from '@/components/AdBanner';
import { useDailyReminders } from '@/hooks/useDailyReminders';
import { PWAUpdatePrompt } from '@/components/PWAUpdatePrompt';

export function AppLayout({ children }: { children: ReactNode }) {
  // Auto-schedule daily reminders if enabled
  useDailyReminders();

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
