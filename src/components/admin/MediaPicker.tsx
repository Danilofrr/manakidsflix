import { useCallback, useEffect, useState } from "react";
import { Film, ImagePlus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UploadQueueList, useUploadQueue } from "@/components/admin/UploadQueue";
import { listMedia, formatBytes, formatDuration, type MediaAsset, type MediaKind } from "@/lib/media";


export function MediaPicker({
  label,
  value,
  onChange,
  kind = "image",
  folder = "outros",
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  kind?: MediaKind;
  folder?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1.5 flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… ou escolha da biblioteca"
        />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm" aria-label="Escolher da biblioteca">
              <ImagePlus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="font-display">Biblioteca de mídia</DialogTitle>
            </DialogHeader>
            <MediaBrowser
              kind={kind}
              folder={folder}
              onPick={(asset) => {
                onChange(asset.url);
                setOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      {value && kind === "image" ? (
        <img
          src={value}
          alt=""
          className="mt-2 h-24 w-full rounded-xl object-cover"
          loading="lazy"
        />
      ) : null}
    </div>
  );
}

export function MediaBrowser({
  kind,
  folder,
  onPick,
}: {
  kind: MediaKind;
  folder: string;
  onPick: (asset: MediaAsset) => void;
}) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setAssets(await listMedia(kind));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
    setLoading(false);
  }, [kind]);

  const queue = useUploadQueue((asset) => setAssets((prev) => [asset, ...prev]));

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div>
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/70 px-4 py-6 font-display text-sm text-muted-foreground hover:border-primary hover:text-foreground">
        <Upload className="h-4 w-4" />
        Enviar novo arquivo
        <input
          type="file"
          multiple
          className="hidden"
          accept={kind === "video" ? "video/*" : "image/*"}
          onChange={(e) => {
            queue.enqueue(e.target.files ?? [], folder);
            e.target.value = "";
          }}
        />
      </label>

      <UploadQueueList items={queue.items} onDismiss={queue.dismiss} onRetry={queue.retry} />

      {error && <p className="mt-3 text-sm font-semibold text-destructive">{error}</p>}

      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Carregando…</p>
      ) : (
        <div className="mt-4 grid max-h-[50vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-4">
          {assets.map((a) => (
            <button
              key={a.id}
              onClick={() => onPick(a)}
              className="overflow-hidden rounded-xl border-2 border-border/70 text-left hover:border-primary"
            >
              {a.kind === "image" ? (
                <img src={a.url} alt={a.name} className="h-24 w-full object-cover" loading="lazy" />
              ) : a.thumbnail_url ? (
                <img
                  src={a.thumbnail_url}
                  alt={a.name}
                  className="h-24 w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-24 w-full items-center justify-center bg-muted">
                  <Film className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <p className="truncate px-2 pt-1.5 text-[11px] text-muted-foreground">{a.name}</p>
              <p className="truncate px-2 pb-1.5 text-[10px] text-muted-foreground">
                {formatBytes(a.size_bytes)}
                {a.kind === "video" ? ` · ${formatDuration(a.duration_seconds)}` : ""}
              </p>
            </button>
          ))}
          {assets.length === 0 && (
            <p className="col-span-full py-6 text-center text-sm text-muted-foreground">
              Nenhum arquivo ainda.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

