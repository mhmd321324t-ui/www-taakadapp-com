import { useEffect, forwardRef } from 'react';

/**
 * Silent PWA auto-updater.
 * When a new service worker is detected, it activates immediately
 * and reloads the page seamlessly — no user action required.
 */
export const PWAUpdatePrompt = forwardRef<HTMLDivElement>(function PWAUpdatePrompt(_, ref) {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let refreshing = false;

    // When new SW takes control, reload once
    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    // Check for updates every 5 minutes
    const checkForUpdate = async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.update();
          // If there's a waiting SW, activate it immediately
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        }
      } catch { /* ignore */ }
    };

    const interval = setInterval(checkForUpdate, 5 * 60 * 1000);

    // Also handle case where SW installs while page is open
    const handleWaiting = async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) return;

      if (reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      reg.addEventListener('updatefound', () => {
        const newSW = reg.installing;
        if (!newSW) return;
        newSW.addEventListener('statechange', () => {
          if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
            // New SW installed, activate immediately
            newSW.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });
    };

    handleWaiting();

    // Check on visibility change (user returns to app)
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdate();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(interval);
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return <div ref={ref} style={{ display: 'none' }} />;
});
