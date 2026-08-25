import { supabase } from "@/integrations/supabase/client";
import type { SubtitleTrack } from "@/lib/subtitles";
import type { AppState, Category, Hero, Row, Story, Tone, Kind, VideoSource } from "@/lib/app-store";

import coverArca from "@/assets/cover-arca.jpg";
import coverDavi from "@/assets/cover-davi.jpg";
import coverDaniel from "@/assets/cover-daniel.jpg";
import coverJonas from "@/assets/cover-jonas.jpg";
import coverMoises from "@/assets/cover-moises.jpg";
import coverNatal from "@/assets/cover-natal.jpg";
import coverEden from "@/assets/cover-eden.jpg";
import heroImage from "@/assets/hero-mana.jpg";

/** Imagens que vêm empacotadas com o app: no banco guardamos só a chave. */
const ASSETS: Record<string, string> = {
  "cover-arca": coverArca,
  "cover-davi": coverDavi,
  "cover-daniel": coverDaniel,
  "cover-jonas": coverJonas,
  "cover-moises": coverMoises,
  "cover-natal": coverNatal,
  "cover-eden": coverEden,
  "hero-mana": heroImage,
};

const ASSET_KEY_BY_URL: Record<string, string> = Object.fromEntries(
  Object.entries(ASSETS).map(([key, url]) => [url, key]),
);

export const assetToUrl = (value: string | null | undefined) =>
  value ? (ASSETS[value] ?? value) : "";

export const urlToAsset = (value: string) => ASSET_KEY_BY_URL[value] ?? value;

/** Estoura o erro do Supabase em vez de falhar em silêncio. */
function must<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

/** Progresso de "continuar assistindo" é por dispositivo, não fica no banco. */
const PROGRESS_KEY = "mana-kids-progress";

export function readProgress(): Record<string, number> {
  try {
    return JSON.parse(window.localStorage.getItem(PROGRESS_KEY) ?? "{}") as Record<string, number>;
  } catch {
    return {};
  }
}

export type CmsData = Pick<AppState, "stories" | "rows" | "categories" | "hero">;

export async function loadCms(): Promise<CmsData | null> {
  const [titlesRes, sectionsRes, itemsRes, catsRes, bannerRes] = await Promise.all([
    supabase.from("titles").select("*").order("sort_order", { ascending: true }),
    supabase.from("home_sections").select("*").order("sort_order", { ascending: true }),
    supabase.from("home_section_items").select("*").order("sort_order", { ascending: true }),
    supabase.from("categories").select("*").order("sort_order", { ascending: true }),
    supabase.from("banners").select("*").order("sort_order", { ascending: true }).limit(1),
  ]);

  const { data: subtitleRows } = await supabase
    .from("video_subtitles")
    .select("*")
    .is("episode_id", null)
    .order("sort_order", { ascending: true });

  const subtitlesFor = (titleId: string, kind: "main" | "trailer"): SubtitleTrack[] =>
    (subtitleRows ?? [])
      .filter((r) => r.title_id === titleId && (r.kind ?? "main") === kind)
      .map((r) => ({
        id: r.id,
        languageCode: r.language_code,
        languageName: r.language_name,
        url: r.subtitle_url,
        format: r.format === "srt" ? ("srt" as const) : ("vtt" as const),
        isDefault: r.is_default,
      }));

  if (titlesRes.error || !titlesRes.data) return null;

  const progress = readProgress();

  const stories: Story[] = titlesRes.data.map((t) => ({
    slug: t.slug,
    title: t.title,
    cover: assetToUrl(t.cover),
    duration: t.duration ?? "",
    ageRange: t.age_range ?? "",
    verse: t.verse ?? "",
    summary: t.summary ?? "",
    tags: t.tags ?? [],
    kind: (t.kind === "serie" ? "serie" : "filme") as Kind,
    ...(t.video_url ? { videoUrl: assetToUrl(t.video_url) } : {}),
    ...(t.trailer_url ? { trailerUrl: assetToUrl(t.trailer_url) } : {}),
    videoSource: (t.video_source === "youtube"
      ? "youtube"
      : t.video_source === "external"
        ? "external"
        : "upload") as VideoSource,
    ...(t.hls_url ? { hlsUrl: t.hls_url } : {}),
    ...(t.external_video_id ? { externalVideoId: t.external_video_id } : {}),
    ...(t.trailer_hls_url ? { trailerHlsUrl: t.trailer_hls_url } : {}),
    ...(t.trailer_external_id ? { trailerExternalId: t.trailer_external_id } : {}),
    subtitles: subtitlesFor(t.id, "main"),
    trailerSubtitles: subtitlesFor(t.id, "trailer"),
    ...(t.youtube_url ? { youtubeUrl: t.youtube_url } : {}),
    ...(t.youtube_video_id ? { youtubeVideoId: t.youtube_video_id } : {}),
    trailerSource: (t.trailer_source === "youtube"
      ? "youtube"
      : t.trailer_source === "external"
        ? "external"
        : "upload") as VideoSource,
    ...(t.trailer_youtube_url ? { trailerYoutubeUrl: t.trailer_youtube_url } : {}),
    ...(t.trailer_youtube_id ? { trailerYoutubeId: t.trailer_youtube_id } : {}),
    ...(progress[t.slug] ? { progress: progress[t.slug] } : {}),
  }));

  const slugById = new Map(titlesRes.data.map((t) => [t.id, t.slug]));

  const rows: Row[] = (sectionsRes.data ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    subtitle: s.subtitle ?? "",
    slugs: (itemsRes.data ?? [])
      .filter((i) => i.section_id === s.id)
      .map((i) => slugById.get(i.title_id))
      .filter((v): v is string => Boolean(v)),
  }));

  const categories: Category[] = (catsRes.data ?? []).map((c) => ({
    id: c.id,
    label: c.label,
    tone: c.tone as Tone,
  }));

  const banner = bannerRes.data?.[0];
  const hero: Hero | null = banner
    ? {
        slug: banner.title_id ? (slugById.get(banner.title_id) ?? "") : "",
        badge: banner.badge ?? "",
        title: banner.title,
        description: banner.description ?? "",
        image: assetToUrl(banner.image),
        ctaPrimary: banner.cta_primary,
        ctaSecondary: banner.cta_secondary,
      }
    : null;

  return { stories, rows, categories, ...(hero ? { hero } : {}) } as CmsData;
}

