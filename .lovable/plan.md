

## Plan: Fix Duplicate Notifications, Full-Screen Alert & Sound

### Problem Analysis

**3 distinct issues found:**

1. **Duplicate notifications**: Two separate systems fire independently:
   - **In-app checker** (`prayerNotifications.ts`): Uses `mosquePrayers || apiPrayers` — correct, picks ONE source
   - **Server push** (`send-prayer-push` edge function): Always uses USER's coordinates from `push_subscriptions` table — ignores mosque selection entirely
   - Result: When mosque is linked, in-app fires at mosque time, server push fires at location time = 2 notifications

2. **No sound on notification**: `sendNotification()` passes `silent: true` for athan notifications (line 149). The system notification arrives silently.

3. **No full-screen alert when app is closed**: `AthanAlert` component only renders inside Index.tsx when the app is open. When user taps a push notification, it opens `/` but doesn't trigger the full-screen athan alert.

### Changes

#### 1. Fix `src/lib/pushSubscription.ts` — Save mosque preference
- When subscribing to push, also save `mosque_times` (JSON of prayer times from the linked mosque) to the `push_subscriptions` table
- Add a new function `updatePushMosqueTimes(times)` that updates the subscription with mosque prayer times
- When mosque is unlinked, clear mosque_times from the subscription

#### 2. Fix `send-prayer-push` edge function — Respect mosque times
- When a subscription has `mosque_times` set, use THOSE times instead of fetching from Aladhan
- When `mosque_times` is null, use Aladhan as before
- This ensures only ONE notification fires per prayer, matching the user's choice

#### 3. Fix `src/lib/prayerNotifications.ts` — Sound & rich notification
- Change `silent: true` → `silent: false` for athan notifications (line 149)
- Add `vibrate: [200, 100, 200, 100, 200]` pattern
- Add location name to notification body (city or mosque name)
- Add motivational text like "صل الآن. فتأخير الصلاة يجعلها أصعب"
- Store the notification `tag` so clicking it opens the full-screen alert

#### 4. Fix `src/pages/Index.tsx` — Handle notification click → full-screen
- On mount, check URL params or listen for service worker messages
- When notification is clicked and app opens, auto-trigger `setAlertPrayer` for the full-screen `AthanAlert`

#### 5. Fix `public/sw-custom.js` — Post message to client on click
- On `notificationclick`, send a message to the client window with prayer data
- Client listens for this message and triggers full-screen alert + athan audio

#### 6. Fix `src/pages/Index.tsx` — Update push subscription when mosque changes
- When `mosquePrayers` changes, call `updatePushMosqueTimes()` to sync server-side
- When `unlinkMosque` is called, clear mosque times from push subscription

#### 7. DB migration — Add `mosque_times` column to `push_subscriptions`
- `ALTER TABLE push_subscriptions ADD COLUMN mosque_times jsonb DEFAULT NULL`

### Notification Content (matching screenshot)
```
Title: "الأذان  ٨:١١ م"
Body: "موعد صلاة العشاء في Osnabrück 08:11 PM\nصل الآن. فتأخير الصلاة يجعلها أصعب."
```

