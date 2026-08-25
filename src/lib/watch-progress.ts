import { supabase } from "@/integrations/supabase/client";

/** Percentual a partir do qual o título é considerado concluído. */
export const COMPLETED_AT = 0.9;

export type WatchProgress = {
  positionSeconds: number;
  durationSeconds: number;
  percent: number;
  completed: boolean;
};

const LOCAL_KEY = "mana-kids-progress";

/** Fallback por dispositivo (visitante sem login). */
function readLocal(): Record<string, number> {
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_KEY) ?? "{}") as Record<string, number>;
  } catch {
    return {};
  }
}

function writeLocalPercent(slug: string, percent: number) {
  try {
    const all = readLocal();
    all[slug] = Math.round(percent * 100);
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
  } catch {
    /* ignora quota */
  }
}

const POSITION_KEY = "mana-kids-position";

function readLocalPositions(): Record<string, { t: number; d: number }> {
  try {
    return JSON.parse(window.localStorage.getItem(POSITION_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export async function getWatchProgress(
  slug: string,
  titleId: string | null,
  episodeId: string | null,
): Promise<WatchProgress | null> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;

  if (user && titleId) {
    let query = supabase
      .from("watch_progress")
      .select("position_seconds, duration_seconds, completed")
      .eq("user_id", user.id)
      .eq("title_id", titleId);
    query = episodeId ? query.eq("episode_id", episodeId) : query.is("episode_id", null);
    const { data } = await query.maybeSingle();
    if (data) {
      const duration = Number(data.duration_seconds) || 0;
      const position = Number(data.position_seconds) || 0;
      return {
        positionSeconds: position,
        durationSeconds: duration,
        percent: duration ? position / duration : 0,
        completed: data.completed,
      };
    }
  }

  const local = readLocalPositions()[`${slug}:${episodeId ?? "main"}`];
  if (!local) return null;
  return {
    positionSeconds: local.t,
    durationSeconds: local.d,
    percent: local.d ? local.t / local.d : 0,
    completed: local.d ? local.t / local.d >= COMPLETED_AT : false,
  };
}

/** Grava o ponto atual (chamado a cada poucos segundos durante a reprodução). */
export async function saveWatchProgress(args: {
  slug: string;
  titleId: string | null;
  episodeId: string | null;
  currentTime: number;
  duration: number;
}) {
  const { slug, titleId, episodeId, currentTime, duration } = args;
  const percent = duration > 0 ? currentTime / duration : 0;
  const completed = percent >= COMPLETED_AT;

  try {
    const positions = readLocalPositions();
    positions[`${slug}:${episodeId ?? "main"}`] = { t: currentTime, d: duration };
    window.localStorage.setItem(POSITION_KEY, JSON.stringify(positions));
  } catch {
    /* ignora quota */
  }
  writeLocalPercent(slug, completed ? 1 : percent);

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user || !titleId) return;

  await supabase.from("watch_progress").upsert(
    {
      user_id: user.id,
      title_id: titleId,
      episode_id: episodeId,
      position_seconds: Math.floor(currentTime),
      duration_seconds: Math.floor(duration),
      completed,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,title_id,episode_id" },
  );
}
