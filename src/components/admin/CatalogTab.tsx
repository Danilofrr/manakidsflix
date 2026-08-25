import { useState } from "react";
import { Film, Pencil, Plus, Trash2, Tv } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { VideoSourceField } from "@/components/admin/VideoSourceField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore, newStoryTemplate, slugify, type Story } from "@/lib/app-store";

export function CatalogTab() {
  const { state, saveStory, removeStory } = useAppStore();
  const [draft, setDraft] = useState<Story | null>(null);
  const [originalSlug, setOriginalSlug] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<"todos" | "filme" | "serie">("todos");

  const visible = state.stories.filter(
    (s) =>
      (kindFilter === "todos" || s.kind === kindFilter) &&
      s.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title="Filmes e séries"
        subtitle="Cadastre, edite e organize todo o catálogo do Maná Kids+."
        action={
          <Button
            variant="play"
            size="pill"
            onClick={() => {
              setDraft(newStoryTemplate());
              setOriginalSlug(undefined);
            }}
          >
            <Plus className="h-4 w-4" />
            Novo título
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="flex flex-wrap gap-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome…"
              className="max-w-60"
            />
            {(["todos", "filme", "serie"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setKindFilter(k)}
                className={`rounded-full px-3 py-1.5 font-display text-xs capitalize ${
                  kindFilter === k
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {k === "serie" ? "séries" : k}
              </button>
            ))}
          </div>

          <ul className="mt-4 space-y-3">
            {visible.map((s) => (
              <li
                key={s.slug}
                className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-card"
              >
                {s.cover ? (
                  <img
                    src={s.cover}
                    alt=""
                    className="h-16 w-12 shrink-0 rounded-xl object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="grid h-16 w-12 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                    <Film className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm">{s.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.kind === "serie" ? "Série" : "Filme"} · {s.duration} · {s.ageRange}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Editar ${s.title}`}
                  onClick={() => {
                    setDraft({ ...s });
                    setOriginalSlug(s.slug);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Excluir ${s.title}`}
                  onClick={() => removeStory(s.slug)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </li>
            ))}
            {visible.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhum título encontrado.
              </p>
            )}
          </ul>
        </div>

        <div className="h-fit rounded-3xl border border-border/60 bg-card p-5 shadow-card">
          {draft ? (
            <>
              <h2 className="font-display text-xl font-extrabold">
                {originalSlug ? "Editar título" : "Novo título"}
              </h2>
              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    placeholder="A Arca de Noé"
                  />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <div className="mt-2 flex gap-2">
                    {(["filme", "serie"] as const).map((k) => (
                      <button
                        key={k}
                        onClick={() => setDraft({ ...draft, kind: k })}
                        className={`inline-flex items-center gap-1.5 rounded-full border-2 px-4 py-2 font-display text-sm ${
                          draft.kind === k ? "border-primary bg-muted" : "border-border/70"
                        }`}
                      >
                        {k === "filme" ? <Film className="h-4 w-4" /> : <Tv className="h-4 w-4" />}
                        {k === "filme" ? "Filme" : "Série"}
                      </button>
                    ))}
                  </div>
                </div>

                <MediaPicker
                  label="Imagem da capa"
                  folder="capas"
                  value={draft.cover}
                  onChange={(cover) => setDraft({ ...draft, cover })}
                />

                <VideoSourceField
                  label="Vídeo principal"
                  folder="videos"
                  value={{
                    source: draft.videoSource ?? "mana_kids",
                    url: draft.videoUrl ?? "",
                    youtubeUrl: draft.youtubeUrl ?? "",
                    youtubeId: draft.youtubeVideoId ?? "",
                    hlsUrl: draft.hlsUrl ?? "",
                    provider: draft.videoProvider ?? "",
                    providerVideoId: draft.providerVideoId ?? "",
                    subtitles: draft.subtitles ?? [],
                  }}
                  onChange={(v) =>
                    setDraft({
                      ...draft,
                      videoSource: v.source,
                      videoUrl: v.url,
                      youtubeUrl: v.youtubeUrl,
                      youtubeVideoId: v.youtubeId,
                      hlsUrl: v.hlsUrl,
                      videoProvider: v.provider,
                      providerVideoId: v.providerVideoId,
                      subtitles: v.subtitles,
                    })
                  }
                />

                <VideoSourceField
                  label="Trailer (opcional)"
                  folder="trailers"
                  value={{
                    source: draft.trailerSource ?? "mana_kids",
                    url: draft.trailerUrl ?? "",
                    youtubeUrl: draft.trailerYoutubeUrl ?? "",
                    youtubeId: draft.trailerYoutubeId ?? "",
                    hlsUrl: draft.trailerHlsUrl ?? "",
                    provider: draft.trailerVideoProvider ?? "",
                    providerVideoId: draft.trailerProviderVideoId ?? "",
                    subtitles: draft.trailerSubtitles ?? [],
                  }}
                  onChange={(v) =>
                    setDraft({
                      ...draft,
                      trailerSource: v.source,
                      trailerUrl: v.url,
                      trailerYoutubeUrl: v.youtubeUrl,
                      trailerYoutubeId: v.youtubeId,
                      trailerHlsUrl: v.hlsUrl,
                      trailerVideoProvider: v.provider,
                      trailerProviderVideoId: v.providerVideoId,
                      trailerSubtitles: v.subtitles,
                    })
                  }
                />


                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="duracao">Duração</Label>
                    <Input
                      id="duracao"
                      value={draft.duration}
                      onChange={(e) => setDraft({ ...draft, duration: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="idade">Faixa de idade</Label>
                    <Input
                      id="idade"
                      value={draft.ageRange}
                      onChange={(e) => setDraft({ ...draft, ageRange: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="versiculo">Na Bíblia</Label>
                  <Input
                    id="versiculo"
                    value={draft.verse}
                    onChange={(e) => setDraft({ ...draft, verse: e.target.value })}
                    placeholder="Gênesis 6-9"
                  />
                </div>
                <div>
                  <Label htmlFor="resumo">Resumo</Label>
                  <Textarea
                    id="resumo"
                    rows={4}
                    value={draft.summary}
                    onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                  <Input
                    id="tags"
                    value={draft.tags.join(", ")}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        tags: e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="play"
                    size="pill"
                    onClick={() => {
                      const title = draft.title.trim() || "Nova história";
                      saveStory({ ...draft, title, slug: draft.slug || slugify(title) }, originalSlug);
                      setDraft(null);
                      setOriginalSlug(undefined);
                    }}
                  >
                    Salvar
                  </Button>
                  <Button variant="outline" size="pill" onClick={() => setDraft(null)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Selecione um título para editar ou clique em <strong>Novo título</strong> para
              cadastrar um filme ou uma série.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
