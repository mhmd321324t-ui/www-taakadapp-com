
-- Stories table
CREATE TABLE public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  author_name text NOT NULL DEFAULT 'مجهول',
  category text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  likes_count integer NOT NULL DEFAULT 0,
  comments_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Story comments table
CREATE TABLE public.story_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  author_name text NOT NULL DEFAULT 'مجهول',
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Story likes table
CREATE TABLE public.story_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(story_id, user_id)
);

-- Enable RLS
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_likes ENABLE ROW LEVEL SECURITY;

-- Stories policies: anyone authenticated can read, users can insert/update/delete their own
CREATE POLICY "Anyone can read stories" ON public.stories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own stories" ON public.stories FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own stories" ON public.stories FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own stories" ON public.stories FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Anyone can read comments" ON public.story_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own comments" ON public.story_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.story_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Anyone can read likes" ON public.story_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own likes" ON public.story_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes" ON public.story_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Function to update stories counts
CREATE OR REPLACE FUNCTION public.update_story_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_TABLE_NAME = 'story_comments' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.stories SET comments_count = comments_count + 1 WHERE id = NEW.story_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.stories SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.story_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'story_likes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.stories SET likes_count = likes_count + 1 WHERE id = NEW.story_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.stories SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.story_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_comments_count
  AFTER INSERT OR DELETE ON public.story_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_story_counts();

CREATE TRIGGER update_likes_count
  AFTER INSERT OR DELETE ON public.story_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_story_counts();

-- Enable realtime for stories
ALTER PUBLICATION supabase_realtime ADD TABLE public.stories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.story_comments;
