import { useEffect, useState, useCallback } from 'react';
import {
  isDailyRemindersEnabled,
  setDailyRemindersEnabled,
  scheduleDailyReminders,
} from '@/lib/dailyReminders';
import { requestNotificationPermission } from '@/hooks/useAthanNotifications';

/**
 * Hook to manage daily Islamic reminder notifications.
 * Auto-schedules if enabled. Provides toggle function.
 */
export function useDailyReminders() {
  const [enabled, setEnabled] = useState(isDailyRemindersEnabled);

  const toggle = useCallback(async () => {
    if (!enabled) {
      // Turning on — request permission first
      const granted = await requestNotificationPermission();
      if (!granted) return false;
      setDailyRemindersEnabled(true);
      setEnabled(true);
      scheduleDailyReminders();
      return true;
    } else {
      setDailyRemindersEnabled(false);
      setEnabled(false);
      // Clear timers
      const existing = (window as any).__dailyReminderTimers as number[] | undefined;
      if (existing) existing.forEach(clearTimeout);
      (window as any).__dailyReminderTimers = [];
      return true;
    }
  }, [enabled]);

  // Auto-schedule on mount if enabled
  useEffect(() => {
    if (!enabled) return;
    const cleanup = scheduleDailyReminders();
    return cleanup;
  }, [enabled]);

  return { enabled, toggle };
}
