ALTER TABLE public.ad_slots
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS link_url text,
  ADD COLUMN IF NOT EXISTS platform text DEFAULT 'custom';