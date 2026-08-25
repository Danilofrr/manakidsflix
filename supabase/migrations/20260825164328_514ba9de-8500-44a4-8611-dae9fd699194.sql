ALTER TABLE public.titles
  ADD COLUMN IF NOT EXISTS video_source text NOT NULL DEFAULT 'upload',
  ADD COLUMN IF NOT EXISTS youtube_url text,
  ADD COLUMN IF NOT EXISTS youtube_video_id text,
  ADD COLUMN IF NOT EXISTS trailer_source text NOT NULL DEFAULT 'upload',
  ADD COLUMN IF NOT EXISTS trailer_youtube_url text,
  ADD COLUMN IF NOT EXISTS trailer_youtube_id text;

ALTER TABLE public.episodes
  ADD COLUMN IF NOT EXISTS video_source text NOT NULL DEFAULT 'upload',
  ADD COLUMN IF NOT EXISTS youtube_url text,
  ADD COLUMN IF NOT EXISTS youtube_video_id text;

CREATE TABLE IF NOT EXISTS public.watch_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title_slug text NOT NULL,
  episode_id uuid,
  current_time_seconds numeric NOT NULL DEFAULT 0,
  duration_seconds numeric NOT NULL DEFAULT 0,
  percent numeric NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, title_slug, episode_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.watch_progress TO authenticated;
GRANT ALL ON public.watch_progress TO service_role;
ALTER TABLE public.watch_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own watch progress" ON public.watch_progress;
CREATE POLICY "own watch progress" ON public.watch_progress FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);