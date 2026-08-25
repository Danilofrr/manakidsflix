import { supabase } from "@/integrations/supabase/client";

/** Faixa de legenda cadastrada no painel da Maná Kids. */
export type SubtitleTrack = {
  id: string;
  languageCode: string;
  languageName: string;
  url: string;
  format: "vtt" | "srt";
  isDefault: boolean;
};

export const SUBTITLE_LANGUAGES = [
  { code: "pt-BR", name: "Português (Brasil)" },
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "it", name: "Italiano" },
] as const;

export const PREFERRED_LANGUAGE = "pt-BR";

const PREF_KEY = "mana-kids-captions";

export type CaptionPreference = { enabled: boolean; language: string | null };

export function readCaptionPreference(): CaptionPreference {
  if (typeof window === "undefined") return { enabled: false, language: PREFERRED_LANGUAGE };
  try {
    const raw = window.localStorage.getItem(PREF_KEY);
    if (!raw) return { enabled: false, language: PREFERRED_LANGUAGE };
    const parsed = JSON.parse(raw) as Partial<CaptionPreference>;
    return {
      enabled: Boolean(parsed.enabled),
      language: parsed.language ?? PREFERRED_LANGUAGE,
    };
  } catch {
    return { enabled: false, language: PREFERRED_LANGUAGE };
  }
}

export function writeCaptionPreference(pref: CaptionPreference) {
  try {
    window.localStorage.setItem(PREF_KEY, JSON.stringify(pref));
  } catch {
    /* ignora quota */
  }
}

/** Converte SRT em WebVTT para o navegador conseguir exibir. */
export function srtToVtt(input: string): string {
  const body = input
    .replace(/\r+/g, "")
    .replace(/^\uFEFF/, "")
    .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");
  return `WEBVTT\n\n${body.trim()}\n`;
}

const blobCache = new Map<string, string>();

/** Devolve uma URL que o <track> consegue ler (converte SRT quando preciso). */
export async function resolveTrackUrl(track: SubtitleTrack): Promise<string> {
  if (track.format !== "srt") return track.url;
  const cached = blobCache.get(track.url);
  if (cached) return cached;
  try {
    const text = await fetch(track.url).then((r) => r.text());
    const blob = new Blob([srtToVtt(text)], { type: "text/vtt" });
    const objectUrl = URL.createObjectURL(blob);
    blobCache.set(track.url, objectUrl);
    return objectUrl;
  } catch {
    return track.url;
  }
}

/** Escolhe a faixa inicial respeitando a preferência salva. */
export function pickTrack(tracks: SubtitleTrack[], language: string | null) {
  if (!tracks.length) return null;
  return (
    tracks.find((t) => t.languageCode === language) ??
    tracks.find((t) => t.languageCode === PREFERRED_LANGUAGE) ??
    tracks.find((t) => t.isDefault) ??
    tracks[0] ??
    null
  );
}

type Row = {
  id: string;
  language_code: string;
  language_name: string;
  subtitle_url: string;
  format: string;
  is_default: boolean;
};

const toTrack = (r: Row): SubtitleTrack => ({
  id: r.id,
  languageCode: r.language_code,
  languageName: r.language_name,
  url: r.subtitle_url,
  format: r.format === "srt" ? "srt" : "vtt",
  isDefault: r.is_default,
});

/** Legendas de um título (vídeo principal ou trailer). */
export async function loadTitleSubtitles(
  titleId: string,
  kind: "main" | "trailer" = "main",
): Promise<SubtitleTrack[]> {
  const { data } = await supabase
    .from("video_subtitles")
    .select("id, language_code, language_name, subtitle_url, format, is_default")
    .eq("title_id", titleId)
    .eq("kind", kind)
    .is("episode_id", null)
    .order("sort_order", { ascending: true });
  return (data ?? []).map((r) => toTrack(r as Row));
}

/** Legendas de um episódio específico. */
export async function loadEpisodeSubtitles(episodeId: string): Promise<SubtitleTrack[]> {
  const { data } = await supabase
    .from("video_subtitles")
    .select("id, language_code, language_name, subtitle_url, format, is_default")
    .eq("episode_id", episodeId)
    .order("sort_order", { ascending: true });
  return (data ?? []).map((r) => toTrack(r as Row));
}

/** Reescreve as legendas de um título no banco (usado pelo admin). */
export async function saveTitleSubtitles(
  titleId: string,
  kind: "main" | "trailer",
  tracks: SubtitleTrack[],
) {
  await supabase
    .from("video_subtitles")
    .delete()
    .eq("title_id", titleId)
    .eq("kind", kind)
    .is("episode_id", null);
  if (!tracks.length) return;
  await supabase.from("video_subtitles").insert(
    tracks.map((t, i) => ({
      title_id: titleId,
      kind,
      language_code: t.languageCode,
      language_name: t.languageName,
      subtitle_url: t.url,
      format: t.format,
      is_default: t.isDefault,
      sort_order: i,
    })),
  );
}
