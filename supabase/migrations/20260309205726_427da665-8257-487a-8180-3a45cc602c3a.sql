
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth_key text NOT NULL,
  latitude double precision,
  longitude double precision,
  calculation_method integer DEFAULT 2,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT push_subscriptions_endpoint_key UNIQUE (endpoint)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public insert push subscriptions"
  ON public.push_subscriptions FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Public select push subscriptions"
  ON public.push_subscriptions FOR SELECT TO public
  USING (true);

CREATE POLICY "Public update push subscriptions"
  ON public.push_subscriptions FOR UPDATE TO public
  USING (true);

CREATE POLICY "Public delete push subscriptions"
  ON public.push_subscriptions FOR DELETE TO public
  USING (true);
