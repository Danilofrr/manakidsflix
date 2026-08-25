ALTER TABLE public.titles
  ADD COLUMN IF NOT EXISTS video_provider text,
  ADD COLUMN IF NOT EXISTS provider_video_id text,
  ADD COLUMN IF NOT EXISTS trailer_video_provider text,
  ADD COLUMN IF NOT EXISTS trailer_provider_video_id text;

ALTER TABLE public.episodes
  ADD COLUMN IF NOT EXISTS video_provider text,
  ADD COLUMN IF NOT EXISTS provider_video_id text;

UPDATE public.titles
SET video_source = 'mana_kids'
WHERE video_source IN ('upload', 'url');

UPDATE public.titles
SET trailer_source = 'mana_kids'
WHERE trailer_source IN ('upload', 'url');

UPDATE public.episodes
SET video_source = 'mana_kids'
WHERE video_source IN ('upload', 'url');

UPDATE public.titles
SET provider_video_id = COALESCE(provider_video_id, external_video_id)
WHERE external_video_id IS NOT NULL;

UPDATE public.titles
SET trailer_provider_video_id = COALESCE(trailer_provider_video_id, trailer_external_id)
WHERE trailer_external_id IS NOT NULL;

UPDATE public.episodes
SET provider_video_id = COALESCE(provider_video_id, external_video_id)
WHERE external_video_id IS NOT NULL;

ALTER TABLE public.titles
  DROP CONSTRAINT IF EXISTS titles_video_source_check,
  ADD CONSTRAINT titles_video_source_check CHECK (video_source IN ('youtube', 'mana_kids', 'external')),
  DROP CONSTRAINT IF EXISTS titles_trailer_source_check,
  ADD CONSTRAINT titles_trailer_source_check CHECK (trailer_source IN ('youtube', 'mana_kids', 'external'));

ALTER TABLE public.episodes
  DROP CONSTRAINT IF EXISTS episodes_video_source_check,
  ADD CONSTRAINT episodes_video_source_check CHECK (video_source IN ('youtube', 'mana_kids', 'external'));

COMMENT ON COLUMN public.titles.video_provider IS 'Provedor da hospedagem própria/externa, como bunny, cloudflare, mux ou outro';
COMMENT ON COLUMN public.titles.provider_video_id IS 'Identificador do vídeo no provedor';
COMMENT ON COLUMN public.episodes.video_provider IS 'Provedor da hospedagem própria/externa, como bunny, cloudflare, mux ou outro';
COMMENT ON COLUMN public.episodes.provider_video_id IS 'Identificador do vídeo no provedor';