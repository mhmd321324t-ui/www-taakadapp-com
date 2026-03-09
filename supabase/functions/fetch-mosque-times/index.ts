import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface MosqueTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

async function fetchWithTimeout(url: string, opts: RequestInit = {}, ms = 3000): Promise<Response> {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try { return await fetch(url, { ...opts, signal: c.signal }); }
  finally { clearTimeout(t); }
}

// Single Mawaqit search — return first result immediately
async function fetchMawaqit(name: string, lat?: number, lon?: number): Promise<{
  times: MosqueTimes; source: string; matchedName: string;
  iqama?: string[]; jumua?: string; iqamaEnabled?: boolean;
} | null> {
  try {
    let url = `https://mawaqit.net/api/2.0/mosque/search?word=${encodeURIComponent(name)}`;
    if (lat && lon) url += `&lat=${lat}&lon=${lon}`;
    const res = await fetchWithTimeout(url, {
      headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" },
    });
    if (!res.ok) return null;
    const mosques = await res.json();
    if (!Array.isArray(mosques) || !mosques.length) return null;
    // Take first result (closest match by Mawaqit's own ranking)
    const m = mosques[0];
    if (!m?.times || m.times.length < 5) return null;
    const times: MosqueTimes = {
      fajr: m.times[0] || '', sunrise: m.times[1] || '',
      dhuhr: m.times[2] || '', asr: m.times[3] || '',
      maghrib: m.times[4] || '', isha: m.times[5] || '',
    };
    console.log(`Mawaqit found: ${m.name}`);
    return {
      times, source: 'mawaqit', matchedName: m.name,
      iqama: m.iqama, jumua: m.jumua, iqamaEnabled: m.iqamaEnabled,
    };
  } catch (e) {
    console.log("Mawaqit error:", e instanceof Error ? e.message : "timeout");
    return null;
  }
}

// Aladhan calculated fallback
async function fetchAladhan(lat: number, lon: number, method: number, school: number): Promise<{ times: MosqueTimes; source: string } | null> {
  try {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const url = `https://api.aladhan.com/v1/timings/${dd}-${mm}-${d.getFullYear()}?latitude=${lat}&longitude=${lon}&method=${method}&school=${school}&adjustment=0`;
    const res = await fetchWithTimeout(url, {}, 4000);
    if (!res.ok) return null;
    const json = await res.json();
    const t = json?.data?.timings;
    if (!t) return null;
    const clean = (s: string) => s?.replace(/\s*\(.*\)$/, '').trim() || '';
    return {
      times: {
        fajr: clean(t.Fajr), sunrise: clean(t.Sunrise),
        dhuhr: clean(t.Dhuhr), asr: clean(t.Asr),
        maghrib: clean(t.Maghrib), isha: clean(t.Isha),
      },
      source: 'calculated',
    };
  } catch { return null; }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { mosqueName, latitude, longitude, method, school } = await req.json();
    console.log("fetch-mosque-times:", { mosqueName, latitude, longitude });

    let result: any = null;

    // 1. Try Mawaqit (3s timeout)
    if (mosqueName) {
      result = await fetchMawaqit(mosqueName, latitude, longitude);
    }

    // 2. Fallback to Aladhan calculated
    if (!result && latitude && longitude) {
      result = await fetchAladhan(latitude, longitude, method ?? 3, school ?? 0);
    }

    return new Response(JSON.stringify({
      times: result?.times || null,
      source: result?.source || 'none',
      matchedName: result?.matchedName || null,
      iqama: result?.iqama || null,
      jumua: result?.jumua || null,
      iqamaEnabled: result?.iqamaEnabled || false,
      success: !!result,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error", success: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
