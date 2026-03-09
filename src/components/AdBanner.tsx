import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
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

type AdFetchStatus = 'loading' | 'loaded';

// Reserve space for known high-impact positions to reduce CLS on first paint.
// (Keeps the same layout once the ad loads; it just prevents late insertion pushing content.)
const DEFAULT_RESERVED_HEIGHT_BY_POSITION: Record<string, number> = {
  'home-top': 150,
  'home-middle': 150,
};

function readNumberFromStorage(key: string): number | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

function writeNumberToStorage(key: string, value: number) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // ignore
  }
}

export function AdBanner({ position }: { position: string }) {
  const [ad, setAd] = useState<AdSlot | null>(null);
  const [status, setStatus] = useState<AdFetchStatus>('loading');

  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  const reservedHeightStorageKey = useMemo(() => `ad-reserved-height:${position}`, [position]);

  const [reservedHeight, setReservedHeight] = useState<number>(() => {
    const cached = readNumberFromStorage(`ad-reserved-height:${position}`);
    if (cached) return cached;
    return DEFAULT_RESERVED_HEIGHT_BY_POSITION[position] ?? 0;
  });

  useEffect(() => {
    let mounted = true;
    setStatus('loading');

    supabase
      .from('ad_slots')
      .select('*')
      .eq('position', position)
      .eq('is_active', true)
      .limit(1)
      .single()
      .then(({ data }) => {
        if (!mounted) return;
        setAd(data ? (data as AdSlot) : null);
        setStatus('loaded');
      })
      .catch(() => {
        if (!mounted) return;
        setAd(null);
        setStatus('loaded');
      });

    return () => {
      mounted = false;
    };
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

  // Measure & persist the final rendered height per position to avoid CLS on future loads.
  useEffect(() => {
    if (!ad || !measureRef.current) return;

    const el = measureRef.current;
    const update = () => {
      const h = Math.round(el.getBoundingClientRect().height);
      if (!h) return;
      if (h !== reservedHeight) {
        setReservedHeight(h);
        writeNumberToStorage(reservedHeightStorageKey, h);
      }
    };

    update();

    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ad, reservedHeightStorageKey]);

  const shouldReserveSpace = reservedHeight > 0;

  // Preserve previous behavior for positions where we don't reserve space.
  if (!ad && !shouldReserveSpace) return null;
  if (!ad && status === 'loaded') return null;

  // Wrapper with reserved min-height to avoid late insertion shifting content below.
  const wrapperStyle = shouldReserveSpace ? ({ minHeight: reservedHeight } as React.CSSProperties) : undefined;

  // Image + link type ad
  if (ad && ad.slot_type === 'image' && ad.image_url) {
    const img = (
      <img
        src={ad.image_url}
        alt={ad.name}
        className="w-full rounded-xl"
        loading="lazy"
      />
    );

    return (
      <div className="w-full flex justify-center my-3 px-4" style={wrapperStyle}>
        <div ref={measureRef} className="w-full max-w-lg rounded-xl overflow-hidden" onClick={handleClick}>
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

  // Native Ads / Script / Manual / Adsense — use ref-based script injection
  if (
    ad &&
    (ad.slot_type === 'native' || ad.slot_type === 'script' || ad.slot_type === 'manual' || ad.slot_type === 'adsense') &&
    ad.ad_code
  ) {
    return (
      <div className="w-full flex justify-center my-3 px-4" style={wrapperStyle}>
        <div
          ref={measureRef}
          className="w-full max-w-lg rounded-xl overflow-hidden"
          onClick={handleClick}
        >
          <div ref={containerRef} className="w-full bg-muted/30" />
        </div>
      </div>
    );
  }

  // Loading placeholder (reserved space only) — keeps UX the same once ad arrives.
  return (
    <div className="w-full flex justify-center my-3 px-4" style={wrapperStyle} aria-hidden>
      <div className="w-full max-w-lg rounded-xl overflow-hidden" />
    </div>
  );
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
        try {
          document.head.removeChild(s);
        } catch {
          // ignore
        }
      });
    };
  }, [scripts]);

  return null;
}

