import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Play, Plus, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listHeroSlides, loadTitleMaps, type HeroSlide } from "@/lib/hero-slides";
import mascote from "@/assets/mascote.png";

type Slide = HeroSlide & { slug: string | null };

export function HeroCarousel({ fallback }: { fallback: React.ReactNode }) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [list, maps] = await Promise.all([listHeroSlides(true), loadTitleMaps()]);
        if (!active) return;
        setSlides(
          list.map((s) => ({ ...s, slug: s.title_id ? (maps.slugById.get(s.title_id) ?? null) : null })),
        );
      } catch {
        /* sem destaques cadastrados: usa o banner padrão */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const current = slides[index];

  useEffect(() => {
    if (slides.length < 2 || !current) return;
    const ms = Math.max(3, current.slide_seconds || 8) * 1000;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % slides.length), ms);
    return () => clearTimeout(timer);
  }, [slides, index, current]);

  if (!current) return <>{fallback}</>;

  const go = (dir: -1 | 1) =>
    setIndex((i) => (i + dir + slides.length) % slides.length);

  return (
    <section className="relative overflow-hidden">
      {current.media_type === "video" && current.video_url ? (
        <video
          key={current.id}
          src={current.video_url}
          poster={current.image_desktop ?? undefined}
          autoPlay
          muted
          loop
          playsInline
          className="h-[68vh] min-h-[440px] w-full object-cover"
        />
      ) : (
        <picture>
          {current.image_mobile ? (
            <source media="(max-width: 640px)" srcSet={current.image_mobile} />
          ) : null}
          <img
            src={current.image_desktop ?? current.image_mobile ?? ""}
            alt={`Destaque: ${current.title}`}
            className="h-[68vh] min-h-[440px] w-full object-cover"
          />
        </picture>
      )}

      <div className="absolute inset-0 bg-gradient-fade" />

      <img
        src={mascote}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="animate-float-soft absolute right-6 top-8 hidden h-24 w-24 object-contain drop-shadow-xl lg:block"
      />

      {slides.length > 1 ? (
        <>
          <button
            aria-label="Destaque anterior"
            onClick={() => go(-1)}
            className="absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-background/70 p-2 text-foreground backdrop-blur transition hover:bg-background sm:block"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            aria-label="Próximo destaque"
            onClick={() => go(1)}
            className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-background/70 p-2 text-foreground backdrop-blur transition hover:bg-background sm:block"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      ) : null}

      <div className="absolute inset-x-0 bottom-0">
        <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 sm:pb-12">
          {current.badge ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sunny px-3 py-1 font-display text-xs text-sunny-foreground">
              <Star className="h-3.5 w-3.5" />
              {current.badge}
            </span>
          ) : null}

          {current.logo ? (
            <img
              src={current.logo}
              alt={current.title}
              className="mt-3 max-h-24 w-auto max-w-xs object-contain drop-shadow-lg sm:max-w-sm"
            />
          ) : (
            <h1 className="mt-3 max-w-2xl font-display text-4xl font-extrabold leading-[1.05] text-primary-foreground drop-shadow-md sm:text-6xl">
              {current.title}
            </h1>
          )}

          {current.description ? (
            <p className="mt-3 max-w-xl text-sm text-primary-foreground/90 sm:text-base">
              {current.description}
            </p>
          ) : null}

          <p className="mt-2 font-display text-xs text-primary-foreground/80">
            {[current.year, current.duration, current.classification].filter(Boolean).join(" · ")}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {current.slug ? (
              <Button variant="play" size="jumbo" asChild>
                <Link to="/historia/$slug" params={{ slug: current.slug }}>
                  <Play className="fill-current" />
                  {current.cta_primary}
                </Link>
              </Button>
            ) : null}
            <Button variant="glass" size="jumbo">
              <Plus />
              {current.cta_secondary}
            </Button>
          </div>

          {slides.length > 1 ? (
            <div className="mt-5 flex gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  aria-label={`Ir para o destaque ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-8 bg-primary" : "w-3 bg-primary-foreground/50"
                  }`}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
