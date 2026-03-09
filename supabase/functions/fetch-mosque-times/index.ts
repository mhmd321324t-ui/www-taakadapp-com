import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Try fetching from Mawaqit page (scrape the embedded JSON config)
 */
async function fetchMawaqitTimes(slug: string): Promise<Record<string, string> | null> {
  try {
    const url = `https://mawaqit.net/en/m/${slug}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; QiblaApp/1.0)" },
    });
    if (!res.ok) return null;
    const html = await res.text();

    // Mawaqit embeds config as JSON in the page
    // Look for confData or similar patterns
    const confMatch = html.match(/var\s+confData\s*=\s*(\{[\s\S]*?\});/);
    if (confMatch) {
      try {
        const conf = JSON.parse(confMatch[1]);
        if (conf.times && Array.isArray(conf.times)) {
          const today = conf.times[0]; // first entry is today
          if (today && today.length >= 6) {
            return {
              fajr: today[0] || '',
              sunrise: today[1] || '',
              dhuhr: today[2] || '',
              asr: today[3] || '',
              maghrib: today[4] || '',
              isha: today[5] || '',
            };
          }
        }
        // Also check iqamaCalendar
        if (conf.iqamaCalendar) {
          const month = new Date().getMonth(); // 0-based
          const day = new Date().getDate() - 1;
          const iqama = conf.iqamaCalendar[month]?.[day];
          if (iqama && iqama.length >= 5) {
            return {
              fajr: iqama[0] || '',
              dhuhr: iqama[1] || '',
              asr: iqama[2] || '',
              maghrib: iqama[3] || '',
              isha: iqama[4] || '',
              sunrise: '',
            };
          }
        }
      } catch { /* parse error */ }
    }

    return null;
  } catch (e) {
    console.error("Mawaqit fetch error:", e);
    return null;
  }
}

/**
 * Use Gemini AI to extract prayer times from any mosque website HTML
 */
async function extractTimesWithAI(websiteUrl: string): Promise<Record<string, string> | null> {
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY not configured");
    return null;
  }

  try {
    // Fetch the website HTML
    const pageRes = await fetch(websiteUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; QiblaApp/1.0)" },
    });
    if (!pageRes.ok) {
      console.error("Failed to fetch website:", pageRes.status);
      return null;
    }
    let html = await pageRes.text();
    
    // Truncate to ~15K chars to fit in context
    if (html.length > 15000) {
      html = html.substring(0, 15000);
    }

    // Call Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const prompt = `Extract the prayer/salah times from this mosque website HTML. 
I need the IQAMAH (إقامة) times if available, otherwise the ATHAN (أذان) times.
Return ONLY a JSON object with these keys: fajr, sunrise, dhuhr, asr, maghrib, isha
Each value should be in 24h format like "05:30" or "13:15".
If a time is not found, use empty string "".
Do NOT include any text before or after the JSON.

HTML content:
${html}`;

    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 200,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", geminiRes.status, errText);
      return null;
    }

    const geminiData = await geminiRes.json();
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      console.error("No JSON found in Gemini response:", responseText);
      return null;
    }

    const times = JSON.parse(jsonMatch[0]);
    
    // Validate format
    const validTime = (t: string) => /^\d{1,2}:\d{2}$/.test(t);
    const result: Record<string, string> = {};
    for (const key of ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']) {
      result[key] = validTime(times[key]) ? times[key] : '';
    }

    // Check if we got at least some times
    const hasAny = Object.values(result).some(v => v !== '');
    return hasAny ? result : null;
  } catch (e) {
    console.error("AI extraction error:", e);
    return null;
  }
}

/**
 * Google search to find mosque website
 */
async function findMosqueWebsite(mosqueName: string, city: string): Promise<string | null> {
  try {
    // Try common patterns first
    const slug = mosqueName.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');
    
    // Check Mawaqit first
    const mawaqitCheck = await fetch(`https://mawaqit.net/en/m/${slug}`, {
      method: 'HEAD',
      headers: { "User-Agent": "Mozilla/5.0 (compatible; QiblaApp/1.0)" },
    });
    if (mawaqitCheck.ok) {
      return `mawaqit:${slug}`;
    }

    // Try with city
    const slugWithCity = `${slug}-${city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
    const mawaqitCheck2 = await fetch(`https://mawaqit.net/en/m/${slugWithCity}`, {
      method: 'HEAD',
      headers: { "User-Agent": "Mozilla/5.0 (compatible; QiblaApp/1.0)" },
    });
    if (mawaqitCheck2.ok) {
      return `mawaqit:${slugWithCity}`;
    }

    return null;
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mosqueName, mosqueCity, websiteUrl, mawaqitSlug } = await req.json();

    let times: Record<string, string> | null = null;
    let source = 'none';

    // Priority 1: Direct Mawaqit slug
    if (mawaqitSlug) {
      times = await fetchMawaqitTimes(mawaqitSlug);
      if (times) source = 'mawaqit';
    }

    // Priority 2: Direct website URL → AI scrape
    if (!times && websiteUrl) {
      // Check if it's a mawaqit URL
      const mawaqitMatch = websiteUrl.match(/mawaqit\.net\/\w+\/m\/([^/?]+)/);
      if (mawaqitMatch) {
        times = await fetchMawaqitTimes(mawaqitMatch[1]);
        if (times) source = 'mawaqit';
      }
      
      if (!times) {
        times = await extractTimesWithAI(websiteUrl);
        if (times) source = 'website';
      }
    }

    // Priority 3: Auto-discover mosque website
    if (!times && mosqueName) {
      const website = await findMosqueWebsite(mosqueName, mosqueCity || '');
      if (website?.startsWith('mawaqit:')) {
        const slug = website.replace('mawaqit:', '');
        times = await fetchMawaqitTimes(slug);
        if (times) source = 'mawaqit';
      } else if (website) {
        times = await extractTimesWithAI(website);
        if (times) source = 'website';
      }
    }

    return new Response(JSON.stringify({ 
      times, 
      source,
      success: !!times,
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
