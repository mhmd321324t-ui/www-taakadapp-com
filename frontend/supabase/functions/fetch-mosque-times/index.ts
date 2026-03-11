// fetch-mosque-times v4 — stricter name matching with stop-words
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface MosqueTimes {
  fajr: string; sunrise: string; dhuhr: string;
  asr: string; maghrib: string; isha: string;
}

async function fetchWithTimeout(url: string, opts: RequestInit = {}, ms = 3000): Promise<Response> {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try { return await fetch(url, { ...opts, signal: c.signal }); }
  finally { clearTimeout(t); }
}

// Generic/stop words that should NOT count as a name match
const STOP_WORDS = new Set([
  // German generic
  'moschee', 'islamische', 'islamisches', 'islamisch', 'gemeinschaft', 'gemeinde',
  'zentrum', 'kulturzentrum', 'kulturverein', 'verein', 'kulturelle', 'ev',
  'deutsche', 'muslime', 'muslimische', 'gebetshaus', 'gebetsraum',
  // Turkish generic
  'camii', 'cami', 'diyanet', 'isleri', 'birligi', 'dernegi',
  // Arabic generic
  'مسجد', 'جامع', 'مصلى', 'اسلامي', 'إسلامي', 'الإسلامي', 'الاسلامي',
  // English generic
  'mosque', 'masjid', 'islamic', 'center', 'centre', 'community', 'prayer', 'room',
  // Common city names (Germany)
  'osnabrück', 'osnabruck', 'berlin', 'hamburg', 'münchen', 'munchen', 'munich',
  'köln', 'koln', 'cologne', 'frankfurt', 'stuttgart', 'düsseldorf', 'dusseldorf',
  'dortmund', 'essen', 'bremen', 'hannover', 'leipzig', 'dresden', 'nürnberg',
  'nurnberg', 'duisburg', 'bochum', 'wuppertal', 'bielefeld', 'bonn', 'mannheim',
  'karlsruhe', 'augsburg', 'wiesbaden', 'gelsenkirchen', 'aachen', 'kiel',
  'braunschweig', 'chemnitz', 'halle', 'magdeburg', 'freiburg', 'krefeld',
  'mainz', 'lübeck', 'erfurt', 'rostock', 'kassel', 'hagen', 'potsdam',
  // Common worldwide
  'london', 'paris', 'amsterdam', 'vienna', 'wien', 'zurich', 'zürich',
  'brussels', 'bruxelles', 'stockholm', 'oslo', 'copenhagen', 'copenhagen',
]);

function normalizeName(s: string): string {
  return s.toLowerCase()
    .replace(/[\"''""]/g, ' ')
    .replace(/[^\w\s\u0600-\u06FF]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function getDistinctiveWords(normalized: string): string[] {
  return normalized.split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

function namesMatch(requested: string, found: string): boolean {
  const a = normalizeName(requested);
  const b = normalizeName(found);
  if (!a || !b) return false;
  
  // Exact match after normalization
  if (a === b) return true;
  
  const wordsA = getDistinctiveWords(a);
  const wordsB = getDistinctiveWords(b);
  
  // If no distinctive words in either, can't match
  if (!wordsA.length || !wordsB.length) return false;
  
  // Check if distinctive words overlap
  const matchCount = wordsA.filter(w => 
    wordsB.some(wb => wb.includes(w) || w.includes(wb))
  ).length;
  
  // Require at least 1 distinctive word match AND >50% of shorter list
  const minLen = Math.min(wordsA.length, wordsB.length);
  return matchCount > 0 && matchCount >= Math.max(1, Math.ceil(minLen * 0.5));
}

async function fetchMawaqit(name: string, lat?: number, lon?: number): Promise<{
  times: MosqueTimes; source: string; matchedName: string;
  iqama?: string[]; jumua?: string; iqamaEnabled?: boolean;
} | null> {
  try {
    let url = `https://mawaqit.net/api/2.0/mosque/search?word=${encodeURIComponent(name)}`;
    if (lat && lon) url += `&lat=${lat}&lon=${lon}`;
    const res = await fetchWithTimeout(url, {
      headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" },
    }, 3000);
    if (!res.ok) { console.log("Mawaqit API error:", res.status); return null; }
    const mosques = await res.json();
    if (!Array.isArray(mosques) || !mosques.length) { console.log("Mawaqit: empty results for", name); return null; }

    console.log(`Mawaqit returned ${mosques.length} results for "${name}":`, mosques.map((m: any) => m?.name).join(', '));

    const matched = mosques.find((m: any) => m?.name && namesMatch(name, m.name));
    if (!matched || !matched.times || matched.times.length < 5) {
      console.log(`Mawaqit v4: NO NAME MATCH for "${name}" among [${mosques.map((m: any) => m?.name).join(', ')}]`);
      return null;
    }

    const times: MosqueTimes = {
      fajr: matched.times[0] || '', sunrise: matched.times[1] || '',
      dhuhr: matched.times[2] || '', asr: matched.times[3] || '',
      maghrib: matched.times[4] || '', isha: matched.times[5] || '',
    };
    console.log(`Mawaqit v4 MATCHED: "${matched.name}" for requested "${name}" → fajr=${times.fajr} dhuhr=${times.dhuhr}`);
    return {
      times, source: 'mawaqit', matchedName: matched.name,
      iqama: matched.iqama, jumua: matched.jumua, iqamaEnabled: matched.iqamaEnabled,
    };
  } catch (e) {
    console.log("Mawaqit error:", e instanceof Error ? e.message : "timeout");
    return null;
  }
}

async function fetchAladhan(lat: number, lon: number, method: number, school: number): Promise<{ times: MosqueTimes; source: string } | null> {
  try {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const url = `https://api.aladhan.com/v1/timings/${dd}-${mm}-${d.getFullYear()}?latitude=${lat}&longitude=${lon}&method=${method}&school=${school}`;
    console.log(`Aladhan fallback: lat=${lat} lon=${lon} method=${method}`);
    const res = await fetchWithTimeout(url, {}, 4000);
    if (!res.ok) return null;
    const json = await res.json();
    const t = json?.data?.timings;
    if (!t) return null;
    const clean = (s: string) => s?.replace(/\s*\(.*\)$/, '').trim() || '';
    const times = {
      fajr: clean(t.Fajr), sunrise: clean(t.Sunrise),
      dhuhr: clean(t.Dhuhr), asr: clean(t.Asr),
      maghrib: clean(t.Maghrib), isha: clean(t.Isha),
    };
    console.log(`Aladhan result: fajr=${times.fajr} dhuhr=${times.dhuhr}`);
    return { times, source: 'calculated' };
  } catch (e) {
    console.log("Aladhan error:", e instanceof Error ? e.message : "timeout");
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { mosqueName, latitude, longitude, method, school } = await req.json();
    console.log("fetch-mosque-times v4:", { mosqueName, latitude, longitude });

    let result: any = null;

    if (mosqueName) {
      result = await fetchMawaqit(mosqueName, latitude, longitude);
    }

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
