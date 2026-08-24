-- ============ MEDIA LIBRARY ============
CREATE TABLE public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'image',
  folder text NOT NULL DEFAULT 'outros',
  name text NOT NULL,
  url text NOT NULL,
  storage_path text,
  mime_type text,
  size_bytes bigint,
  width integer,
  height integer,
  duration_seconds numeric,
  thumbnail_url text,
  status text NOT NULL DEFAULT 'ready',
  provider text,
  provider_id text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.media_assets TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_assets TO authenticated;
GRANT ALL ON public.media_assets TO service_role;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Publicos veem midia" ON public.media_assets FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin gerencia midia" ON public.media_assets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER t_media_assets_updated BEFORE UPDATE ON public.media_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ TITLES (filmes e séries) ============
ALTER TABLE public.titles
  ADD COLUMN IF NOT EXISTS year integer,
  ADD COLUMN IF NOT EXISTS classification text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS thumbnail text,
  ADD COLUMN IF NOT EXISTS banner text,
  ADD COLUMN IF NOT EXISTS logo text,
  ADD COLUMN IF NOT EXISTS trailer_url text,
  ADD COLUMN IF NOT EXISTS video_source text NOT NULL DEFAULT 'url',
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS video_asset_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'publicado',
  ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_new boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_on_home boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

UPDATE public.titles SET status = CASE WHEN published THEN 'publicado' ELSE 'oculto' END;
UPDATE public.titles SET published_at = created_at WHERE published_at IS NULL AND published;

-- ============ EPISODES ============
ALTER TABLE public.episodes
  ADD COLUMN IF NOT EXISTS video_source text NOT NULL DEFAULT 'url',
  ADD COLUMN IF NOT EXISTS video_asset_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS release_date date,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'publicado',
  ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

UPDATE public.episodes SET status = CASE WHEN published THEN 'publicado' ELSE 'oculto' END;

-- ============ CATEGORIES ============
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;

-- ============ HOME SECTIONS ============
ALTER TABLE public.home_sections
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS limit_count integer NOT NULL DEFAULT 20;

-- ============ HERO SLIDES ============
CREATE TABLE public.hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_id uuid REFERENCES public.titles(id) ON DELETE SET NULL,
  media_type text NOT NULL DEFAULT 'image',
  image_desktop text,
  image_mobile text,
  video_url text,
  video_asset_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  logo text,
  badge text,
  title text NOT NULL,
  description text,
  year integer,
  duration text,
  classification text,
  cta_primary text NOT NULL DEFAULT 'Assistir',
  cta_secondary text NOT NULL DEFAULT 'Minha lista',
  slide_seconds integer NOT NULL DEFAULT 8,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hero_slides TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hero_slides TO authenticated;
GRANT ALL ON public.hero_slides TO service_role;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Publicos veem destaques publicados" ON public.hero_slides FOR SELECT TO anon, authenticated
  USING (published OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin gerencia destaques" ON public.hero_slides FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER t_hero_slides_updated BEFORE UPDATE ON public.hero_slides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- migra o banner atual para o primeiro slide
INSERT INTO public.hero_slides (title_id, media_type, image_desktop, badge, title, description, cta_primary, cta_secondary, sort_order, published)
SELECT b.title_id, 'image', b.image, b.badge, b.title, b.description, b.cta_primary, b.cta_secondary, b.sort_order, b.active
FROM public.banners b;

-- ============ PLANS ============
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price_cents integer NOT NULL DEFAULT 0,
  period text NOT NULL DEFAULT 'mensal',
  benefits text[] NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plans TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plans TO authenticated;
GRANT ALL ON public.plans TO service_role;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Publicos veem planos ativos" ON public.plans FOR SELECT TO anon, authenticated
  USING (active OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin gerencia planos" ON public.plans FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER t_plans_updated BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.plans (name, price_cents, period, benefits, sort_order) VALUES
  ('Grátis', 0, 'mensal', ARRAY['Catálogo limitado','1 perfil'], 0),
  ('Maná Kids+ Mensal', 1990, 'mensal', ARRAY['Catálogo completo','4 perfis','Sem anúncios'], 1),
  ('Maná Kids+ Anual', 17900, 'anual', ARRAY['Catálogo completo','4 perfis','Sem anúncios','2 meses grátis'], 2);

-- ============ SUBSCRIPTIONS ============
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS plan_id uuid REFERENCES public.plans(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS amount_cents integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS started_at date NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

-- ============ WATCH PROGRESS ============
CREATE TABLE public.watch_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  profile_key text NOT NULL DEFAULT 'default',
  title_id uuid REFERENCES public.titles(id) ON DELETE CASCADE,
  episode_id uuid REFERENCES public.episodes(id) ON DELETE CASCADE,
  position_seconds numeric NOT NULL DEFAULT 0,
  duration_seconds numeric NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, profile_key, title_id, episode_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.watch_progress TO authenticated;
GRANT ALL ON public.watch_progress TO service_role;
ALTER TABLE public.watch_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cada um ve seu progresso" ON public.watch_progress FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Cada um cria seu progresso" ON public.watch_progress FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Cada um atualiza seu progresso" ON public.watch_progress FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Cada um apaga seu progresso" ON public.watch_progress FOR DELETE TO authenticated
  USING (user_id = auth.uid());
CREATE TRIGGER t_watch_progress_updated BEFORE UPDATE ON public.watch_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();