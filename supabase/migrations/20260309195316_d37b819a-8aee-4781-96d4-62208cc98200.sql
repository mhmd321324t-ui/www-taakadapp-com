
-- Add status and media columns to stories
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'text';
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS media_url text;

-- Create ruqyah_categories table
CREATE TABLE public.ruqyah_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text,
  emoji text DEFAULT '🛡️',
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ruqyah_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read ruqyah categories" ON public.ruqyah_categories
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage ruqyah categories" ON public.ruqyah_categories
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create ruqyah_tracks table
CREATE TABLE public.ruqyah_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.ruqyah_categories(id) ON DELETE CASCADE NOT NULL,
  title_ar text NOT NULL,
  reciter_ar text NOT NULL,
  reciter_en text,
  media_type text NOT NULL DEFAULT 'audio',
  media_url text NOT NULL,
  youtube_id text,
  duration_seconds integer,
  sort_order integer DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ruqyah_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active ruqyah tracks" ON public.ruqyah_tracks
  FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Admins can manage ruqyah tracks" ON public.ruqyah_tracks
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update stories RLS - only show approved stories to public, pending to admin
DROP POLICY IF EXISTS "Anyone can read stories" ON public.stories;

CREATE POLICY "Anyone can read approved stories" ON public.stories
  FOR SELECT TO authenticated
  USING (status = 'approved' OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for story media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('story-media', 'story-media', true, 52428800, ARRAY['video/mp4', 'video/webm', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a']);

-- Storage RLS
CREATE POLICY "Anyone can read story media" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'story-media');

CREATE POLICY "Authenticated can upload story media" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'story-media');

CREATE POLICY "Users can delete own story media" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'story-media' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Insert default ruqyah categories
INSERT INTO public.ruqyah_categories (name_ar, name_en, emoji, sort_order) VALUES
  ('الرقية الشرعية الشاملة', 'Comprehensive Ruqyah', '🛡️', 1),
  ('رقية الحسد والعين', 'Evil Eye Ruqyah', '👁️', 2),
  ('رقية الجن والمس', 'Jinn Ruqyah', '🔥', 3),
  ('رقية السحر', 'Magic Ruqyah', '⚡', 4),
  ('رقية الرزق والبركة', 'Rizq & Barakah', '✨', 5),
  ('رقية الأمراض والشفاء', 'Healing Ruqyah', '💚', 6),
  ('رقية الأرق والنوم', 'Sleep Ruqyah', '🌙', 7),
  ('رقية تحصين النفس', 'Self Protection', '🏰', 8);

-- Insert sample ruqyah tracks (YouTube-based)
INSERT INTO public.ruqyah_tracks (category_id, title_ar, reciter_ar, reciter_en, media_type, media_url, youtube_id, sort_order) VALUES
  ((SELECT id FROM public.ruqyah_categories WHERE sort_order = 1), 'الرقية الشرعية الكاملة', 'مشاري راشد العفاسي', 'Mishary Alafasy', 'youtube', '', 'S3r5JQGvfGY', 1),
  ((SELECT id FROM public.ruqyah_categories WHERE sort_order = 1), 'الرقية الشرعية من القرآن والسنة', 'سعود الشريم', 'Saud Al-Shuraim', 'youtube', '', 'dpHMRgRc7Yc', 2),
  ((SELECT id FROM public.ruqyah_categories WHERE sort_order = 1), 'الرقية الشرعية الشاملة', 'ياسر الدوسري', 'Yasser Al-Dosari', 'youtube', '', '8oUvfnAjUhw', 3),
  ((SELECT id FROM public.ruqyah_categories WHERE sort_order = 2), 'رقية الحسد والعين', 'أحمد العجمي', 'Ahmed Al-Ajmi', 'youtube', '', 'v3XEgPBrIiE', 1),
  ((SELECT id FROM public.ruqyah_categories WHERE sort_order = 2), 'رقية العين والحسد قوية', 'ماهر المعيقلي', 'Maher Al-Muaiqly', 'youtube', '', 'tT0V0hYhGzs', 2),
  ((SELECT id FROM public.ruqyah_categories WHERE sort_order = 3), 'رقية طرد الجن', 'خالد الحبشي', 'Khalid Al-Habashi', 'youtube', '', 'hATykGDx7E0', 1),
  ((SELECT id FROM public.ruqyah_categories WHERE sort_order = 3), 'رقية الجن والمس الشديدة', 'عبدالرحمن السديس', 'Abdulrahman Al-Sudais', 'youtube', '', 'YPgHrHSLNVQ', 2),
  ((SELECT id FROM public.ruqyah_categories WHERE sort_order = 4), 'رقية إبطال السحر', 'سعد الغامدي', 'Saad Al-Ghamdi', 'youtube', '', 'wD3EvITz1HA', 1),
  ((SELECT id FROM public.ruqyah_categories WHERE sort_order = 5), 'رقية الرزق والفرج', 'عبدالباسط عبدالصمد', 'Abdul Basit', 'youtube', '', 'CFN6_YaHxro', 1),
  ((SELECT id FROM public.ruqyah_categories WHERE sort_order = 6), 'رقية الشفاء من الأمراض', 'ناصر القطامي', 'Nasser Al-Qatami', 'youtube', '', 'V9aYOmqjx_8', 1),
  ((SELECT id FROM public.ruqyah_categories WHERE sort_order = 7), 'رقية للنوم والراحة', 'فارس عباد', 'Fares Abbad', 'youtube', '', 'lKq7Bx0WNXE', 1),
  ((SELECT id FROM public.ruqyah_categories WHERE sort_order = 8), 'تحصين النفس بالأذكار', 'إدريس أبكر', 'Idris Abkar', 'youtube', '', 'DzI0RiAD8eg', 1);
