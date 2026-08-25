import { createFileRoute, Link } from "@tanstack/react-router";
import { Play, Plus, Star, Music, Moon, Compass, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandHeader } from "@/components/BrandHeader";
import { StoryRow } from "@/components/StoryRow";
import { HeroCarousel } from "@/components/HeroCarousel";
import { SiteFooter } from "@/components/SiteFooter";
import { useAppStore, useResolvedRows, type Tone } from "@/lib/app-store";
import mascote from "@/assets/mascote.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maná Kids+ | Histórias bíblicas animadas para crianças" },
      {
        name: "description",
        content:
          "Maná Kids+ é o streaming infantil de histórias bíblicas animadas: aventura, músicas e histórias para o soninho, com curadoria segura para os pequenos.",
      },
      { property: "og:title", content: "Maná Kids+ | Histórias bíblicas animadas" },
      {
        property: "og:description",
        content:
          "Um mundo colorido de histórias bíblicas animadas para crianças de 2 a 9 anos. Assista quando quiser, sem anúncios.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const toneClass: Record<Tone, string> = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  accent: "bg-accent text-accent-foreground",
  sunny: "bg-sunny text-sunny-foreground",
  mint: "bg-mint text-mint-foreground",
};

const toneIcon: Record<Tone, typeof Compass> = {
  primary: Compass,
  secondary: Music,
  accent: Moon,
  sunny: Star,
  mint: Sparkles,
};

function Home() {
  const { state, storyBySlug } = useAppStore();
  const rows = useResolvedRows();
  const hero = state.hero;
  const heroStory = storyBySlug(hero.slug);

  return (
    <div className="min-h-screen bg-background">
      <BrandHeader />

      <main>
        <HeroCarousel
          fallback={
            <section className="relative overflow-hidden">
              <img
                src={hero.image}
                alt="Banner principal do Maná Kids+"
                width={1920}
                height={1088}
                className="h-[68vh] min-h-[440px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-fade" />

              <img
                src={mascote}
                alt=""
                aria-hidden="true"
                loading="lazy"
                width={768}
                height={768}
                className="animate-float-soft absolute right-6 top-8 hidden h-24 w-24 object-contain drop-shadow-xl lg:block"
              />

              <div className="absolute inset-x-0 bottom-0">
                <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 sm:pb-12">
                  {hero.badge ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-sunny px-3 py-1 font-display text-xs text-sunny-foreground">
                      <Star className="h-3.5 w-3.5" />
                      {hero.badge}
                    </span>
                  ) : null}
                  <h1 className="mt-3 max-w-2xl font-display text-4xl font-extrabold leading-[1.05] text-primary-foreground drop-shadow-md sm:text-6xl">
                    {hero.title}
                  </h1>
                  <p className="mt-3 max-w-xl text-sm text-primary-foreground/90 sm:text-base">
                    {hero.description}
                  </p>
                  {heroStory ? (
                    <p className="mt-2 font-display text-xs text-primary-foreground/80">
                      {heroStory.verse} · {heroStory.duration} · {heroStory.ageRange}
                    </p>
                  ) : null}
                  <div className="mt-5 flex flex-wrap gap-3">
                    {heroStory ? (
                      <Button variant="play" size="jumbo" asChild>
                        <Link to="/historia/$slug" params={{ slug: heroStory.slug }}>
                          <Play className="fill-current" />
                          {hero.ctaPrimary}
                        </Link>
                      </Button>
                    ) : null}
                    <Button variant="glass" size="jumbo">
                      <Plus />
                      {hero.ctaSecondary}
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          }
        />

        <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
          <div className="scrollbar-none flex gap-3 overflow-x-auto pb-1">
            {state.categories.map((cat) => {
              const Icon = toneIcon[cat.tone];
              return (
                <span
                  key={cat.id}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 font-display text-sm shadow-pop ${toneClass[cat.tone]}`}
                >
                  <Icon className="h-4 w-4" />
                  {cat.label}
                </span>
              );
            })}
          </div>
        </section>

        <div className="pb-6 pt-2">
          {rows
            .filter((row) => row.items.length > 0)
            .map((row) => (
              <StoryRow key={row.id} title={row.title} subtitle={row.subtitle} items={row.items} />
            ))}
        </div>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <div className="rounded-4xl bg-gradient-sky p-8 text-center shadow-card sm:p-12">
            <h2 className="font-display text-3xl font-extrabold text-primary-foreground sm:text-4xl">
              {state.texts.safetyTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-primary-foreground/90 sm:text-base">
              {state.texts.safetyBody}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button variant="play" size="pill" asChild>
                <Link to="/perfis">Criar perfil da criança</Link>
              </Button>
              <Button variant="glass" size="pill" asChild>
                <Link to="/admin">Área dos pais</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
