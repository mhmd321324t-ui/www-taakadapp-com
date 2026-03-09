

## Root Cause Analysis

The bug: **all mosques show the same prayer times** because of how `fetch-mosque-times` works:

1. **Priority 2** (`fetchFromMawaqitAPI`) searches Mawaqit by name. For mosques NOT on Mawaqit (e.g. "Merkez Camii", "FATIH CMII"), the name match fails → returns null.

2. **Priority 3** (`fetchMawaqitByCoords`) is the fallback — it searches Mawaqit by coordinates only and returns the **nearest** Mawaqit mosque (always `mosques[0]`). Since all mosques in the same city share similar coordinates, they ALL get the same nearest Mawaqit mosque's times (e.g. "Tawba Moschee" for Osnabruck area).

3. **Priority 6** (`fetchFromIslamicFinder` / Aladhan) also uses coordinates only — so even this fallback returns identical times for nearby mosques.

The fundamental issue: **Mawaqit and Aladhan both return times based on coordinates, not specific mosque identity.** When a mosque isn't found by name on Mawaqit, the system falls back to coordinate-based lookup which returns a random nearby mosque's times.

## Plan

### 1. Fix `fetch-mosque-times` edge function — Stop returning wrong mosque's times

- **Remove Priority 3** (`fetchMawaqitByCoords` nearest fallback) — this is the main culprit. It silently returns another mosque's iqamah times as if they belong to the requested mosque.
- **Keep Priority 2** (Mawaqit name search) — only returns times when the mosque is actually found by name match.
- **For Aladhan fallback (Priority 6)**: Mark the source clearly as `'calculated'` instead of implying these are the mosque's actual iqamah times. Aladhan gives calculated athan times, not mosque-specific iqamah times — this is fine as a fallback but should be distinguished.

### 2. Fix `fetch-mosque-times` — Improve name matching for better Mawaqit hits

- Pass the Mawaqit search `word` parameter as a shorter, cleaner keyword (first significant word of mosque name) to get broader search results.
- Try multiple search variations (e.g. for "FATIH CMII" try "Fatih", for "Merkez Camii" try "Merkez").

### 3. Update client-side display to show source accurately

- In `MosquePrayerTimesPage`, when source is `'aladhan'` or `'calculated'`, show a note like "أوقات حسابية — يمكنك تعديلها يدوياً" (calculated times — you can edit manually) so users know these aren't the mosque's actual iqamah times.

### Technical Details

**Edge function changes** (`supabase/functions/fetch-mosque-times/index.ts`):
- Remove `fetchMawaqitByCoords` function entirely
- Remove Priority 3 block from the serve handler
- In `fetchFromMawaqitAPI`, extract shorter search keywords from the mosque name for better matching
- Rename `fetchFromIslamicFinder` source to `'calculated'` to distinguish from real mosque times

**Client changes** (`src/pages/MosquePrayerTimes.tsx`):
- Add visual indicator when times source is `'aladhan'`/`'calculated'` vs `'mawaqit'`
- Show "أوقات حسابية" label for coordinate-based fallback times

