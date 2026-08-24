import { useEffect, useState } from "react";
import { Loader2, Trash2, Upload, Copy } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import {
  listMedia,
  removeMedia,
  uploadMedia,
  formatBytes,
  MEDIA_FOLDERS,
  type MediaAsset,
} from "@/lib/media";

export function MediaTab() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [folder, setFolder] = useState<string>("capas");
  const [filter, setFilter] = useState<string>("todos");

  async function refresh() {
    setLoading(true);
    try {
      setAssets(await listMedia());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

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

  const visible = assets.filter((a) => filter === "todos" || a.folder === filter);

  return (
    <>
      <PageHeader
        title="Biblioteca de mídia"
        subtitle="Envie capas, banners, logos, trailers e vídeos. Tudo fica disponível nos formulários do painel."
      />

      <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-card">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display text-sm text-muted-foreground">Enviar para:</span>
          {MEDIA_FOLDERS.map((f) => (
            <button
              key={f}
              onClick={() => setFolder(f)}
              className={`rounded-full border-2 px-3 py-1.5 font-display text-xs capitalize ${
                folder === f ? "border-primary bg-muted" : "border-border/70 text-muted-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/70 px-4 py-8 font-display text-sm text-muted-foreground hover:border-primary hover:text-foreground">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {busy ? "Enviando…" : "Clique para escolher imagens ou vídeos"}
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => void handleFiles(e.target.files)}
          />
        </label>
        {error && <p className="mt-3 text-sm font-semibold text-destructive">{error}</p>}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {["todos", ...MEDIA_FOLDERS].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 font-display text-xs capitalize ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Carregando arquivos…</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((a) => (
            <div
              key={a.id}
              className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card"
            >
              {a.kind === "image" ? (
                <img src={a.url} alt={a.name} className="h-32 w-full object-cover" loading="lazy" />
              ) : (
                <video src={a.url} className="h-32 w-full bg-foreground/5 object-cover" controls />
              )}
              <div className="p-3">
                <p className="truncate font-display text-sm">{a.name}</p>
                <p className="text-[11px] capitalize text-muted-foreground">
                  {a.folder} · {formatBytes(a.size_bytes)}
                </p>
                <div className="mt-2 flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label="Copiar link"
                    onClick={() => void navigator.clipboard.writeText(a.url)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Excluir ${a.name}`}
                    onClick={async () => {
                      await removeMedia(a);
                      await refresh();
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {visible.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
              Nenhum arquivo nesta pasta.
            </p>
          )}
        </div>
      )}
    </>
  );
}
