import { supabase } from "@/integrations/supabase/client";
import { assetToUrl } from "@/lib/cms";

export type HeroSlide = {
  id: string;
  title_id: string | null;
  media_type: "image" | "video";
  image_desktop: string | null;
  image_mobile: string | null;
  video_url: string | null;
  logo: string | null;
  badge: string | null;
  title: string;
  description: string | null;
  year: number | null;
  duration: string | null;
  classification: string | null;
  cta_primary: string;
  cta_secondary: string;
  slide_seconds: number;
  published: boolean;
  sort_order: number;
};

export async function listHeroSlides(onlyPublished = false) {
  let query = supabase.from("hero_slides").select("*").order("sort_order", { ascending: true });
  if (onlyPublished) query = query.eq("published", true);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  // As imagens empacotadas com o app ficam no banco apenas como chave ("hero-mana").
  return ((data ?? []) as HeroSlide[]).map((s) => ({
    ...s,
    image_desktop: s.image_desktop ? assetToUrl(s.image_desktop) : null,
    image_mobile: s.image_mobile ? assetToUrl(s.image_mobile) : null,
    video_url: s.video_url ? assetToUrl(s.video_url) : null,
    logo: s.logo ? assetToUrl(s.logo) : null,
  }));
}

export async function upsertHeroSlide(slide: Partial<HeroSlide> & { title: string }) {
  const { data, error } = await supabase
    .from("hero_slides")
    .upsert(slide as never)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as HeroSlide;
}

export async function deleteHeroSlide(id: string) {
  const { error } = await supabase.from("hero_slides").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function reorderHeroSlides(slides: HeroSlide[]) {
  const { error } = await supabase
    .from("hero_slides")
    .upsert(slides.map((s, i) => ({ ...s, sort_order: i })) as never);
  if (error) throw new Error(error.message);
}

/** hero_slides.title_id guarda o id da tabela titles; a UI trabalha com slug. */
export async function loadTitleMaps() {
  const { data, error } = await supabase.from("titles").select("id, slug");
  if (error) throw new Error(error.message);
  const idBySlug = new Map((data ?? []).map((t) => [t.slug, t.id]));
  const slugById = new Map((data ?? []).map((t) => [t.id, t.slug]));
  return { idBySlug, slugById };
}
