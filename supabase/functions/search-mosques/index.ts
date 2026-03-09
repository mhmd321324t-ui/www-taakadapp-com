import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function searchOverpass(lat: number, lon: number, radius: number) {
  const query = `
    [out:json][timeout:30];
    (
      node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
      way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
      relation["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
      node["building"="mosque"](around:${radius},${lat},${lon});
      way["building"="mosque"](around:${radius},${lat},${lon});
      relation["building"="mosque"](around:${radius},${lat},${lon});
      node["amenity"="place_of_worship"]["denomination"="sunni"](around:${radius},${lat},${lon});
      way["amenity"="place_of_worship"]["denomination"="sunni"](around:${radius},${lat},${lon});
      node["amenity"="place_of_worship"]["denomination"="shia"](around:${radius},${lat},${lon});
      way["amenity"="place_of_worship"]["denomination"="shia"](around:${radius},${lat},${lon});
    );
    out center tags;
  `;

  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
  ];

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      
      const response = await fetch(endpoint, {
        method: "POST",
        body: `data=${encodeURIComponent(query)}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        console.error(`Overpass error from ${endpoint}:`, response.status);
        continue;
      }

      const data = await response.json();
      return data.elements || [];
    } catch (e) {
      console.error(`Overpass endpoint ${endpoint} failed:`, e);
      continue;
    }
  }
  return [];
}

async function searchNominatim(query: string, lat: number, lon: number) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + " mosque")}&format=json&limit=30&viewbox=${lon - 0.5},${lat + 0.5},${lon + 0.5},${lat - 0.5}&bounded=0&addressdetails=1`;
    const response = await fetch(url, {
      headers: { "User-Agent": "QiblaApp/1.0" },
    });
    if (!response.ok) return [];
    const results = await response.json();
    return results
      .filter((r: any) => {
        const type = r.type || '';
        const category = r.class || '';
        return type === 'place_of_worship' || type === 'mosque' || 
               category === 'amenity' || category === 'building' ||
               (r.display_name || '').toLowerCase().includes('mosch') ||
               (r.display_name || '').toLowerCase().includes('mosque') ||
               (r.display_name || '').toLowerCase().includes('مسجد') ||
               (r.display_name || '').toLowerCase().includes('cami');
      })
      .map((r: any) => ({
        osm_id: `nom_${r.osm_id}`,
        name: r.display_name?.split(',')[0] || r.name || 'مسجد',
        address: r.display_name?.split(',').slice(1, 4).join(',').trim() || '',
        latitude: parseFloat(r.lat),
        longitude: parseFloat(r.lon),
      }));
  } catch (e) {
    console.error("Nominatim error:", e);
    return [];
  }
}

// Check if mosque has Mawaqit times available
async function checkMawaqitAvailability(mosqueName: string, lat: number, lon: number): Promise<boolean> {
  try {
    const searchUrl = `https://mawaqit.net/api/2.0/mosque/search?lat=${lat}&lon=${lon}&word=${encodeURIComponent(mosqueName)}`;
    const searchRes = await fetch(searchUrl, {
      headers: { 'Accept': 'application/json' },
    });
    
    if (searchRes.ok) {
      const mosques = await searchRes.json();
      if (Array.isArray(mosques) && mosques.length > 0) {
        return true;
      }
    }
    
    // Try proximity search
    const proximityUrl = `https://mawaqit.net/api/2.0/mosque/search?lat=${lat}&lon=${lon}`;
    const proximityRes = await fetch(proximityUrl, {
      headers: { 'Accept': 'application/json' },
    });
    
    if (proximityRes.ok) {
      const nearbyMosques = await proximityRes.json();
      if (Array.isArray(nearbyMosques)) {
        // Check if any mosque is within 500m
        for (const m of nearbyMosques) {
          if (m.latitude && m.longitude) {
            const dlat = Math.abs(m.latitude - lat);
            const dlon = Math.abs(m.longitude - lon);
            if (dlat < 0.005 && dlon < 0.005) {
              return true;
            }
          }
        }
      }
    }
    
    return false;
  } catch {
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lon, radius, textQuery, checkAvailability } = await req.json();

    if (!lat || !lon) {
      return new Response(JSON.stringify({ error: "lat and lon are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Default to 10km radius
    const r = radius || 10000;

    // If text query provided, search both Overpass AND Nominatim
    const [overpassElements, nominatimResults] = await Promise.all([
      searchOverpass(lat, lon, r),
      textQuery ? searchNominatim(textQuery, lat, lon) : Promise.resolve([]),
    ]);

    // Process Overpass results
    const seen = new Set<string>();
    const overpassMosques = overpassElements
      .map((el: any) => {
        const id = String(el.id);
        if (seen.has(id)) return null;
        seen.add(id);
        return {
          osm_id: id,
          name: el.tags?.name || el.tags?.["name:ar"] || el.tags?.["name:en"] || el.tags?.["name:de"] || "مسجد",
          address: [el.tags?.["addr:street"], el.tags?.["addr:housenumber"], el.tags?.["addr:city"]].filter(Boolean).join(", ") || "",
          latitude: el.lat || el.center?.lat,
          longitude: el.lon || el.center?.lon,
        };
      })
      .filter((m: any) => m && m.latitude && m.longitude);

    // Merge: Overpass first, then Nominatim results not already found
    const allMosques = [...overpassMosques];
    for (const nom of nominatimResults) {
      // Check if already in list by proximity (within 50m)
      const isDuplicate = allMosques.some((m: any) => {
        const dlat = Math.abs(m.latitude - nom.latitude);
        const dlon = Math.abs(m.longitude - nom.longitude);
        return dlat < 0.0005 && dlon < 0.0005;
      });
      if (!isDuplicate) {
        allMosques.push(nom);
      }
    }

    // Optionally check Mawaqit availability for each mosque
    if (checkAvailability) {
      const mosquesWithAvailability = await Promise.all(
        allMosques.slice(0, 20).map(async (mosque: any) => {
          const hasAutoSync = await checkMawaqitAvailability(mosque.name, mosque.latitude, mosque.longitude);
          return { ...mosque, hasAutoSync };
        })
      );
      return new Response(JSON.stringify({ mosques: mosquesWithAvailability }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ mosques: allMosques }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
