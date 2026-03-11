
-- Mark all existing stories as approved
UPDATE public.stories SET status = 'approved' WHERE status = 'pending';
