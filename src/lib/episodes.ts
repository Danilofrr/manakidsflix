import { supabase } from "@/integrations/supabase/client";

export type Season = {
  id: string;
  title_id: string;
  number: number;
  name: string | null;
};

export type Episode = {
  id: string;
  season_id: string;
  number: number;
  name: string;
  duration: string | null;
  cover: string | null;
  summary: string | null;
  video_url: string | null;
  hls_url: string | null;
  video_source: "youtube" | "mana_kids" | "external";
  youtube_url: string | null;
  youtube_video_id: string | null;
  video_provider: string | null;
  provider_video_id: string | null;
  published: boolean;
  sort_order: number;
};

export async function listSeasons(titleId: string) {
  const { data, error } = await supabase
    .from("seasons")
    .select("id, title_id, number, name")
    .eq("title_id", titleId)
    .order("number", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Season[];
}

export async function listEpisodes(seasonIds: string[]) {
  if (seasonIds.length === 0) return [] as Episode[];
  const { data, error } = await supabase
    .from("episodes")
    .select("id, season_id, number, name, duration, cover, summary, video_url, hls_url, video_source, youtube_url, youtube_video_id, video_provider, provider_video_id, published, sort_order")
    .in("season_id", seasonIds)
    .order("number", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Episode[];
}

/** Temporadas + episódios de um título, prontos para a tela da história. */
export async function loadSeasonsWithEpisodes(titleId: string) {
  const seasons = await listSeasons(titleId);
  const episodes = await listEpisodes(seasons.map((s) => s.id));
  return seasons.map((season) => ({
    season,
    episodes: episodes.filter((e) => e.season_id === season.id),
  }));
}

export async function createSeason(titleId: string, number: number, name: string) {
  const { data, error } = await supabase
    .from("seasons")
    .insert({ title_id: titleId, number, name })
    .select("id, title_id, number, name")
    .single();
  if (error) throw new Error(error.message);
  return data as Season;
}

export async function updateSeason(id: string, patch: Partial<Pick<Season, "number" | "name">>) {
  const { error } = await supabase.from("seasons").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteSeason(id: string) {
  const { error } = await supabase.from("seasons").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function createEpisode(seasonId: string, number: number) {
  const { data, error } = await supabase
    .from("episodes")
    .insert({ season_id: seasonId, number, name: `Episódio ${number}`, sort_order: number, video_source: "mana_kids" })
    .select("id, season_id, number, name, duration, cover, summary, video_url, hls_url, video_source, youtube_url, youtube_video_id, video_provider, provider_video_id, published, sort_order")
    .single();
  if (error) throw new Error(error.message);
  return data as Episode;
}

export async function saveEpisode(ep: Episode) {
  const { error } = await supabase
    .from("episodes")
    .update({
      number: ep.number,
      name: ep.name,
      duration: ep.duration,
      cover: ep.cover,
      summary: ep.summary,
      video_url: ep.video_url,
      hls_url: ep.hls_url,
      video_source: ep.video_source,
      youtube_url: ep.youtube_url,
      youtube_video_id: ep.youtube_video_id,
      video_provider: ep.video_provider,
      provider_video_id: ep.provider_video_id,
      published: ep.published,
      sort_order: ep.number,
    })
    .eq("id", ep.id);
  if (error) throw new Error(error.message);
}

export async function deleteEpisode(id: string) {
  const { error } = await supabase.from("episodes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** A UI trabalha com slug; as tabelas guardam o id do título. */
export async function titleIdBySlug(slug: string) {
  const { data, error } = await supabase.from("titles").select("id").eq("slug", slug).maybeSingle();
  if (error) throw new Error(error.message);
  return data?.id ?? null;
}
