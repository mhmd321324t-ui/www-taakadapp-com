-- Mosques table: stores mosque info from OSM or manual entry
CREATE TABLE public.mosques (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  osm_id text,
  city text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(osm_id)
);

ALTER TABLE public.mosques ENABLE ROW LEVEL SECURITY;

-- Anyone can read mosques
CREATE POLICY "Anyone can read mosques"
  ON public.mosques FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can add mosques
CREATE POLICY "Authenticated users can insert mosques"
  ON public.mosques FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- User-specific prayer times for a mosque (each user manages their own)
CREATE TABLE public.user_mosque_times (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mosque_id uuid NOT NULL REFERENCES public.mosques(id) ON DELETE CASCADE,
  fajr text,
  sunrise text,
  dhuhr text,
  asr text,
  maghrib text,
  isha text,
  jumuah text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, mosque_id, date)
);

ALTER TABLE public.user_mosque_times ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own mosque times"
  ON public.user_mosque_times FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mosque times"
  ON public.user_mosque_times FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mosque times"
  ON public.user_mosque_times FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mosque times"
  ON public.user_mosque_times FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Selected mosque per user
CREATE TABLE public.user_selected_mosque (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  mosque_id uuid NOT NULL REFERENCES public.mosques(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_selected_mosque ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their selected mosque"
  ON public.user_selected_mosque FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their selected mosque"
  ON public.user_selected_mosque FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their selected mosque"
  ON public.user_selected_mosque FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their selected mosque"
  ON public.user_selected_mosque FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);