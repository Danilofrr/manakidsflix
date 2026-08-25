import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Plus, ArrowLeft, Clock, BookOpen, Baby, Film, RotateCcw, SkipForward } from "lucide-react";
import { loadSeasonsWithEpisodes, titleIdBySlug, type Episode, type Season } from "@/lib/episodes";
import { Button } from "@/components/ui/button";
import { BrandHeader } from "@/components/BrandHeader";
import { StoryRow } from "@/components/StoryRow";
import { StoryCard } from "@/components/StoryCard";
import { StreamPlayer } from "@/components/StreamPlayer";
import { useAppStore } from "@/lib/app-store";
import type { VideoSource } from "@/lib/youtube";
import { COMPLETED_AT, getWatchProgress, saveWatchProgress } from "@/lib/watch-progress";
import { loadEpisodeSubtitles, type SubtitleTrack } from "@/lib/subtitles";

export const Route = createFileRoute("/historia/$slug")({
  head: ({ params }) => {
    const title = "História | Maná Kids+";
    const description =
      "Episódio animado de histórias bíblicas para crianças no Maná Kids+, com narração lúdica e visual colorido.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: `${params.slug} | Maná Kids+` },
        { property: "og:description", content: description },
        { property: "og:type", content: "video.episode" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: StoryPage,
});

type NowPlaying = {
  source: VideoSource;
  url: string;
  hlsUrl: string;
  youtubeId: string;
  subtitles: SubtitleTrack[];
  label: string;
  episodeId: string | null;
  startAt: number;
};

function StoryPage() {
  const { slug } = Route.useParams();
  const { state, storyBySlug } = useAppStore();
  const story = storyBySlug(slug);
  const related = state.stories.filter((s) => s.slug !== slug).slice(0, 5);
  const [playing, setPlaying] = useState<NowPlaying | null>(null);
  const [finished, setFinished] = useState(false);
  const [seasons, setSeasons] = useState<{ season: Season; episodes: Episode[] }[]>([]);
  const [titleId, setTitleId] = useState<string | null>(null);
  const [resumeAt, setResumeAt] = useState(0);
  const lastSaved = useRef(0);

  useEffect(() => {
    setPlaying(null);
    setFinished(false);
    let active = true;
    (async () => {
      let id: string | null = null;
      try {
        id = await titleIdBySlug(slug);
        if (active) setTitleId(id);
        if (id) {
          const data = await loadSeasonsWithEpisodes(id);
          if (active) setSeasons(data.filter((s) => s.episodes.some((e) => e.published)));
        }
      } catch {
        /* sem temporadas cadastradas */
      }
      const progress = await getWatchProgress(slug, id, null);
      if (active && progress && !progress.completed) setResumeAt(progress.positionSeconds);
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  const firstEpisode = seasons[0]?.episodes.find((e) => e.published);

  /** Fonte do vídeo principal: YouTube do admin, arquivo próprio ou 1º episódio. */
  const main: {
    source: VideoSource;
    url: string;
    hlsUrl: string;
    youtubeId: string;
    subtitles: SubtitleTrack[];
  } | null = story
    ? story.videoSource === "youtube" && story.youtubeVideoId
      ? { source: "youtube", url: "", hlsUrl: "", youtubeId: story.youtubeVideoId, subtitles: [] }
      : story.videoSource === "external" && (story.hlsUrl || story.videoUrl)
        ? {
            source: "external",
            url: story.videoUrl ?? "",
            hlsUrl: story.hlsUrl ?? "",
            youtubeId: "",
            subtitles: story.subtitles ?? [],
          }
        : story.videoUrl
          ? {
              source: "mana_kids",
              url: story.videoUrl,
              hlsUrl: "",
              youtubeId: "",
              subtitles: story.subtitles ?? [],
            }
          : firstEpisode &&
              (firstEpisode.video_url || firstEpisode.hls_url || firstEpisode.youtube_video_id)
            ? {
                source: firstEpisode.video_source,
                url: firstEpisode.video_url ?? "",
                hlsUrl: firstEpisode.hls_url ?? "",
                youtubeId: firstEpisode.youtube_video_id ?? "",
                subtitles: [],
              }
            : null
    : null;

  const handleProgress = useCallback(
    (current: number, duration: number) => {
      if (!duration || Math.abs(current - lastSaved.current) < 5) return;
      lastSaved.current = current;
      void saveWatchProgress({
        slug,
        titleId,
        episodeId: playing?.episodeId ?? null,
        currentTime: current,
        duration,
      });
    },
    [slug, titleId, playing?.episodeId],
  );

  const startMain = () => {
    if (!main || !story) return;
    setFinished(false);
    setPlaying({ ...main, label: story.title, episodeId: null, startAt: resumeAt });
  };

  if (!story) {
    return (
      <div className="min-h-screen bg-background">
        <BrandHeader />
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-extrabold">História não encontrada</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ela pode ter sido removida no painel do admin.
          </p>
          <Button variant="play" size="pill" className="mt-6" asChild>
            <Link to="/">Voltar para o início</Link>
          </Button>
        </div>
      </div>
    );
  }

  const nextStory = related[0];

  return (
    <div className="min-h-screen bg-background">
      <BrandHeader />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 font-display text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div>
            {playing ? (
              <div className="relative">
                <StreamPlayer
                  source={playing.source}
                  url={playing.url}
                  hlsUrl={playing.hlsUrl}
                  youtubeId={playing.youtubeId}
                  subtitles={playing.subtitles}
                  autoStart
                  title={playing.label}
                  poster={story.cover}
                  startAt={playing.startAt}
                  onProgress={handleProgress}
                  onEnded={() => setFinished(true)}
                  onBack={() => setPlaying(null)}
                />

                {finished ? (
                  <div className="absolute inset-0 z-10 grid place-items-center rounded-3xl bg-background/95 p-5">
                    <div className="w-full max-w-md text-center">
                      <h2 className="font-display text-2xl font-extrabold">Você terminou! 🎉</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Escolha o que assistir agora.
                      </p>
                      <div className="mt-4 flex flex-wrap justify-center gap-3">
                        <Button
                          variant="play"
                          size="pill"
                          onClick={() => {
                            setFinished(false);
                            setResumeAt(0);
                            setPlaying({ ...playing, startAt: 0 });
                          }}
                        >
                          <RotateCcw />
                          Assistir novamente
                        </Button>
                        <Button variant="outline" size="pill" onClick={() => setPlaying(null)}>
                          <ArrowLeft />
                          Voltar
                        </Button>
                        {nextStory ? (
                          <Button variant="bubble" size="pill" asChild>
                            <Link to="/historia/$slug" params={{ slug: nextStory.slug }}>
                              <SkipForward />
                              Próximo
                            </Link>
                          </Button>
                        ) : null}
                      </div>
                      <div className="mt-5 grid grid-cols-3 gap-3">
                        {related.slice(0, 3).map((s) => (
                          <StoryCard key={s.slug} story={s} />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-4xl border-2 border-border/70 shadow-card">
                <img
                  src={story.cover}
                  alt={`Cena da história ${story.title}`}
                  className="aspect-video w-full object-cover"
                />
                <div className="absolute inset-0 grid place-items-center">
                  {main ? (
                    <button
                      aria-label={`Reproduzir ${story.title}`}
                      onClick={startMain}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-4 font-display text-base text-primary-foreground shadow-glow transition-transform duration-300 hover:scale-105"
                    >
                      <Play className="h-6 w-6 fill-current" />
                      {resumeAt > 5 ? "Continuar assistindo" : "Assistir"}
                    </button>
                  ) : (
                    <span className="rounded-full bg-background/85 px-4 py-2 font-display text-xs text-muted-foreground">
                      Vídeo ainda não enviado no painel
                    </span>
                  )}
                </div>
                {story.progress ? (
                  <div className="absolute inset-x-5 bottom-5 h-2 overflow-hidden rounded-full bg-primary-foreground/30">
                    <div
                      className="h-full rounded-full bg-sunny"
                      style={{ width: `${story.progress}%` }}
                    />
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div>
            <span className="rounded-full bg-muted px-3 py-1 font-display text-xs uppercase text-muted-foreground">
              {story.kind === "serie" ? "Série" : "Filme"}
            </span>
            <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight sm:text-4xl">
              {story.title}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2">
              {story.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted px-3 py-1 font-display text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground sm:text-base">{story.summary}</p>

            <dl className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Clock, label: "Duração", value: story.duration },
                { icon: Baby, label: "Idade", value: story.ageRange },
                { icon: BookOpen, label: "Na Bíblia", value: story.verse },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-2xl border-2 border-border/70 bg-card p-3">
                  <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </dt>
                  <dd className="mt-1 font-display text-sm">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="play" size="pill" disabled={!main} onClick={startMain}>
                <Play className="fill-current" />
                {resumeAt > 5 ? "Continuar" : "Assistir"}
              </Button>
              {(story.trailerSource === "youtube" && story.trailerYoutubeId) ||
              story.trailerHlsUrl ||
              story.trailerUrl ? (
                <Button
                  variant="bubble"
                  size="pill"
                  onClick={() => {
                    setFinished(false);
                    setPlaying({
                      source: story.trailerSource ?? "mana_kids",
                      url: story.trailerUrl ?? "",
                      hlsUrl: story.trailerHlsUrl ?? "",
                      subtitles: story.trailerSubtitles ?? [],
                      youtubeId: story.trailerYoutubeId ?? "",
                      label: `${story.title} · Trailer`,
                      episodeId: null,
                      startAt: 0,
                    });
                  }}
                >
                  <Play />
                  Trailer
                </Button>
              ) : null}
              <Button variant="bubble" size="pill">
                <Plus />
                Minha lista
              </Button>
            </div>
          </div>
        </div>
        {seasons.length > 0 ? (
          <section className="mt-12">
            <h2 className="font-display text-2xl font-extrabold">Episódios</h2>
            <div className="mt-4 space-y-8">
              {seasons.map(({ season, episodes }) => (
                <div key={season.id}>
                  <h3 className="font-display text-lg font-bold text-muted-foreground">
                    {season.name || `Temporada ${season.number}`}
                  </h3>
                  <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                    {episodes
                      .filter((e) => e.published)
                      .map((ep) => (
                        <li key={ep.id}>
                          <button
                            onClick={() => {
                              if (!ep.video_url && !ep.hls_url && !ep.youtube_video_id) return;
                              setFinished(false);
                              void Promise.all([
                                loadEpisodeSubtitles(ep.id),
                                getWatchProgress(slug, titleId, ep.id),
                              ]).then(([subtitles, progress]) => {
                                setPlaying({
                                  source: ep.video_source,
                                  url: ep.video_url ?? "",
                                  hlsUrl: ep.hls_url ?? "",
                                  subtitles,
                                  youtubeId: ep.youtube_video_id ?? "",
                                  label: `${ep.number}. ${ep.name}`,
                                  episodeId: ep.id,
                                  startAt:
                                    progress && !progress.completed ? progress.positionSeconds : 0,
                                });
                              });
                            }}
                            className="flex w-full items-center gap-3 rounded-2xl border-2 border-border/70 bg-card p-3 text-left transition-colors hover:border-primary disabled:opacity-60"
                            disabled={!ep.video_url && !ep.hls_url && !ep.youtube_video_id}
                          >
                            {ep.cover ? (
                              <img
                                src={ep.cover}
                                alt=""
                                className="h-16 w-28 shrink-0 rounded-xl object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <span className="grid h-16 w-28 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                                <Film className="h-5 w-5" />
                              </span>
                            )}
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-display text-sm">
                                {ep.number}. {ep.name}
                              </span>
                              <span className="block truncate text-xs text-muted-foreground">
                                {ep.duration || "—"}
                                {ep.summary ? ` · ${ep.summary}` : ""}
                              </span>
                            </span>
                            <Play className="h-4 w-4 shrink-0 fill-current text-primary" />
                          </button>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <div className="pb-14">
        <StoryRow title="Continue a jornada" subtitle="Histórias parecidas" items={related} />
      </div>
    </div>
  );
}

/** Marca como concluído a partir de 90% assistido (regra usada no progresso). */
export const COMPLETED_THRESHOLD = COMPLETED_AT;
