/**
 * Service Worker for المؤذن العالمي
 * Prayer notification scheduling with periodic checking
 */

const CACHE_NAME = 'almuadhin-v3';
const ATHAN_AUDIO_CACHE = 'athan-audio-v1';

const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/pwa-icon-192.png',
  '/pwa-icon-512.png',
  '/mecca-hero.webp',
];

const PRAYER_NAMES = {
  fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء'
};

// ============ PRAYER TIME STORAGE ============
let storedPrayerTimes = [];
let notifiedToday = {};
let checkInterval = null;

function loadPrayerData() {
  // IndexedDB would be better, but for simplicity use global state + message passing
}

function isPrayerTime(prayerTime24, nowH, nowM) {
  const [h, m] = prayerTime24.split(':').map(Number);
  return h === nowH && m === nowM;
}

function checkAndNotify() {
  if (!storedPrayerTimes || storedPrayerTimes.length === 0) return;

  const now = new Date();
  const nowH = now.getHours();
  const nowM = now.getMinutes();
  const todayKey = now.toISOString().split('T')[0];

  // Reset notifications at midnight
  if (notifiedToday._date !== todayKey) {
    notifiedToday = { _date: todayKey };
  }

  for (const prayer of storedPrayerTimes) {
    if (prayer.key === 'sunrise') continue;
    const notifKey = `${todayKey}-${prayer.key}`;

    if (notifiedToday[notifKey]) continue;

    if (isPrayerTime(prayer.time24, nowH, nowM)) {
      notifiedToday[notifKey] = true;
      const name = PRAYER_NAMES[prayer.key] || prayer.key;

      self.registration.showNotification(`🕌 حان وقت صلاة ${name}`, {
        body: 'حيّ على الصلاة • حيّ على الفلاح',
        icon: '/pwa-icon-192.png',
        badge: '/pwa-icon-192.png',
        tag: `athan-${prayer.key}`,
        requireInteraction: true,
        vibrate: [300, 100, 300, 100, 300, 100, 300],
        renotify: true,
        dir: 'rtl',
        lang: 'ar',
        silent: false,
        data: { prayer: prayer.key, type: 'athan', url: '/' },
        actions: [
          { action: 'open', title: 'فتح التطبيق' },
          { action: 'dismiss', title: 'تجاهل' },
        ],
      });
    }

    // 10-minute reminder
    const [ph, pm] = prayer.time24.split(':').map(Number);
    let remH = ph, remM = pm - 10;
    if (remM < 0) { remM += 60; remH -= 1; }
    if (remH < 0) remH += 24;
    const remKey = `${todayKey}-rem-${prayer.key}`;

    if (!notifiedToday[remKey] && nowH === remH && nowM === remM) {
      notifiedToday[remKey] = true;
      const name = PRAYER_NAMES[prayer.key] || prayer.key;
      self.registration.showNotification(`⏰ بعد 10 دقائق صلاة ${name}`, {
        body: 'استعد للصلاة بالوضوء',
        icon: '/pwa-icon-192.png',
        badge: '/pwa-icon-192.png',
        tag: `reminder-${prayer.key}`,
        vibrate: [200, 100, 200],
        dir: 'rtl',
        lang: 'ar',
        data: { prayer: prayer.key, type: 'reminder', url: '/prayer-times' },
      });
    }
  }
}

function startPeriodicCheck() {
  if (checkInterval) clearInterval(checkInterval);
  checkInterval = setInterval(checkAndNotify, 30000); // Check every 30 seconds
  checkAndNotify(); // Immediate check
}

// ============ INSTALL ============
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS.filter(Boolean)))
      .then(() => self.skipWaiting())
  );
});

// ============ ACTIVATE ============
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME && k !== ATHAN_AUDIO_CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
  startPeriodicCheck();
});

// ============ FETCH ============
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.pathname.startsWith('/api/')) return;

  if (url.pathname.includes('/audio/')) {
    event.respondWith(
      caches.open(ATHAN_AUDIO_CACHE).then(async cache => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request).catch(() => null);
        if (response?.ok) cache.put(request, response.clone());
        return response || new Response('', { status: 404 });
      })
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request) || caches.match('/') || new Response('<h1 dir="rtl">غير متصل</h1>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
      )
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached =>
      cached || fetch(request).then(response => {
        if (response.ok && !url.pathname.includes('hot-update')) {
          caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
        }
        return response;
      })
    ).catch(() => caches.match('/'))
  );
});

// ============ PUSH ============
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data?.json() || {}; } catch (_e) { data = { title: 'المؤذن العالمي', body: event.data?.text() || '' }; }

  event.waitUntil(
    self.registration.showNotification(data.title || '🕌 المؤذن العالمي', {
      body: data.body || 'حان وقت الصلاة',
      icon: '/pwa-icon-192.png',
      badge: '/pwa-icon-192.png',
      tag: data.tag || 'almuadhin',
      requireInteraction: true,
      vibrate: [300, 100, 300, 100, 300],
      dir: 'rtl',
      lang: 'ar',
      data: { url: data.url || '/', ...data.data },
      actions: [
        { action: 'open', title: 'فتح التطبيق' },
        { action: 'dismiss', title: 'تجاهل' },
      ],
    })
  );
});

// ============ NOTIFICATION CLICK ============
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin)) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

// ============ MESSAGE FROM APP ============
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Receive prayer times from the app
  if (event.data?.type === 'UPDATE_PRAYER_TIMES') {
    storedPrayerTimes = event.data.prayers || [];
    startPeriodicCheck();

    // Respond back
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ status: 'ok', count: storedPrayerTimes.length });
    }
  }

  // Test notification
  if (event.data?.type === 'TEST_NOTIFICATION') {
    self.registration.showNotification('🕌 اختبار - المؤذن العالمي', {
      body: 'الإشعارات تعمل بنجاح! حيّ على الصلاة',
      icon: '/pwa-icon-192.png',
      badge: '/pwa-icon-192.png',
      tag: 'test-notification',
      requireInteraction: true,
      vibrate: [300, 100, 300, 100, 300],
      dir: 'rtl',
      lang: 'ar',
    });
  }
});

// Keep alive via periodic sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'prayer-check') {
    event.waitUntil(checkAndNotify());
  }
});
