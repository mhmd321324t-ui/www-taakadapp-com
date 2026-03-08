import { useEffect, useState } from 'react';
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

export function AdBanner({ position }: { position: string }) {
  const [ad, setAd] = useState<AdSlot | null>(null);

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
        <div className="w-full max-w-lg rounded-xl overflow-hidden">
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

  // HTML/JS code type (Adsterra, PropellerAds, AdSense, etc.)
  if ((ad.slot_type === 'manual' || ad.slot_type === 'adsense' || ad.slot_type === 'script') && ad.ad_code) {
    return (
      <div className="w-full flex justify-center my-3 px-4">
        <div
          className="w-full max-w-lg rounded-xl overflow-hidden bg-muted/30"
          dangerouslySetInnerHTML={{ __html: ad.ad_code }}
        />
      </div>
    );
  }

  return null;
}
