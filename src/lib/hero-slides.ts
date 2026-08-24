import { supabase } from "@/integrations/supabase/client";

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
  return (data ?? []) as HeroSlide[];
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
