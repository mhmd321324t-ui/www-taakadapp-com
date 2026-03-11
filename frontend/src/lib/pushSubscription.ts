/**
 * Web Push subscription management
 * Handles subscribing/unsubscribing to push notifications via the Push API
 */
import { supabase } from '@/integrations/supabase/client';

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

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const res = await fetch(`https://${projectId}.supabase.co/functions/v1/setup-push`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!data.publicKey) throw new Error('Failed to get VAPID public key');
  cachedPublicKey = data.publicKey;
  return data.publicKey;
}

/** Get the current push subscription endpoint */
async function getCurrentEndpoint(): Promise<string | null> {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;
    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.getSubscription();
    return subscription?.endpoint || null;
  } catch {
    return null;
  }
}

/**
 * Subscribe the browser to push notifications and save subscription to DB
 */
export async function subscribeToPush(
  latitude: number,
  longitude: number,
  calculationMethod: number = 2
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

    // Check if already subscribed
    let subscription = await reg.pushManager.getSubscription();
    if (!subscription) {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });
    }

    const json = subscription.toJSON();
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
      console.error('[Push] Invalid subscription data');
      return false;
    }

    // Save to DB (upsert by endpoint)
    const { error } = await (supabase as any).from('push_subscriptions').upsert(
      {
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth_key: json.keys.auth,
        latitude,
        longitude,
        calculation_method: calculationMethod,
      },
      { onConflict: 'endpoint' }
    );

    if (error) {
      console.error('[Push] Failed to save subscription:', error);
      return false;
    }

    console.log('[Push] Subscribed successfully');
    return true;
  } catch (err) {
    console.error('[Push] Subscription failed:', err);
    return false;
  }
}

/**
 * Update mosque prayer times on the push subscription so the server
 * uses those instead of fetching from Aladhan (prevents duplicate notifications)
 */
export async function updatePushMosqueTimes(
  mosqueTimes: { key: string; time24: string }[] | null
): Promise<void> {
  try {
    const endpoint = await getCurrentEndpoint();
    if (!endpoint) return;

    await (supabase as any)
      .from('push_subscriptions')
      .update({ mosque_times: mosqueTimes })
      .eq('endpoint', endpoint);

    console.log('[Push] Mosque times updated:', mosqueTimes ? 'set' : 'cleared');
  } catch (err) {
    console.error('[Push] Failed to update mosque times:', err);
  }
}

/**
 * Unsubscribe from push notifications and remove from DB
 */
export async function unsubscribeFromPush(): Promise<void> {
  try {
    if (!('serviceWorker' in navigator)) return;
    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.getSubscription();
    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      await (supabase as any).from('push_subscriptions').delete().eq('endpoint', endpoint);
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
  } catch {
    return false;
  }
}
