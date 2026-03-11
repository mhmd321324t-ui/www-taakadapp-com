
CREATE TABLE public.daily_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date text NOT NULL,
  goal_key text NOT NULL,
  completed boolean DEFAULT false,
  progress int DEFAULT 0,
  target int DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, date, goal_key)
);

ALTER TABLE public.daily_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own goals" ON public.daily_goals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own goals" ON public.daily_goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goals" ON public.daily_goals FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goals" ON public.daily_goals FOR DELETE TO authenticated USING (auth.uid() = user_id);
