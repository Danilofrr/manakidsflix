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

const safeName = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .toLowerCase();

export async function listMedia(kind?: MediaKind) {
  let query = supabase
    .from("media_assets")
    .select("*")
    .order("created_at", { ascending: false });
  if (kind) query = query.eq("kind", kind);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as MediaAsset[];
}

export async function uploadMedia(file: File, folder: string): Promise<MediaAsset> {
  const kind: MediaKind = file.type.startsWith("video") ? "video" : "image";
  const bucket = kind === "video" ? "videos" : "media";
  const path = `${folder}/${Date.now()}-${safeName(file.name)}`;

  const up = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (up.error) throw new Error(up.error.message);

  const signed = await supabase.storage.from(bucket).createSignedUrl(path, TEN_YEARS);
  if (signed.error) throw new Error(signed.error.message);

  const { data, error } = await supabase
    .from("media_assets")
    .insert({
      kind,
      folder,
      name: file.name,
      url: signed.data.signedUrl,
      storage_path: `${bucket}/${path}`,
      mime_type: file.type,
      size_bytes: file.size,
      status: "ready",
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as MediaAsset;
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
