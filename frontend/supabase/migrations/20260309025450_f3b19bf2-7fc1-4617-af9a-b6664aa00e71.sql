CREATE TABLE public.favorite_duas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  arabic text NOT NULL,
  reference text NOT NULL DEFAULT '',
  count integer NOT NULL DEFAULT 1,
  context text NOT NULL DEFAULT 'morning',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, arabic)
);

ALTER TABLE public.favorite_duas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
  ON public.favorite_duas FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON public.favorite_duas FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON public.favorite_duas FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);