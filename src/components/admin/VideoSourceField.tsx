import { useState } from "react";
import { CheckCircle2, Eye, Library, Youtube } from "lucide-react";
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
import { parseYouTubeId, youtubeThumbnail, type VideoSource } from "@/lib/youtube";

export type VideoSourceValue = {
  source: VideoSource;
  /** URL do arquivo da biblioteca. */
  url: string;
  youtubeUrl: string;
  youtubeId: string;
};

/** Campo de vídeo com duas fontes: YouTube ou biblioteca da Maná Kids. */
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

      <div className="mt-2 flex gap-2">
        {(
          [
            { key: "youtube", icon: Youtube, text: "YouTube" },
            { key: "upload", icon: Library, text: "Biblioteca da Maná Kids" },
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
              Não foi possível identificar este vídeo do YouTube. Verifique o link e tente
              novamente.
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
      ) : (
        <div className="mt-3">
          <MediaPicker
            label="Arquivo do vídeo"
            kind="video"
            folder={folder}
            value={value.url}
            onChange={(url) => onChange({ ...value, url })}
          />
        </div>
      )}
    </div>
  );
}
