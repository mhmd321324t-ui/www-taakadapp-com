

## Analysis

The issue has two parts:

### Problem 1: Saved Mosque Override
From the Index page code (line 44): `const prayers = mosquePrayers || apiPrayers;` — if the user saved المسجد الحرام (from previous Kaaba testing), the home page now shows Makkah prayer times instead of their actual location-based times. The user wants location-based calculated times.

### Problem 2: Makkah Fallback
In `useGeoLocation.tsx` (lines 124-135), when the user denies location permission, the fallback defaults to Makkah coordinates (21.4225, 39.8262). This can cause wrong times if the fallback is triggered unexpectedly.

## Plan

### Fix 1: Remove automatic Makkah fallback in geolocation
- In `src/hooks/useGeoLocation.tsx`: When geolocation fails, keep `latitude: 0, longitude: 0` (which prevents API calls) and set an error message prompting the user to enable location
- Only use cached coordinates from a previous successful detection

### Fix 2: Ensure saved mosque source is transparent
- In `src/hooks/useSavedMosqueTimes.tsx`: When `fetch-mosque-times` returns `source: 'calculated'`, treat it as coordinate-based (not mosque-specific) and skip it — fall back to user's own location-based times instead
- This prevents a "saved mosque" from just showing the same generic Aladhan times for the mosque's coordinates rather than the user's

### Fix 3: Improve unlinking UX on Index page
- The unlink button already exists on Index page — ensure it's visible and functional so the user can easily remove a linked mosque and revert to location-based times

### Files to change:
1. `src/hooks/useGeoLocation.tsx` — Remove Makkah fallback, use error state instead
2. `src/hooks/useSavedMosqueTimes.tsx` — Skip `calculated` source from fetch-mosque-times, don't override user's location-based times with generic coordinate-based mosque times

