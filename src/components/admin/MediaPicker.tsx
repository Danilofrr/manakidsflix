import { useEffect, useState } from "react";
import { ImagePlus, Loader2, Upload } from "lucide-react";
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
import { listMedia, uploadMedia, type MediaAsset, type MediaKind } from "@/lib/media";

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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      setAssets(await listMedia(kind));
    } catch (e) {
      setError((e as Error).message);
    }
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      for (const file of Array.from(files)) await uploadMedia(file, folder);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(false);
  }

  return (
    <div>
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/70 px-4 py-6 font-display text-sm text-muted-foreground hover:border-primary hover:text-foreground">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {busy ? "Enviando…" : "Enviar novo arquivo"}
        <input
          type="file"
          multiple
          className="hidden"
          accept={kind === "video" ? "video/*" : "image/*"}
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </label>

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
              ) : (
                <video src={a.url} className="h-24 w-full object-cover" muted />
              )}
              <p className="truncate px-2 py-1.5 text-[11px] text-muted-foreground">{a.name}</p>
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
