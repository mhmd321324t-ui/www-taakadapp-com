import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdSlot {
  id: string;
  name: string;
  slot_type: string;
  ad_code: string | null;
  position: string;
  is_active: boolean;
  image_url: string | null;
  link_url: string | null;
  platform: string | null;
}

function useTrackImpression(adId: string | undefined) {
  const tracked = useRef(false);
  useEffect(() => {
    if (!adId || tracked.current) return;
    tracked.current = true;
    supabase.rpc('track_ad_impression', { _ad_id: adId }).then(() => {});
  }, [adId]);
}

function trackClick(adId: string) {
  supabase.rpc('track_ad_click', { _ad_id: adId }).then(() => {});
}

export function AdBanner({ position }: { position: string }) {
  const [ad, setAd] = useState<AdSlot | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from('ad_slots')
      .select('*')
      .eq('position', position)
      .eq('is_active', true)
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setAd(data as AdSlot);
      });
  }, [position]);

  // Track impression
  useTrackImpression(ad?.id);

  const handleClick = useCallback(() => {
    if (ad) trackClick(ad.id);
  }, [ad]);

  // Execute scripts inside ad_code for native/script types
  useEffect(() => {
    if (!ad || !containerRef.current) return;
    if ((ad.slot_type === 'native' || ad.slot_type === 'script' || ad.slot_type === 'manual') && ad.ad_code) {
      const container = containerRef.current;
      const temp = document.createElement('div');
      temp.innerHTML = ad.ad_code;
      const scripts = temp.querySelectorAll('script');
      
      scripts.forEach((origScript) => {
        const newScript = document.createElement('script');
        Array.from(origScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        if (origScript.textContent) {
          newScript.textContent = origScript.textContent;
        }
        container.appendChild(newScript);
      });

      const nonScriptHTML = ad.ad_code.replace(/<script[\s\S]*?<\/script>/gi, '');
      if (nonScriptHTML.trim()) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = nonScriptHTML;
        container.prepend(wrapper);
      }

      return () => {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      };
    }
  }, [ad]);

  if (!ad) return null;

  // Image + link type ad
  if (ad.slot_type === 'image' && ad.image_url) {
    const img = (
      <img
        src={ad.image_url}
        alt={ad.name}
        className="w-full rounded-xl"
        loading="lazy"
      />
    );
    return (
      <div className="w-full flex justify-center my-3 px-4">
        <div className="w-full max-w-lg rounded-xl overflow-hidden" onClick={handleClick}>
          {ad.link_url ? (
            <a href={ad.link_url} target="_blank" rel="noopener noreferrer nofollow">
              {img}
            </a>
          ) : (
            img
          )}
        </div>
      </div>
    );
  }

  // Native Ads / Script / Manual — use ref-based script injection
  if ((ad.slot_type === 'native' || ad.slot_type === 'script' || ad.slot_type === 'manual' || ad.slot_type === 'adsense') && ad.ad_code) {
    return (
      <div className="w-full flex justify-center my-3 px-4">
        <div
          ref={containerRef}
          onClick={handleClick}
          className="w-full max-w-lg rounded-xl overflow-hidden bg-muted/30"
        />
      </div>
    );
  }

  return null;
}

/**
 * PopUnder loader — place once in AppLayout
 */
export function PopUnderLoader() {
  const [scripts, setScripts] = useState<string[]>([]);

  useEffect(() => {
    supabase
      .from('ad_slots')
      .select('id, ad_code')
      .eq('slot_type', 'popunder')
      .eq('is_active', true)
      .then(({ data }) => {
        if (data) {
          // Track impressions for popunder ads
          data.forEach((d: any) => {
            supabase.rpc('track_ad_impression', { _ad_id: d.id }).then(() => {});
          });
          setScripts(data.map((d: any) => d.ad_code).filter(Boolean));
        }
      });
  }, []);

  useEffect(() => {
    const addedScripts: HTMLScriptElement[] = [];

    scripts.forEach((code) => {
      const temp = document.createElement('div');
      temp.innerHTML = code;
      const scriptTags = temp.querySelectorAll('script');

      scriptTags.forEach((origScript) => {
        const newScript = document.createElement('script');
        Array.from(origScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        if (origScript.textContent) {
          newScript.textContent = origScript.textContent;
        }
        document.head.appendChild(newScript);
        addedScripts.push(newScript);
      });
    });

    return () => {
      addedScripts.forEach((s) => {
        try { document.head.removeChild(s); } catch {}
      });
    };
  }, [scripts]);

  return null;
}
