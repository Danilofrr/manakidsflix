import { useCallback, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatBytes,
  uploadMediaResumable,
  type MediaAsset,
  type UploadHandle,
  type UploadProgress,
} from "@/lib/media";

export type UploadItem = {
  id: string;
  name: string;
  size: number;
  progress: UploadProgress;
  error?: string;
  handle: UploadHandle;
};

const STATUS_LABEL: Record<UploadProgress["status"], string> = {
  preparing: "Preparando…",
  uploading: "Enviando",
  processing: "Finalizando…",
  done: "Concluído",
  error: "Falhou",
  paused: "Pausado",
};

export function useUploadQueue(onComplete?: (asset: MediaAsset) => void) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const counter = useRef(0);

  const patch = useCallback((id: string, next: Partial<UploadItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...next } : it)));
  }, []);

  const enqueue = useCallback(
    (files: FileList | File[], folder: string) => {
      for (const file of Array.from(files)) {
        counter.current += 1;
        const id = `${Date.now()}-${counter.current}`;
        const handle = uploadMediaResumable(file, folder, (progress) =>
          patch(id, { progress }),
        );
        setItems((prev) => [
          ...prev,
          {
            id,
            name: file.name,
            size: file.size,
            progress: { uploaded: 0, total: file.size, percent: 0, status: "preparing" },
            handle,
          },
        ]);
        handle.promise
          .then((asset) => {
            patch(id, {
              progress: { uploaded: file.size, total: file.size, percent: 100, status: "done" },
            });
            onComplete?.(asset);
          })
          .catch((err: unknown) => {
            patch(id, {
              error: err instanceof Error ? err.message : "Erro no envio",
              progress: {
                uploaded: 0,
                total: file.size,
                percent: 0,
                status: "error",
              },
            });
          });
      }
    },
    [onComplete, patch],
  );

  const dismiss = useCallback((id: string) => {
    setItems((prev) => {
      prev.find((i) => i.id === id)?.handle.abort();
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const retry = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        it.handle.resume();
        const { error: _drop, ...rest } = it;
        void _drop;
        return {
          ...rest,
          progress: { ...it.progress, status: "uploading" as const },
        };
      }),
    );
  }, []);


  return { items, enqueue, dismiss, retry };
}

export function UploadQueueList({
  items,
  onDismiss,
  onRetry,
}: {
  items: UploadItem[];
  onDismiss: (id: string) => void;
  onRetry: (id: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-4 space-y-2">
      {items.map((item) => {
        const { percent, uploaded, status } = item.progress;
        return (
          <li key={item.id} className="rounded-2xl border border-border/60 bg-background/60 p-3">
            <div className="flex items-center gap-2">
              {status === "done" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-secondary" />
              ) : status === "error" ? (
                <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
              ) : (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
              )}
              <p className="min-w-0 flex-1 truncate font-display text-sm">{item.name}</p>
              <span className="shrink-0 font-display text-xs tabular-nums text-muted-foreground">
                {status === "error" ? STATUS_LABEL.error : `${percent}%`}
              </span>
              {status === "error" ? (
                <Button
                  variant="outline"
                  size="sm"
                  aria-label={`Retomar envio de ${item.name}`}
                  onClick={() => onRetry(item.id)}
                >
                  <Play className="h-3.5 w-3.5" />
                </Button>
              ) : null}
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Remover ${item.name} da fila`}
                onClick={() => onDismiss(item.id)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${
                  status === "error" ? "bg-destructive" : "bg-primary"
                }`}
                style={{ width: `${status === "error" ? 100 : percent}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {item.error
                ? item.error
                : `${STATUS_LABEL[status]} · ${formatBytes(uploaded)} de ${formatBytes(item.size)}`}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
