import { useEffect } from 'react';
import { toast } from 'sonner';

export function PWAUpdatePrompt() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const checkForUpdate = async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        reg.update().catch(() => {});
      }
    };

    // Check for updates every 30 minutes
    const interval = setInterval(checkForUpdate, 30 * 60 * 1000);

    // Listen for new service worker
    let refreshing = false;
    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    // Detect waiting SW and prompt user
    const detectWaiting = async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) return;

      const showUpdateToast = () => {
        toast('🔄 تحديث جديد متوفر', {
          description: 'اضغط لتحديث التطبيق الآن',
          duration: Infinity,
          action: {
            label: 'تحديث الآن',
            onClick: () => {
              reg.waiting?.postMessage({ type: 'SKIP_WAITING' });
            },
          },
        });
      };

      if (reg.waiting) {
        showUpdateToast();
      }

      reg.addEventListener('updatefound', () => {
        const newSW = reg.installing;
        if (!newSW) return;
        newSW.addEventListener('statechange', () => {
          if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateToast();
          }
        });
      });
    };

    detectWaiting();

    return () => {
      clearInterval(interval);
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, []);

  return null;
}
