// Custom service worker additions for notification click handling and push

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
  
  const prayer = event.notification.data?.prayer;
  const time = event.notification.data?.time;
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to find an existing window and send message to trigger full-screen alert
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          // Post message to trigger the full-screen athan alert in the app
          client.postMessage({
            type: 'ATHAN_ALERT',
            prayer: prayer,
            time: time,
          });
          return;
        }
      }
      // No existing window — open a new one with query params
      return clients.openWindow(`${url}?athan_prayer=${prayer}&athan_time=${time}`);
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
    const cache = await caches.open('prayer-bg-data');
    const cachedResp = await cache.match('/bg-prayer-data');
    if (!cachedResp) return;

    const data = await cachedResp.json();
    if (!data.prayers || !data.prayers.length) return;

    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();
    const todayKey = now.toISOString().split('T')[0];

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
        await self.registration.showNotification(`الأذان ${prayer.time24}`, {
          body: `${name} - ${prayer.time24}\nصل الآن. فتأخير الصلاة يجعلها أصعب.`,
          icon: '/pwa-icon-192.png',
          badge: '/pwa-icon-192.png',
          tag: `prayer-${prayer.key}`,
          requireInteraction: true,
          silent: false,
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
