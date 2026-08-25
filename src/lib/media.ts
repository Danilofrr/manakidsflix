import * as tus from "tus-js-client";
import { supabase } from "@/integrations/supabase/client";

export type MediaKind = "image" | "video";

export type MediaAsset = {
  id: string;
  kind: MediaKind;
  folder: string;
  name: string;
  url: string;
  storage_path: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  duration_seconds: number | null;
  thumbnail_url: string | null;
  status: string;
  created_at: string;
};

export const MEDIA_FOLDERS = [
  "capas",
  "banners",
  "thumbnails",
  "logos",
  "trailers",
  "videos",
  "outros",
] as const;

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;
/** Supabase resumable uploads require exactly 6MB chunks. */
const CHUNK_SIZE = 6 * 1024 * 1024;

const SUPABASE_URL = import.meta.env['VITE_SUPABASE_URL'] as string;

const safeName = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .toLowerCase();

export async function listMedia(kind?: MediaKind) {
  let query = supabase
    .from("media_assets")
    .select(
      "id,kind,folder,name,url,storage_path,mime_type,size_bytes,duration_seconds,thumbnail_url,status,created_at",
    )
    .order("created_at", { ascending: false });
  if (kind) query = query.eq("kind", kind);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as MediaAsset[];
}

async function signedUrl(bucket: string, path: string) {
  const signed = await supabase.storage.from(bucket).createSignedUrl(path, TEN_YEARS);
  if (signed.error) throw new Error(signed.error.message);
  return signed.data.signedUrl;
}

/** Extrai duração e um frame de pré-visualização do vídeo, no navegador. */
async function probeVideo(file: File): Promise<{ duration: number | null; poster: Blob | null }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.src = url;
    const done = (duration: number | null, poster: Blob | null) => {
      URL.revokeObjectURL(url);
      resolve({ duration, poster });
    };
    const fail = () => done(null, null);
    video.onerror = fail;
    setTimeout(fail, 15000);
    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : null;
      video.currentTime = Math.min(1, (video.duration || 2) / 2);
      video.onseeked = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = 640;
          canvas.height = Math.round((video.videoHeight / video.videoWidth) * 640) || 360;
          const ctx = canvas.getContext("2d");
          if (!ctx) return done(duration, null);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => done(duration, blob), "image/jpeg", 0.7);
        } catch {
          done(duration, null);
        }
      };
    };
  });
}

export type UploadProgress = {
  uploaded: number;
  total: number;
  percent: number;
  status: "preparing" | "uploading" | "processing" | "done" | "error" | "paused";
};

export type UploadHandle = {
  abort: () => void;
  resume: () => void;
  promise: Promise<MediaAsset>;
};

/** Upload simples (imagens) — arquivos pequenos. */
async function uploadImage(file: File, folder: string): Promise<MediaAsset> {
  const path = `${folder}/${Date.now()}-${safeName(file.name)}`;
  const up = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (up.error) throw new Error(up.error.message);
  return insertAsset({
    kind: "image",
    folder,
    name: file.name,
    url: await signedUrl("media", path),
    storage_path: `media/${path}`,
    mime_type: file.type,
    size_bytes: file.size,
    status: "ready",
  });
}

async function insertAsset(row: Record<string, unknown>): Promise<MediaAsset> {
  const { data, error } = await supabase
    .from("media_assets")
    .insert(row as never)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as MediaAsset;
}

/**
 * Upload direto ao storage com protocolo resumível (TUS), em pedaços de 6MB.
 * Suporta arquivos grandes (400MB+, preparado para 1GB+), progresso, pausa e retomada.
 */
export function uploadMediaResumable(
  file: File,
  folder: string,
  onProgress?: (p: UploadProgress) => void,
): UploadHandle {
  const kind: MediaKind = file.type.startsWith("video") ? "video" : "image";
  let upload: tus.Upload | null = null;
  let aborted = false;

  const report = (status: UploadProgress["status"], uploaded: number) =>
    onProgress?.({
      uploaded,
      total: file.size,
      percent: file.size ? Math.round((uploaded / file.size) * 100) : 0,
      status,
    });

  const promise = (async () => {
    report("preparing", 0);

    if (kind === "image") {
      const asset = await uploadImage(file, folder);
      report("done", file.size);
      return asset;
    }

    const bucket = "videos";
    const path = `${folder}/${Date.now()}-${safeName(file.name)}`;

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) throw new Error("Sessão expirada. Entre novamente para enviar vídeos.");

    // Miniatura + duração antes de enviar (não bloqueia a interface).
    const { duration, poster } = await probeVideo(file);
    let thumbnail_url: string | null = null;
    if (poster) {
      const thumbPath = `thumbnails/${Date.now()}-${safeName(file.name)}.jpg`;
      const t = await supabase.storage.from("media").upload(thumbPath, poster, {
        cacheControl: "31536000",
        contentType: "image/jpeg",
        upsert: true,
      });
      if (!t.error) thumbnail_url = await signedUrl("media", thumbPath);
    }

    await new Promise<void>((resolve, reject) => {
      upload = new tus.Upload(file, {
        endpoint: `${SUPABASE_URL}/storage/v1/upload/resumable`,
        retryDelays: [0, 1000, 3000, 5000, 10000, 20000],
        headers: {
          authorization: `Bearer ${token}`,
          "x-upsert": "true",
        },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        chunkSize: CHUNK_SIZE,
        metadata: {
          bucketName: bucket,
          objectName: path,
          contentType: file.type || "video/mp4",
          cacheControl: "31536000",
        },
        onError: (err) => reject(err),
        onProgress: (sent, total) => {
          onProgress?.({
            uploaded: sent,
            total,
            percent: total ? Math.round((sent / total) * 100) : 0,
            status: "uploading",
          });
        },
        onSuccess: () => resolve(),
      });

      void upload.findPreviousUploads().then((previous) => {
        if (aborted) return;
        if (previous.length && previous[0]) upload?.resumeFromPreviousUpload(previous[0]);
        upload?.start();
      });
    });

    report("processing", file.size);
    const asset = await insertAsset({
      kind: "video",
      folder,
      name: file.name,
      url: await signedUrl(bucket, path),
      storage_path: `${bucket}/${path}`,
      mime_type: file.type,
      size_bytes: file.size,
      duration_seconds: duration,
      thumbnail_url,
      status: "ready",
    });
    report("done", file.size);
    return asset;
  })();

  return {
    abort: () => {
      aborted = true;
      void upload?.abort();
    },
    resume: () => {
      void upload?.start();
    },
    promise,
  };
}

/** Compatibilidade: upload aguardando conclusão. */
export async function uploadMedia(file: File, folder: string): Promise<MediaAsset> {
  return uploadMediaResumable(file, folder).promise;
}

export async function removeMedia(asset: MediaAsset) {
  if (asset.storage_path) {
    const [bucket, ...rest] = asset.storage_path.split("/");
    if (bucket && rest.length) await supabase.storage.from(bucket).remove([rest.join("/")]);
  }
  const { error } = await supabase.from("media_assets").delete().eq("id", asset.id);
  if (error) throw new Error(error.message);
}

export const formatBytes = (bytes: number | null) => {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(value < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
};

export const formatDuration = (seconds: number | null) => {
  if (!seconds || !Number.isFinite(seconds)) return "—";
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};
