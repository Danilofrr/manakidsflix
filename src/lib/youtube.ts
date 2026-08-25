/** Utilitários para reconhecer vídeos do YouTube colados pelo admin. */

export type VideoSource = "mana_kids" | "youtube" | "external";

/** Extrai o ID de qualquer formato comum de URL do YouTube (ou do próprio ID). */
export function parseYouTubeId(input: string | null | undefined): string | null {
  const raw = (input ?? "").trim();
  if (!raw) return null;

  if (/^[\w-]{11}$/.test(raw)) return raw;

  let url: URL;
  try {
    url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\.|^m\./, "");
  const isYouTube =
    host === "youtube.com" ||
    host === "youtu.be" ||
    host === "youtube-nocookie.com" ||
    host.endsWith(".youtube.com");
  if (!isYouTube) return null;

  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0] ?? "";
    return /^[\w-]{11}$/.test(id) ? id : null;
  }

  const v = url.searchParams.get("v");
  if (v && /^[\w-]{11}$/.test(v)) return v;

  const parts = url.pathname.split("/").filter(Boolean);
  const marker = parts.findIndex((p) => ["embed", "shorts", "live", "v"].includes(p));
  if (marker >= 0) {
    const id = parts[marker + 1] ?? "";
    return /^[\w-]{11}$/.test(id) ? id : null;
  }
  return null;
}

export const isYouTubeUrl = (value: string) => parseYouTubeId(value) !== null;

export const youtubeThumbnail = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

let apiPromise: Promise<typeof window.YT> | null = null;

/** Carrega a IFrame Player API uma única vez. */
export function loadYouTubeApi(): Promise<typeof window.YT> {
  if (typeof window === "undefined") return Promise.reject(new Error("sem window"));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(window.YT);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.head.appendChild(script);
  });
  return apiPromise;
}

declare global {
  interface Window {
    // A API oficial não tem tipos oficiais; usamos um contrato mínimo.
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}
