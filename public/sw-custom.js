// Custom service worker additions for notification click handling and push
// This file is injected into the generated service worker by vite-plugin-pwa

// Handle push notifications from the server
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'حان وقت الصلاة 🕌';
  const options = {
    body: data.body || '',
    icon: '/pwa-icon-192.png',
    badge: '/pwa-icon-192.png',
    tag: data.prayer ? `prayer-${data.prayer}` : 'prayer-notification',
    requireInteraction: true,
    silent: false,
    data: { url: data.url || '/', prayer: data.prayer, time: data.time },
    vibrate: [200, 100, 200, 100, 200],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      return clients.openWindow(url);
    })
  );
});

// Listen for skip waiting message from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Periodic background sync for prayer notifications
// This fires even when the app is closed (if browser supports it)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'prayer-check') {
    event.waitUntil(checkPrayerTimesInBackground());
  }
});

// Also use regular sync as fallback
self.addEventListener('sync', (event) => {
  if (event.tag === 'prayer-sync') {
    event.waitUntil(checkPrayerTimesInBackground());
  }
});

// Background prayer time checker
async function checkPrayerTimesInBackground() {
  try {
    // Read cached prayer times from the cache API
    const cache = await caches.open('prayer-bg-data');
    const cachedResp = await cache.match('/bg-prayer-data');
    if (!cachedResp) return;

    const data = await cachedResp.json();
    if (!data.prayers || !data.prayers.length) return;

    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();
    const todayKey = now.toISOString().split('T')[0];

    // Check fired status
    const firedResp = await cache.match('/bg-fired-today');
    let fired = {};
    if (firedResp) {
      const firedData = await firedResp.json();
      if (firedData.date === todayKey) {
        fired = firedData.fired || {};
      }
    }

    const PRAYER_NAMES = {
      fajr: '🌅 الفجر', dhuhr: '🌞 الظهر', asr: '🌤️ العصر',
      maghrib: '🌅 المغرب', isha: '🌙 العشاء',
    };

    let didFire = false;
    for (const prayer of data.prayers) {
      if (prayer.key === 'sunrise') continue;
      const [h, m] = prayer.time24.split(':').map(Number);
      const prayerMin = h * 60 + m;

      const athanKey = `athan-${prayer.key}`;
      if (!fired[athanKey] && currentMin >= prayerMin && currentMin <= prayerMin + 2) {
        fired[athanKey] = true;
        didFire = true;

        const name = PRAYER_NAMES[prayer.key] || prayer.key;
        await self.registration.showNotification('حان وقت الصلاة 🕌', {
          body: `${name} - ${prayer.time24}`,
          icon: '/pwa-icon-192.png',
          badge: '/pwa-icon-192.png',
          tag: `prayer-${prayer.key}`,
          requireInteraction: true,
          vibrate: [200, 100, 200, 100, 200],
          data: { url: '/', prayer: prayer.key, time: prayer.time24 },
        });
      }
    }

    if (didFire) {
      await cache.put('/bg-fired-today', new Response(JSON.stringify({ date: todayKey, fired })));
    }
  } catch (err) {
    console.error('[SW] Background prayer check failed:', err);
  }
}
