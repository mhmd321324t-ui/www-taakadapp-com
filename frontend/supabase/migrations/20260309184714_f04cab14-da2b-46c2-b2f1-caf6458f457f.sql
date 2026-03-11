CREATE TABLE public.ramadan_challenge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  year integer NOT NULL,
  day_number integer NOT NULL CHECK (day_number >= 1 AND day_number <= 30),
  fasting_completed boolean DEFAULT false,
  deed_completed boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, year, day_number)
);

ALTER TABLE public.ramadan_challenge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own challenge" ON public.ramadan_challenge FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own challenge" ON public.ramadan_challenge FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own challenge" ON public.ramadan_challenge FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own challenge" ON public.ramadan_challenge FOR DELETE TO authenticated USING (auth.uid() = user_id);