/** Reescreve as faixas de legenda de um título. */
async function syncSubtitles(titleId: string, kind: "main" | "trailer", tracks: SubtitleTrack[]) {
  await supabase
    .from("video_subtitles")
    .delete()
    .eq("title_id", titleId)
    .eq("kind", kind)
    .is("episode_id", null);
  const valid = tracks.filter((t) => t.languageCode && t.url);
  if (!valid.length) return;
  await supabase.from("video_subtitles").insert(
    valid.map((t, i) => ({
      title_id: titleId,
      kind,
      language_code: t.languageCode,
      language_name: t.languageName || t.languageCode,
      subtitle_url: t.url,
      format: t.format,
      is_default: t.isDefault,
      sort_order: i,
    })),
  );
}

/** Sincroniza todo o conteúdo editado no admin com o banco (só o admin passa no RLS). */
export async function saveCms(state: AppState): Promise<void> {
  // ---- títulos ----
  const titlePayload = state.stories.map((s, index) => ({
    slug: s.slug,
    title: s.title,
    kind: s.kind,
    cover: urlToAsset(s.cover),
    duration: s.duration,
    age_range: s.ageRange,
    verse: s.verse,
    summary: s.summary,
    tags: s.tags,
    video_url: s.videoUrl ? urlToAsset(s.videoUrl) : null,
    trailer_url: s.trailerUrl ? urlToAsset(s.trailerUrl) : null,
    video_source: s.videoSource ?? "upload",
    youtube_url: s.youtubeUrl ?? null,
    youtube_video_id: s.youtubeVideoId ?? null,
    hls_url: s.hlsUrl ?? null,
    external_video_id: s.externalVideoId ?? null,
    trailer_source: s.trailerSource ?? "upload",
    trailer_youtube_url: s.trailerYoutubeUrl ?? null,
    trailer_youtube_id: s.trailerYoutubeId ?? null,
    trailer_hls_url: s.trailerHlsUrl ?? null,
    trailer_external_id: s.trailerExternalId ?? null,
    sort_order: index,
  }));
  if (titlePayload.length) {
    const { error } = await supabase.from("titles").upsert(titlePayload, { onConflict: "slug" });
    if (error) throw error;
  }
  const keptSlugs = state.stories.map((s) => s.slug);
  must(
    await supabase
      .from("titles")
      .delete()
      .not("slug", "in", `(${keptSlugs.map((s) => `"${s}"`).join(",") || '""'})`),
  );

  const titleRows = must(await supabase.from("titles").select("id, slug"));
  const idBySlug = new Map((titleRows ?? []).map((t) => [t.slug, t.id]));

  // ---- legendas de cada título ----
  for (const story of state.stories) {
    const titleId = idBySlug.get(story.slug);
    if (!titleId) continue;
    await syncSubtitles(titleId, "main", story.subtitles ?? []);
    await syncSubtitles(titleId, "trailer", story.trailerSubtitles ?? []);
  }

  // ---- categorias ----
  const catsWithId = state.categories.filter((c) => isUuid(c.id));
  const catsNew = state.categories.filter((c) => !isUuid(c.id));
  if (catsWithId.length) {
    must(
      await supabase
        .from("categories")
        .upsert(catsWithId.map((c, i) => ({ id: c.id, label: c.label, tone: c.tone, sort_order: i }))),
    );
  }
  if (catsNew.length) {
    must(
      await supabase.from("categories").insert(
        catsNew.map((c, i) => ({ label: c.label, tone: c.tone, sort_order: catsWithId.length + i })),
      ),
    );
  }
  const keptCats = catsWithId.map((c) => c.id);
  if (keptCats.length) {
    must(await supabase.from("categories").delete().not("id", "in", `(${keptCats.join(",")})`));
  }

  // ---- fileiras da home ----
  const rowsWithId = state.rows.filter((r) => isUuid(r.id));
  if (rowsWithId.length) {
    must(
      await supabase.from("home_sections").upsert(
        rowsWithId.map((r) => ({
          id: r.id,
          title: r.title,
          subtitle: r.subtitle,
          sort_order: state.rows.indexOf(r),
        })),
      ),
    );
  }
  for (const row of state.rows.filter((r) => !isUuid(r.id))) {
    const created = must(
      await supabase
        .from("home_sections")
        .insert({ title: row.title, subtitle: row.subtitle, sort_order: state.rows.indexOf(row) })
        .select("id")
        .single(),
    );
    if (created) row.id = created.id;
  }
  const keptRows = state.rows.filter((r) => isUuid(r.id)).map((r) => r.id);
  if (keptRows.length) {
    must(await supabase.from("home_sections").delete().not("id", "in", `(${keptRows.join(",")})`));
  }

  // ---- itens de cada fileira (reescreve) ----
  for (const row of state.rows) {
    if (!isUuid(row.id)) continue;
    must(await supabase.from("home_section_items").delete().eq("section_id", row.id));
    const seen = new Set<string>();
    const items = row.slugs
      .map((slug, i) => ({ section_id: row.id, title_id: idBySlug.get(slug), sort_order: i }))
      .filter((i): i is { section_id: string; title_id: string; sort_order: number } => {
        if (!i.title_id || seen.has(i.title_id)) return false;
        seen.add(i.title_id);
        return true;
      });
    if (items.length) must(await supabase.from("home_section_items").insert(items));
  }

  // ---- banner ----
  const heroPayload = {
    title_id: idBySlug.get(state.hero.slug) ?? null,
    badge: state.hero.badge,
    title: state.hero.title,
    description: state.hero.description,
    image: urlToAsset(state.hero.image),
    cta_primary: state.hero.ctaPrimary,
    cta_secondary: state.hero.ctaSecondary,
    sort_order: 0,
  };
  const existingBanner = must(
    await supabase.from("banners").select("id").limit(1).maybeSingle(),
  );
  if (existingBanner)
    must(await supabase.from("banners").update(heroPayload).eq("id", existingBanner.id));
  else must(await supabase.from("banners").insert(heroPayload));

  // ---- cores e textos ----
  must(
    await supabase
      .from("site_settings")
      .upsert({ id: "default", brand: state.brand, texts: state.texts }),
  );
}

export async function loadSettings() {
  const { data } = await supabase
    .from("site_settings")
    .select("brand, texts")
    .eq("id", "default")
    .maybeSingle();
  return data;
}
