-- ============ TABELAS ============
CREATE TABLE public.titles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  kind text NOT NULL DEFAULT 'filme',
  cover text,
  duration text,
  age_range text,
  verse text,
  summary text,
  tags text[] NOT NULL DEFAULT '{}',
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.titles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.titles TO authenticated;
GRANT ALL ON public.titles TO service_role;
ALTER TABLE public.titles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Publicos veem titulos publicados" ON public.titles FOR SELECT TO anon, authenticated USING (published OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin gerencia titulos" ON public.titles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_id uuid NOT NULL REFERENCES public.titles(id) ON DELETE CASCADE,
  number integer NOT NULL DEFAULT 1,
  name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (title_id, number)
);
GRANT SELECT ON public.seasons TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seasons TO authenticated;
GRANT ALL ON public.seasons TO service_role;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Publicos veem temporadas" ON public.seasons FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.titles t WHERE t.id = title_id AND (t.published OR public.has_role(auth.uid(), 'admin'))));
CREATE POLICY "Admin gerencia temporadas" ON public.seasons FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  number integer NOT NULL DEFAULT 1,
  name text NOT NULL,
  duration text,
  cover text,
  summary text,
  video_url text,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.episodes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.episodes TO authenticated;
GRANT ALL ON public.episodes TO service_role;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Publicos veem episodios" ON public.episodes FOR SELECT TO anon, authenticated USING (published OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin gerencia episodios" ON public.episodes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  tone text NOT NULL DEFAULT 'primary',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Publicos veem categorias" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin gerencia categorias" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.title_categories (
  title_id uuid NOT NULL REFERENCES public.titles(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (title_id, category_id)
);
GRANT SELECT ON public.title_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.title_categories TO authenticated;
GRANT ALL ON public.title_categories TO service_role;
ALTER TABLE public.title_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Publicos veem vinculos" ON public.title_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin gerencia vinculos" ON public.title_categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.home_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  sort_order integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.home_sections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.home_sections TO authenticated;
GRANT ALL ON public.home_sections TO service_role;
ALTER TABLE public.home_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Publicos veem secoes" ON public.home_sections FOR SELECT TO anon, authenticated USING (visible OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin gerencia secoes" ON public.home_sections FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.home_section_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES public.home_sections(id) ON DELETE CASCADE,
  title_id uuid NOT NULL REFERENCES public.titles(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  UNIQUE (section_id, title_id)
);
GRANT SELECT ON public.home_section_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.home_section_items TO authenticated;
GRANT ALL ON public.home_section_items TO service_role;
ALTER TABLE public.home_section_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Publicos veem itens das secoes" ON public.home_section_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin gerencia itens das secoes" ON public.home_section_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_id uuid REFERENCES public.titles(id) ON DELETE SET NULL,
  badge text,
  title text NOT NULL,
  description text,
  image text,
  cta_primary text NOT NULL DEFAULT 'Assistir agora',
  cta_secondary text NOT NULL DEFAULT 'Minha lista',
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banners TO authenticated;
GRANT ALL ON public.banners TO service_role;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Publicos veem banners ativos" ON public.banners FOR SELECT TO anon, authenticated USING (active OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin gerencia banners" ON public.banners FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.site_settings (
  id text PRIMARY KEY DEFAULT 'default',
  brand jsonb NOT NULL DEFAULT '{}'::jsonb,
  texts jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Publicos veem config" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin gerencia config" ON public.site_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ TRIGGERS updated_at ============
CREATE TRIGGER t_titles_updated BEFORE UPDATE ON public.titles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_seasons_updated BEFORE UPDATE ON public.seasons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_episodes_updated BEFORE UPDATE ON public.episodes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_categories_updated BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_home_sections_updated BEFORE UPDATE ON public.home_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_banners_updated BEFORE UPDATE ON public.banners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_site_settings_updated BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ CONTEUDO INICIAL ============
INSERT INTO public.titles (slug, title, kind, cover, duration, age_range, verse, summary, tags, sort_order, featured) VALUES
('a-arca-de-noe','A Arca de Noé','filme','cover-arca','12 min','3-6 anos','Gênesis 6-9','Noé constrói um barco gigante e enche de bichinhos aos pares. Depois da chuva, um arco-íris colorido aparece no céu como promessa de cuidado.','{Animais,Promessa,Aventura}',1,false),
('davi-e-o-gigante','Davi e o Gigante','filme','cover-davi','10 min','4-8 anos','1 Samuel 17','O menino pastor descobre que coragem não tem tamanho. Com cinco pedrinhas e muita fé, Davi enfrenta o gigante Golias.','{Coragem,Herói,Fé}',2,false),
('daniel-e-os-leoes','Daniel e os Leões','filme','cover-daniel','11 min','4-8 anos','Daniel 6','Daniel passa a noite na cova dos leões e descobre que nunca esteve sozinho. Uma história sobre oração e amizade.','{Oração,Confiança,Animais}',3,false),
('jonas-e-o-grande-peixe','Jonas e o Grande Peixe','filme','cover-jonas','13 min','3-7 anos','Jonas 1-3','Jonas tenta fugir, mas acaba numa viagem submarina inesquecível dentro de um peixe enorme. No fim, ele aprende a dizer sim.','{Perdão,Mar,Humor}',4,false),
('moises-e-o-mar-vermelho','Moisés e o Mar Vermelho','filme','cover-moises','14 min','5-9 anos','Êxodo 14','As águas se abrem em duas paredes gigantes e um caminho seco aparece. A maior travessia da história vira uma aventura para as crianças.','{Aventura,Milagre,Liberdade}',5,true),
('o-primeiro-natal','O Primeiro Natal','filme','cover-natal','9 min','2-6 anos','Lucas 2','Uma estrela brilhante guia pastores e visitantes até um bebê numa manjedoura, cercado por bichinhos curiosos.','{Natal,Ninar,Estrela}',6,false),
('o-jardim-do-eden','O Jardim do Éden','filme','cover-eden','8 min','2-5 anos','Gênesis 1-2','Flores, borboletas e bichinhos aparecem um por um no jardim mais colorido de todos os tempos. Perfeito para os menorzinhos.','{Criação,Natureza,Calma}',7,false);

INSERT INTO public.categories (label, tone, sort_order) VALUES
('Aventura','primary',1),('Animais','secondary',2),('Músicas','accent',3),('Soninho','sunny',4),('Coragem','mint',5);

INSERT INTO public.home_sections (title, subtitle, sort_order) VALUES
('Continuar assistindo','De onde a Nina parou',1),
('Histórias mais amadas','Campeãs de repeteco',2),
('Aventuras corajosas','Para quem gosta de emoção',3),
('Hora do soninho','Bem calminhas, para dormir',4);

INSERT INTO public.home_section_items (section_id, title_id, sort_order)
SELECT s.id, t.id, x.ord
FROM (VALUES
 ('Continuar assistindo','a-arca-de-noe',1),
 ('Continuar assistindo','davi-e-o-gigante',2),
 ('Continuar assistindo','jonas-e-o-grande-peixe',3),
 ('Histórias mais amadas','a-arca-de-noe',1),
 ('Histórias mais amadas','davi-e-o-gigante',2),
 ('Histórias mais amadas','o-primeiro-natal',3),
 ('Histórias mais amadas','moises-e-o-mar-vermelho',4),
 ('Histórias mais amadas','jonas-e-o-grande-peixe',5),
 ('Aventuras corajosas','davi-e-o-gigante',1),
 ('Aventuras corajosas','moises-e-o-mar-vermelho',2),
 ('Aventuras corajosas','daniel-e-os-leoes',3),
 ('Aventuras corajosas','jonas-e-o-grande-peixe',4),
 ('Hora do soninho','o-jardim-do-eden',1),
 ('Hora do soninho','o-primeiro-natal',2),
 ('Hora do soninho','a-arca-de-noe',3)
) AS x(sec, slug, ord)
JOIN public.home_sections s ON s.title = x.sec
JOIN public.titles t ON t.slug = x.slug;

INSERT INTO public.banners (title_id, badge, title, description, image, cta_primary, cta_secondary, sort_order)
SELECT id,'Novo episódio desta semana','Moisés e o Mar Vermelho','As águas se abrem em duas paredes gigantes e um caminho seco aparece. A maior travessia da história vira uma aventura para as crianças.','hero-mana','Assistir agora','Minha lista',1
FROM public.titles WHERE slug = 'moises-e-o-mar-vermelho';

INSERT INTO public.site_settings (id, brand, texts) VALUES (
 'default',
 '{"primary":"#ef6a4d","secondary":"#3fbfc9","accent":"#a463e0","sunny":"#f6c445"}'::jsonb,
 '{"safetyTitle":"Tudo seguro, do começo ao fim","safetyBody":"Sem anúncios, sem links externos e com controle de tempo de tela. Os pais escolhem, as crianças se divertem.","footer":"Maná Kids+ · histórias bíblicas animadas para os pequenos"}'::jsonb
);