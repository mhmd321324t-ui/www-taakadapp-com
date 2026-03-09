CREATE TABLE public.mosque_time_adjustments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    mosque_id uuid REFERENCES public.mosques(id) ON DELETE CASCADE NOT NULL,
    user_id uuid NOT NULL,
    fajr_diff integer DEFAULT 0,
    sunrise_diff integer DEFAULT 0,
    dhuhr_diff integer DEFAULT 0,
    asr_diff integer DEFAULT 0,
    maghrib_diff integer DEFAULT 0,
    isha_diff integer DEFAULT 0,
    base_fajr text,
    base_sunrise text,
    base_dhuhr text,
    base_asr text,
    base_maghrib text,
    base_isha text,
    jumuah text,
    has_auto_sync boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(user_id, mosque_id)
);

ALTER TABLE public.mosque_time_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own adjustments" ON public.mosque_time_adjustments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own adjustments" ON public.mosque_time_adjustments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own adjustments" ON public.mosque_time_adjustments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own adjustments" ON public.mosque_time_adjustments FOR DELETE USING (auth.uid() = user_id);