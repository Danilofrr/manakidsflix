import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Play, Plus, ArrowLeft, Clock, BookOpen, Baby, Film } from "lucide-react";
import { loadSeasonsWithEpisodes, titleIdBySlug, type Episode, type Season } from "@/lib/episodes";
import { Button } from "@/components/ui/button";
import { BrandHeader } from "@/components/BrandHeader";
import { StoryRow } from "@/components/StoryRow";
import { useAppStore } from "@/lib/app-store";

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

function StoryPage() {
  const { slug } = Route.useParams();
  const { state, storyBySlug } = useAppStore();
  const story = storyBySlug(slug);
  const related = state.stories.filter((s) => s.slug !== slug).slice(0, 5);
  const [playing, setPlaying] = useState<{ url: string; label: string } | null>(null);
  const [seasons, setSeasons] = useState<{ season: Season; episodes: Episode[] }[]>([]);

  useEffect(() => {
    setPlaying(null);
    let active = true;
    (async () => {
      try {
        const id = await titleIdBySlug(slug);
        if (!id) return;
        const data = await loadSeasonsWithEpisodes(id);
        if (active) setSeasons(data.filter((s) => s.episodes.some((e) => e.published)));
      } catch {
        /* sem temporadas cadastradas */
      }
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  const mainVideo = story?.videoUrl ?? seasons[0]?.episodes.find((e) => e.published)?.video_url ?? "";

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
          <div className="relative overflow-hidden rounded-4xl border-2 border-border/70 shadow-card">
            {playing ? (
              <video
                src={playing.url}
                poster={story.cover}
                controls
                autoPlay
                playsInline
                className="aspect-video w-full bg-foreground/90 object-contain"
              />
            ) : (
              <>
                <img
                  src={story.cover}
                  alt={`Cena da história ${story.title}`}
                  className="aspect-video w-full object-cover"
                />
                <div className="absolute inset-0 grid place-items-center">
                  {mainVideo ? (
                    <button
                      aria-label={`Reproduzir ${story.title}`}
                      onClick={() => setPlaying({ url: mainVideo, label: story.title })}
                      className="grid h-20 w-20 place-items-center rounded-full bg-gradient-brand shadow-glow transition-transform duration-300 hover:scale-110"
                    >
                      <Play className="h-8 w-8 fill-current text-primary-foreground" />
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
              </>
            )}
            {playing ? (
              <p className="bg-card px-4 py-2 font-display text-sm">{playing.label}</p>
            ) : null}
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
              <Button
                variant="play"
                size="pill"
                disabled={!mainVideo}
                onClick={() => mainVideo && setPlaying({ url: mainVideo, label: story.title })}
              >
                <Play className="fill-current" />
                {story.progress ? "Continuar" : "Assistir"}
              </Button>
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
                            onClick={() =>
                              ep.video_url &&
                              setPlaying({
                                url: ep.video_url,
                                label: `${ep.number}. ${ep.name}`,
                              })
                            }
                            className="flex w-full items-center gap-3 rounded-2xl border-2 border-border/70 bg-card p-3 text-left transition-colors hover:border-primary disabled:opacity-60"
                            disabled={!ep.video_url}
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
