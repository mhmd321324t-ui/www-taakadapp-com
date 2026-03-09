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

/**
 * Simple name similarity check — returns true if names share significant overlap
 */
function namesMatch(requested: string, found: string): boolean {
  const normalize = (s: string) =>
    s.toLowerCase()
      .replace(/[^\w\s\u0600-\u06FF]/g, '')
      .replace(/\b(moschee|mosque|masjid|camii|cami|مسجد|جامع)\b/gi, '')
      .trim();

  const a = normalize(requested);
  const b = normalize(found);

  if (!a || !b) return false;

  // Exact match after normalization
  if (a === b) return true;

  // One contains the other
  if (a.includes(b) || b.includes(a)) return true;

  // Check word overlap
  const wordsA = a.split(/\s+/).filter(w => w.length > 2);
  const wordsB = b.split(/\s+/).filter(w => w.length > 2);
  if (wordsA.length === 0 || wordsB.length === 0) return false;

  const matches = wordsA.filter(w => wordsB.some(wb => wb.includes(w) || w.includes(wb)));
  return matches.length >= 1;
}

/**
 * Search Mawaqit API for a mosque by name + coordinates
 */
async function fetchFromMawaqitAPI(mosqueName: string, lat?: number, lon?: number): Promise<{ times: MosqueTimes; source: string } | null> {
  try {
    const word = encodeURIComponent(mosqueName);
    let url = `https://mawaqit.net/api/2.0/mosque/search?word=${word}`;
    if (lat && lon) url += `&lat=${lat}&lon=${lon}`;

    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; QiblaApp/1.0)", "Accept": "application/json" },
    });
    if (!res.ok) {
      console.error("Mawaqit API error:", res.status);
      return null;
    }

    const mosques = await res.json();
    if (!Array.isArray(mosques) || mosques.length === 0) return null;

    // Find a mosque whose name actually matches the requested one
    let mosque = null;
    for (const m of mosques) {
      if (namesMatch(mosqueName, m.name || '')) {
        mosque = m;
        break;
      }
    }

    // If no name match found, reject — don't return wrong mosque's times
    if (!mosque) {
      console.log(`Mawaqit: no name match for "${mosqueName}". Found: ${mosques.map((m: any) => m.name).join(', ')}`);
      return null;
    }

    if (!mosque.times || mosque.times.length < 5) return null;

    const times: MosqueTimes = {
      fajr: mosque.times[0] || '',
      sunrise: mosque.times[1] || '',
      dhuhr: mosque.times[2] || '',
      asr: mosque.times[3] || '',
      maghrib: mosque.times[4] || '',
      isha: mosque.times[5] || '',
    };

    console.log(`Mawaqit matched: ${mosque.name} for "${mosqueName}" — times:`, times);
    return { times, source: 'mawaqit' };
  } catch (e) {
    console.error("Mawaqit API error:", e);
    return null;
  }
}

/**
 * Fetch times by Mawaqit slug (direct page scrape as fallback)
 */
async function fetchByMawaqitSlug(slug: string): Promise<{ times: MosqueTimes; source: string } | null> {
  try {
    const url = `https://mawaqit.net/en/m/${slug}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; QiblaApp/1.0)" },
    });
    if (!res.ok) return null;
    const html = await res.text();

    const keys: (keyof MosqueTimes)[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const times: MosqueTimes = { fajr: '', sunrise: '', dhuhr: '', asr: '', maghrib: '', isha: '' };

    const prayerBlocks = html.match(/<div class="[^"]*">\s*<div class="name">[^<]*<\/div>\s*<div class="time"><div>(\d{1,2}:\d{2})<\/div><\/div>/g);
    if (prayerBlocks && prayerBlocks.length >= 5) {
      const timeRegex = /<div class="time"><div>(\d{1,2}:\d{2})<\/div><\/div>/;
      for (let i = 0; i < Math.min(prayerBlocks.length, 5); i++) {
        const match = prayerBlocks[i].match(timeRegex);
        if (match) times[keys[i]] = match[1];
      }
    }

    const sunriseMatch = html.match(/chourouk-id[^>]*><div>(\d{1,2}:\d{2})<\/div>/);
    if (sunriseMatch) times.sunrise = sunriseMatch[1];

    const hasAny = Object.values(times).some(v => v !== '');
    if (!hasAny) return null;

    console.log(`Mawaqit slug ${slug} scraped:`, times);
    return { times, source: 'mawaqit' };
  } catch (e) {
    console.error("Mawaqit slug scrape error:", e);
    return null;
  }
}

/**
 * Use Gemini AI to extract prayer times from any mosque website HTML
 */
async function extractTimesWithAI(websiteUrl: string): Promise<{ times: MosqueTimes; source: string } | null> {
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  if (!GEMINI_API_KEY) return null;

  try {
    const pageRes = await fetch(websiteUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; QiblaApp/1.0)" },
    });
    if (!pageRes.ok) return null;
    let html = await pageRes.text();
    if (html.length > 15000) html = html.substring(0, 15000);

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    const prompt = `Extract prayer/salah times from this mosque website HTML.
I need IQAMAH times if available, otherwise ATHAN times.
Return ONLY JSON: {"fajr":"HH:MM","sunrise":"HH:MM","dhuhr":"HH:MM","asr":"HH:MM","maghrib":"HH:MM","isha":"HH:MM"}
Use 24h format. Empty string if not found. NO other text.

HTML:
${html}`;

    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 200 },
      }),
    });
    if (!geminiRes.ok) return null;

    const geminiData = await geminiRes.json();
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    const validTime = (t: string) => /^\d{1,2}:\d{2}$/.test(t);
    const times: MosqueTimes = {
      fajr: validTime(parsed.fajr) ? parsed.fajr : '',
      sunrise: validTime(parsed.sunrise) ? parsed.sunrise : '',
      dhuhr: validTime(parsed.dhuhr) ? parsed.dhuhr : '',
      asr: validTime(parsed.asr) ? parsed.asr : '',
      maghrib: validTime(parsed.maghrib) ? parsed.maghrib : '',
      isha: validTime(parsed.isha) ? parsed.isha : '',
    };

    if (!Object.values(times).some(v => v !== '')) return null;
    return { times, source: 'website' };
  } catch (e) {
    console.error("AI extraction error:", e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mosqueName, mosqueCity, websiteUrl, mawaqitSlug, latitude, longitude } = await req.json();
    console.log("fetch-mosque-times called:", { mosqueName, mosqueCity, mawaqitSlug, latitude, longitude });

    let result: { times: MosqueTimes; source: string } | null = null;

    // Priority 1: Direct Mawaqit slug
    if (!result && mawaqitSlug) {
      result = await fetchByMawaqitSlug(mawaqitSlug);
    }

    // Priority 2: Mawaqit API search by name + coordinates
    if (!result && mosqueName) {
      result = await fetchFromMawaqitAPI(mosqueName, latitude, longitude);
    }

    // Priority 3: Direct website URL → check if Mawaqit, then AI scrape
    if (!result && websiteUrl) {
      const mawaqitMatch = websiteUrl.match(/mawaqit\.net\/\w+\/m\/([^/?]+)/);
      if (mawaqitMatch) {
        result = await fetchByMawaqitSlug(mawaqitMatch[1]);
      }
      if (!result) {
        result = await extractTimesWithAI(websiteUrl);
      }
    }

    return new Response(JSON.stringify({
      times: result?.times || null,
      source: result?.source || 'none',
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
