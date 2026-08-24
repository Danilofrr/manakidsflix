import { createFileRoute, Link } from "@tanstack/react-router";
import { Play, Plus, Star, Music, Moon, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandHeader } from "@/components/BrandHeader";
import { StoryRow } from "@/components/StoryRow";
import { rows, storyBySlug } from "@/lib/catalog";
import heroImage from "@/assets/hero-mana.jpg";
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

const destaque = storyBySlug("moises-e-o-mar-vermelho")!;

const chips = [
  { label: "Aventura", icon: Compass, cls: "bg-primary text-primary-foreground" },
  { label: "Músicas", icon: Music, cls: "bg-secondary text-secondary-foreground" },
  { label: "Soninho", icon: Moon, cls: "bg-accent text-accent-foreground" },
  { label: "Favoritas", icon: Star, cls: "bg-sunny text-sunny-foreground" },
];

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <BrandHeader />

      <main>
        <section className="relative overflow-hidden">
          <img
            src={heroImage}
            alt="Crianças alegres recolhendo maná no deserto ao amanhecer"
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
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sunny px-3 py-1 font-display text-xs text-sunny-foreground">
                <Star className="h-3.5 w-3.5" />
                Novo episódio desta semana
              </span>
              <h1 className="mt-3 max-w-2xl font-display text-4xl font-extrabold leading-[1.05] text-primary-foreground drop-shadow-md sm:text-6xl">
                {destaque.title}
              </h1>
              <p className="mt-3 max-w-xl text-sm text-primary-foreground/90 sm:text-base">
                {destaque.summary}
              </p>
              <p className="mt-2 font-display text-xs text-primary-foreground/80">
                {destaque.verse} · {destaque.duration} · {destaque.ageRange}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button variant="play" size="jumbo" asChild>
                  <Link to="/historia/$slug" params={{ slug: destaque.slug }}>
                    <Play className="fill-current" />
                    Assistir agora
                  </Link>
                </Button>
                <Button variant="glass" size="jumbo">
                  <Plus />
                  Minha lista
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
          <div className="scrollbar-none flex gap-3 overflow-x-auto pb-1">
            {chips.map(({ label, icon: Icon, cls }) => (
              <span
                key={label}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 font-display text-sm shadow-pop ${cls}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </span>
            ))}
          </div>
        </section>

        <div className="pb-6 pt-2">
          {rows.map((row) => (
            <StoryRow key={row.id} title={row.title} subtitle={row.subtitle} items={row.items} />
          ))}
        </div>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <div className="rounded-4xl bg-gradient-sky p-8 text-center shadow-card sm:p-12">
            <h2 className="font-display text-3xl font-extrabold text-primary-foreground sm:text-4xl">
              Tudo seguro, do começo ao fim
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-primary-foreground/90 sm:text-base">
              Sem anúncios, sem links externos e com controle de tempo de tela. Os pais escolhem, as
              crianças se divertem.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button variant="play" size="pill">
                Criar perfil da criança
              </Button>
              <Button variant="glass" size="pill">
                Área dos pais
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-8">
        <p className="text-center text-xs text-muted-foreground">
          Maná Kids+ · histórias bíblicas animadas para os pequenos
        </p>
      </footer>
    </div>
  );
}
