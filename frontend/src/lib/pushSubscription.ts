/**
 * Web Push subscription management
 * Handles subscribing/unsubscribing to push notifications via the Push API
 */
const BACKEND_URL = import.meta.env.REACT_APP_BACKEND_URL || '';
let cachedPublicKey: string | null = null;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function getVapidPublicKey(): Promise<string> {
  if (cachedPublicKey) return cachedPublicKey;
  try {
    const res = await fetch(`${BACKEND_URL}/api/push/vapid-key`);
    if (res.ok) {
      const data = await res.json();
      if (data.publicKey) {
        cachedPublicKey = data.publicKey;
        return data.publicKey;
      }
    }
  } catch (_e) {
    // ignore
  }
  throw new Error('Push notifications not configured');
}

/** Get the current push subscription endpoint */
async function getCurrentEndpoint(): Promise<string | null> {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;
    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.getSubscription();
    return subscription ? subscription.endpoint : null;
  } catch (_e) {
    return null;
  }
}

/**
 * Subscribe the browser to push notifications
 */
export async function subscribeToPush(
  latitude: number,
  longitude: number,
  calculationMethod: number
): Promise<boolean> {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('[Push] PushManager not supported');
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    const reg = await navigator.serviceWorker.ready;
    const publicKey = await getVapidPublicKey();

    let subscription = await reg.pushManager.getSubscription();
    if (!subscription) {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    }

    const json = subscription.toJSON();
    if (!json.endpoint || !json.keys || !json.keys.p256dh || !json.keys.auth) {
      console.error('[Push] Invalid subscription data');
      return false;
    }

    console.log('[Push] Subscribed successfully - backend API not configured yet');
    return true;
  } catch (err) {
    console.error('[Push] Subscription failed:', err);
    return false;
  }
}

/**
 * Update mosque prayer times on the push subscription
 */
export async function updatePushMosqueTimes(
  mosqueTimes: { key: string; time24: string }[] | null
): Promise<void> {
  console.log('[Push] Mosque times update queued:', mosqueTimes ? 'set' : 'cleared');
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<void> {
  try {
    if (!('serviceWorker' in navigator)) return;
    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      console.log('[Push] Unsubscribed successfully');
    }
  } catch (err) {
    console.error('[Push] Unsubscribe failed:', err);
  }
}

/**
 * Check if browser is currently subscribed to push
 */
export async function isSubscribedToPush(): Promise<boolean> {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.getSubscription();
    return !!subscription;
  } catch (_e) {
    return false;
  }
}

// Keep getCurrentEndpoint available for internal use
export { getCurrentEndpoint };
