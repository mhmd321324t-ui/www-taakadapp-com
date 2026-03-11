
-- Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule send-prayer-push to run every minute
SELECT cron.schedule(
  'send-prayer-push',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://vnbysqlkaceulzmjhgxc.supabase.co/functions/v1/send-prayer-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYnlzcWxrYWNldWx6bWpoZ3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5ODU3NzcsImV4cCI6MjA4ODU2MTc3N30.SJDzVNt2v2t1N-5_p16fiUfUmPSzJKUgpSW4xqv_GmU'
    ),
    body := '{}'::jsonb
  );
  $$
);
