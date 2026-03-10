

## Plan: Fix Mosque Times + React Error

### Problem 1: All Mosques Show Same Times
**Root cause confirmed from logs**: Every mosque request logs "Mawaqit found: Tawba Moschee" — the `namesMatch` fix from the previous edit was never deployed. The Mawaqit API returns results by proximity (nearest mosque first), and the code takes Tawba Moschee every time regardless of which mosque was requested.

**Evidence**: Searching "namesMatch" or "matched" in edge function logs returns zero results — the deployed code still uses the old version.

### Problem 2: React "Should have a queue" Error  
This is an HMR (Hot Module Replacement) issue caused by rapid code changes. The hooks in `Index.tsx` are structurally correct (no conditional hooks). A full page refresh should clear it, but to prevent recurrence we'll add stability improvements.

---

### Changes

#### 1. Rewrite + Redeploy `supabase/functions/fetch-mosque-times/index.ts`
- Keep `namesMatch` validation with strict matching (minimum 3-char words, require word overlap)
- Add clear logging: `"Mawaqit matched:"` vs `"Mawaqit: no match for X"` so we can verify deployment
- When Mawaqit has no name match → fall back to Aladhan with the **mosque's own coordinates** (each mosque gets its own calculated times)
- 3s timeout on Mawaqit, 4s on Aladhan
- Force redeploy by touching the file

#### 2. Fix `src/pages/MosquePrayerTimes.tsx` — Stop mass-checking availability
- Remove `autoCheckAvailability` which fires 10+ parallel edge function calls on page load (this floods the edge function and all return Tawba Moschee)
- Only check availability when a specific mosque is selected
- Use the mosque's own lat/lon (not user's) when calling the edge function — each mosque needs its own times

#### 3. Fix `src/hooks/useSavedMosqueTimes.tsx`
- Use **mosque's coordinates** (not user's) when calling the edge function — each mosque is at a different location and needs location-specific times
- Only fall back to user coordinates if mosque has no coordinates

#### 4. Fix React error in `src/pages/Index.tsx`
- Wrap the `useSavedMosqueTimes()` result destructuring in a stable pattern
- Add error boundary protection to prevent blank screen

### Key Insight
The previous fix tried to use "user's coordinates for all mosques" — that was wrong. Each mosque has its own GPS coordinates and needs its own prayer times calculated for THAT location. Using user coordinates means all mosques get identical calculated times. The Mawaqit API also needs the mosque's coordinates to find the right mosque.

