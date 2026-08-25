import { useState } from "react";
import { CheckCircle2, Cloud, Eye, Library, Youtube } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { SubtitlesField } from "@/components/admin/SubtitlesField";
import { parseYouTubeId, youtubeThumbnail, type VideoSource } from "@/lib/youtube";
import type { SubtitleTrack } from "@/lib/subtitles";

export type VideoSourceValue = {
  source: VideoSource;
  /** URL do arquivo da biblioteca ou MP4 externo. */
  url: string;
  youtubeUrl: string;
  youtubeId: string;
  /** Playlist HLS (.m3u8) de Bunny, Cloudflare Stream, Mux etc. */
  hlsUrl: string;
  provider: string;
  providerVideoId: string;
  subtitles: SubtitleTrack[];
};

/** Campo de vídeo com três fontes: YouTube, biblioteca Maná Kids ou streaming externo. */
export function VideoSourceField({
  label,
  folder,
  value,
  onChange,
}: {
  label: string;
  folder: string;
  value: VideoSourceValue;
  onChange: (next: VideoSourceValue) => void;
}) {
  const [preview, setPreview] = useState(false);
  const detected = parseYouTubeId(value.youtubeUrl);
  const typed = value.youtubeUrl.trim().length > 0;

  return (
    <div className="rounded-2xl border-2 border-border/70 p-3">
      <Label>{label}</Label>

      <div className="mt-2 flex flex-wrap gap-2">
        {(
          [
            { key: "youtube", icon: Youtube, text: "YouTube" },
            { key: "mana_kids", icon: Library, text: "Biblioteca Maná Kids" },
            { key: "external", icon: Cloud, text: "Streaming externo" },
          ] as const
        ).map(({ key, icon: Icon, text }) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange({ ...value, source: key })}
            className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 font-display text-xs ${
              value.source === key ? "border-primary bg-muted" : "border-border/70"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {text}
          </button>
        ))}
      </div>

      {value.source === "youtube" ? (
        <div className="mt-3">
          <Label htmlFor={`yt-${label}`}>URL do vídeo do YouTube</Label>
          <Input
            id={`yt-${label}`}
            value={value.youtubeUrl}
            placeholder="https://www.youtube.com/watch?v=..."
            onChange={(e) => {
              const youtubeUrl = e.target.value;
              onChange({ ...value, youtubeUrl, youtubeId: parseYouTubeId(youtubeUrl) ?? "" });
            }}
          />

          {typed && !detected ? (
            <p className="mt-2 text-sm font-semibold text-destructive">
              Não foi possível identificar este vídeo. Verifique o link e tente novamente.
            </p>
          ) : null}

          {detected ? (
            <div className="mt-3 flex items-center gap-3 rounded-2xl bg-muted p-2">
              <img
                src={youtubeThumbnail(detected)}
                alt=""
                className="h-16 w-28 shrink-0 rounded-xl object-cover"
                loading="lazy"
              />
              <p className="flex-1 font-display text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                  Vídeo identificado
                </span>
                <span className="mt-1 block">
                  As legendas vêm do próprio vídeo, quando existirem.
                </span>
              </p>
              <Button type="button" variant="outline" size="sm" onClick={() => setPreview(true)}>
                <Eye className="h-4 w-4" />
                Visualizar
              </Button>
            </div>
          ) : null}

          <Dialog open={preview} onOpenChange={setPreview}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle className="font-display">Prévia do vídeo</DialogTitle>
              </DialogHeader>
              {detected ? (
                <iframe
                  title="Prévia"
                  className="aspect-video w-full rounded-2xl"
                  src={`https://www.youtube.com/embed/${detected}?rel=0&playsinline=1`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : null}
            </DialogContent>
          </Dialog>
        </div>
      ) : value.source === "external" ? (
        <div className="mt-3 space-y-3">
          <div>
            <Label htmlFor={`hls-${label}`}>URL HLS (.m3u8) — preferencial</Label>
            <Input
              id={`hls-${label}`}
              value={value.hlsUrl}
              placeholder="https://…/playlist.m3u8"
              onChange={(e) => onChange({ ...value, hlsUrl: e.target.value })}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Use a playlist HLS do Bunny Stream, Cloudflare Stream, Mux ou outro provedor.
            </p>
          </div>
          <div>
            <Label htmlFor={`mp4-${label}`}>URL MP4 (alternativa)</Label>
            <Input
              id={`mp4-${label}`}
              value={value.url}
              placeholder="https://…/video.mp4"
              onChange={(e) => onChange({ ...value, url: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor={`provider-${label}`}>Provedor</Label>
            <Input
              id={`provider-${label}`}
              value={value.provider}
              placeholder="Bunny Stream, Cloudflare Stream, Mux ou outro"
              onChange={(e) => onChange({ ...value, provider: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor={`ext-${label}`}>ID do vídeo no provedor (opcional)</Label>
            <Input
              id={`ext-${label}`}
              value={value.providerVideoId}
              onChange={(e) => onChange({ ...value, providerVideoId: e.target.value })}
            />
          </div>
          <SubtitlesField
            value={value.subtitles}
            onChange={(subtitles) => onChange({ ...value, subtitles })}
          />
        </div>
      ) : (
        <div className="mt-3">
          <MediaPicker
            label="Arquivo do vídeo"
            kind="video"
            folder={folder}
            value={value.url}
            onChange={(url) => onChange({ ...value, url })}
          />
          <SubtitlesField
            value={value.subtitles}
            onChange={(subtitles) => onChange({ ...value, subtitles })}
          />
        </div>
      )}
    </div>
  );
}
