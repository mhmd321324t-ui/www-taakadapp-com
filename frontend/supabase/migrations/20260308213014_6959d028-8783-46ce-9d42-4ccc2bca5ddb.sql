-- Add impression and click counters to ad_slots
ALTER TABLE public.ad_slots
  ADD COLUMN IF NOT EXISTS impressions integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS clicks integer NOT NULL DEFAULT 0;

-- Function to increment impressions (callable from client without admin role)
CREATE OR REPLACE FUNCTION public.track_ad_impression(_ad_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.ad_slots SET impressions = impressions + 1 WHERE id = _ad_id;
$$;

-- Function to increment clicks
CREATE OR REPLACE FUNCTION public.track_ad_click(_ad_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.ad_slots SET clicks = clicks + 1 WHERE id = _ad_id;
$$;