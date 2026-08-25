import { Plus, Star, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { SUBTITLE_LANGUAGES, type SubtitleTrack } from "@/lib/subtitles";

const uid = () => Math.random().toString(36).slice(2, 9);

/** Editor das faixas de legenda de um vídeo (.vtt ou .srt). */
export function SubtitlesField({
  value,
  onChange,
  folder = "legendas",
}: {
  value: SubtitleTrack[];
  onChange: (next: SubtitleTrack[]) => void;
  folder?: string;
}) {
  const update = (id: string, patch: Partial<SubtitleTrack>) =>
    onChange(value.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  return (
    <div className="mt-3 rounded-2xl bg-muted/50 p-3">
      <div className="flex items-center justify-between">
        <Label>Legendas</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange([
              ...value,
              {
                id: uid(),
                languageCode: "pt-BR",
                languageName: "Português (Brasil)",
                url: "",
                format: "vtt",
                isDefault: value.length === 0,
              },
            ])
          }
        >
          <Plus className="h-4 w-4" />
          Adicionar faixa
        </Button>
      </div>

      {value.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Nenhuma legenda cadastrada. Aceita arquivos .vtt (recomendado) ou .srt.
        </p>
      ) : null}

      <div className="mt-3 space-y-3">
        {value.map((track) => (
          <div key={track.id} className="rounded-2xl border border-border/60 bg-card p-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <Label htmlFor={`lang-${track.id}`}>Idioma</Label>
                <select
                  id={`lang-${track.id}`}
                  value={track.languageCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    const found = SUBTITLE_LANGUAGES.find((l) => l.code === code);
                    update(track.id, {
                      languageCode: code,
                      languageName: found?.name ?? code,
                    });
                  }}
                  className="mt-1 h-10 w-full rounded-xl border-2 border-border/70 bg-background px-3 text-sm"
                >
                  {SUBTITLE_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor={`name-${track.id}`}>Nome exibido</Label>
                <Input
                  id={`name-${track.id}`}
                  value={track.languageName}
                  onChange={(e) => update(track.id, { languageName: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-2">
              <MediaPicker
                label="Arquivo da legenda ou URL"
                folder={folder}
                value={track.url}
                onChange={(url) =>
                  update(track.id, {
                    url,
                    format: /\.srt(\?|$)/i.test(url) ? "srt" : "vtt",
                  })
                }
              />
            </div>

            <div className="mt-2 flex items-center gap-2">
              <Button
                type="button"
                variant={track.isDefault ? "play" : "outline"}
                size="sm"
                onClick={() =>
                  onChange(value.map((t) => ({ ...t, isDefault: t.id === track.id })))
                }
              >
                <Star className="h-4 w-4" />
                {track.isDefault ? "Padrão" : "Definir como padrão"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label="Remover legenda"
                onClick={() => onChange(value.filter((t) => t.id !== track.id))}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
              <span className="ml-auto rounded-full bg-muted px-2 py-1 font-display text-[11px] uppercase text-muted-foreground">
                {track.format}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
