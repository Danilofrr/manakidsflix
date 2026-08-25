import { useEffect, useState } from "react";
import { Loader2, Plus, Save, Trash2, Tv } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { VideoSourceField } from "@/components/admin/VideoSourceField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/app-store";
import { loadEpisodeSubtitles, saveEpisodeSubtitles, type SubtitleTrack } from "@/lib/subtitles";
import {
  createEpisode,
  createSeason,
  deleteEpisode,
  deleteSeason,
  loadSeasonsWithEpisodes,
  saveEpisode,
  titleIdBySlug,
  type Episode,
  type Season,
} from "@/lib/episodes";

type Group = { season: Season; episodes: Episode[] };

export function EpisodesTab() {
  const { state } = useAppStore();
  const series = state.stories.filter((s) => s.kind === "serie");
  const [slug, setSlug] = useState<string>(series[0]?.slug ?? "");
  const [titleId, setTitleId] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug && series[0]) setSlug(series[0].slug);
  }, [series, slug]);

  const refresh = async (targetSlug: string) => {
    if (!targetSlug) return;
    setLoading(true);
    setError("");
    try {
      const id = await titleIdBySlug(targetSlug);
      setTitleId(id);
      setGroups(id ? await loadSeasonsWithEpisodes(id) : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar episódios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh(slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const run = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
      await refresh(slug);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    }
  };

  return (
    <>
      <PageHeader
        title="Temporadas e episódios"
        subtitle="Organize as temporadas das séries e envie o vídeo de cada episódio."
        action={
          titleId ? (
            <Button
              variant="play"
              size="pill"
              onClick={() => void run(() => createSeason(titleId, groups.length + 1, ""))}
            >
              <Plus className="h-4 w-4" />
              Nova temporada
            </Button>
          ) : undefined
        }
      />

      {series.length === 0 ? (
        <p className="rounded-3xl border border-border/60 bg-card p-8 text-center text-sm text-muted-foreground">
          Cadastre um título do tipo <strong>Série</strong> em “Filmes e séries” para gerenciar
          temporadas.
        </p>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap gap-2">
            {series.map((s) => (
              <button
                key={s.slug}
                onClick={() => setSlug(s.slug)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-display text-sm ${
                  slug === s.slug
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Tv className="h-4 w-4" />
                {s.title}
              </button>
            ))}
          </div>

          {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
          {loading ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando…
            </p>
          ) : null}

          <div className="space-y-6">
            {groups.map(({ season, episodes }) => (
              <div key={season.id} className="rounded-3xl border border-border/60 bg-card p-4 shadow-card">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-display text-lg font-extrabold">
                    Temporada {season.number}
                  </h2>
                  <Input
                    defaultValue={season.name ?? ""}
                    placeholder="Nome da temporada (opcional)"
                    className="max-w-60"
                    onBlur={(e) =>
                      void run(async () => {
                        const { updateSeason } = await import("@/lib/episodes");
                        await updateSeason(season.id, { name: e.target.value });
                      })
                    }
                  />
                  <div className="ml-auto flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        void run(() => createEpisode(season.id, episodes.length + 1))
                      }
                    >
                      <Plus className="h-4 w-4" />
                      Episódio
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Excluir temporada ${season.number}`}
                      onClick={() => void run(() => deleteSeason(season.id))}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  {episodes.map((ep) => (
                    <EpisodeEditor
                      key={ep.id}
                      episode={ep}
                      onSave={(next) => void run(() => saveEpisode(next))}
                      onDelete={() => void run(() => deleteEpisode(ep.id))}
                    />
                  ))}
                  {episodes.length === 0 ? (
                    <p className="rounded-2xl border-2 border-dashed border-border/70 p-4 text-center text-xs text-muted-foreground">
                      Nenhum episódio nesta temporada.
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
            {!loading && groups.length === 0 ? (
              <p className="rounded-3xl border border-border/60 bg-card p-8 text-center text-sm text-muted-foreground">
                Esta série ainda não tem temporadas. Clique em “Nova temporada”.
              </p>
            ) : null}
          </div>
        </>
      )}
    </>
  );
}

function EpisodeEditor({
  episode,
  onSave,
  onDelete,
}: {
  episode: Episode;
  onSave: (ep: Episode) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState<Episode>(episode);
  const [subtitles, setSubtitles] = useState<SubtitleTrack[]>([]);

  useEffect(() => {
    setDraft(episode);
    void loadEpisodeSubtitles(episode.id).then(setSubtitles);
  }, [episode]);

  return (
    <div className="rounded-2xl border border-border/60 p-4">
      <div className="grid gap-3 sm:grid-cols-[80px_1fr_140px]">
        <div>
          <Label>Nº</Label>
          <Input
            type="number"
            value={draft.number}
            onChange={(e) => setDraft({ ...draft, number: Number(e.target.value) || 1 })}
          />
        </div>
        <div>
          <Label>Nome do episódio</Label>
          <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        </div>
        <div>
          <Label>Duração</Label>
          <Input
            value={draft.duration ?? ""}
            placeholder="12 min"
            onChange={(e) => setDraft({ ...draft, duration: e.target.value })}
          />
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <MediaPicker
          label="Capa do episódio"
          folder="thumbnails"
          value={draft.cover ?? ""}
          onChange={(cover) => setDraft({ ...draft, cover })}
        />
      </div>

      <div className="mt-3">
        <VideoSourceField
          label="Fonte do vídeo"
          folder="videos"
          value={{
            source: draft.video_source,
            url: draft.video_url ?? "",
            youtubeUrl: draft.youtube_url ?? "",
            youtubeId: draft.youtube_video_id ?? "",
            hlsUrl: draft.hls_url ?? "",
            provider: draft.video_provider ?? "",
            providerVideoId: draft.provider_video_id ?? "",
            subtitles,
          }}
          onChange={(value) => {
            setDraft({
              ...draft,
              video_source: value.source,
              video_url: value.url,
              youtube_url: value.youtubeUrl,
              youtube_video_id: value.youtubeId,
              hls_url: value.hlsUrl,
              video_provider: value.provider,
              provider_video_id: value.providerVideoId,
            });
            setSubtitles(value.subtitles);
          }}
        />
      </div>

      <div className="mt-3">
        <Label>Resumo</Label>
        <Textarea
          rows={2}
          value={draft.summary ?? ""}
          onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 font-display text-sm">
          <input
            type="checkbox"
            checked={draft.published}
            onChange={(e) => setDraft({ ...draft, published: e.target.checked })}
          />
          Publicado
        </label>
        <Button
          variant="play"
          size="sm"
          className="ml-auto"
          onClick={() => {
            onSave(draft);
            void saveEpisodeSubtitles(draft.id, subtitles);
          }}
        >
          <Save className="h-4 w-4" />
          Salvar
        </Button>
        <Button variant="ghost" size="sm" aria-label={`Excluir ${draft.name}`} onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
