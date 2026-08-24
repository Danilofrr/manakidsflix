import { createFileRoute, Link } from "@tanstack/react-router";
import { Play, Plus, ArrowLeft, Clock, BookOpen, Baby } from "lucide-react";
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
            <img
              src={story.cover}
              alt={`Cena da história ${story.title}`}
              width={768}
              height={1024}
              className="aspect-video w-full object-cover"
            />
            <div className="absolute inset-0 grid place-items-center bg-gradient-fade">
              <button
                aria-label={`Reproduzir ${story.title}`}
                className="grid h-20 w-20 place-items-center rounded-full bg-gradient-brand shadow-glow transition-transform duration-300 hover:scale-110"
              >
                <Play className="h-8 w-8 fill-current text-primary-foreground" />
              </button>
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
              <Button variant="play" size="pill">
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
      </main>

      <div className="pb-14">
        <StoryRow title="Continue a jornada" subtitle="Histórias parecidas" items={related} />
      </div>
    </div>
  );
}
