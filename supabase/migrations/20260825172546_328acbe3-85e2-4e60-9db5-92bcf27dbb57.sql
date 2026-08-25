ALTER TABLE public.titles
  ADD COLUMN IF NOT EXISTS hls_url text,
  ADD COLUMN IF NOT EXISTS external_video_id text,
  ADD COLUMN IF NOT EXISTS trailer_hls_url text,
  ADD COLUMN IF NOT EXISTS trailer_external_id text,
  ADD COLUMN IF NOT EXISTS captions_enabled boolean NOT NULL DEFAULT true;

ALTER TABLE public.episodes
  ADD COLUMN IF NOT EXISTS hls_url text,
  ADD COLUMN IF NOT EXISTS external_video_id text;

CREATE TABLE IF NOT EXISTS public.video_subtitles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_id uuid REFERENCES public.titles(id) ON DELETE CASCADE,
  episode_id uuid REFERENCES public.episodes(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'main',
  language_code text NOT NULL,
  language_name text NOT NULL,
  subtitle_url text NOT NULL,
  format text NOT NULL DEFAULT 'vtt',
  is_default boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.video_subtitles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.video_subtitles TO authenticated;
GRANT ALL ON public.video_subtitles TO service_role;

ALTER TABLE public.video_subtitles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Publicos veem legendas" ON public.video_subtitles;
CREATE POLICY "Publicos veem legendas" ON public.video_subtitles
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin gerencia legendas" ON public.video_subtitles;
CREATE POLICY "Admin gerencia legendas" ON public.video_subtitles
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS video_subtitles_title_idx ON public.video_subtitles (title_id, kind);