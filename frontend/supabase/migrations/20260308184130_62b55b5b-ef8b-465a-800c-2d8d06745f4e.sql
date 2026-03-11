CREATE TABLE public.tasbeeh_counts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dhikr_key TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, dhikr_key, date)
);

ALTER TABLE public.tasbeeh_counts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasbeeh" ON public.tasbeeh_counts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tasbeeh" ON public.tasbeeh_counts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasbeeh" ON public.tasbeeh_counts FOR UPDATE USING (auth.uid() = user_id);