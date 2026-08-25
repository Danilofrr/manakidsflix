import { Link } from "@tanstack/react-router";
import { Play, Clock } from "lucide-react";
import type { Story } from "@/lib/catalog";

export function StoryCard({ story }: { story: Story }) {
  return (
    <Link
      to="/historia/$slug"
      params={{ slug: story.slug }}
      className="group block w-64 shrink-0 sm:w-72 md:w-80"
    >
      <div className="relative overflow-hidden rounded-2xl border-2 border-border/70 bg-card shadow-card transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:border-secondary">
        <img
          src={story.cover}
          alt={`Capa da história ${story.title}`}
          loading="lazy"
          width={1280}
          height={720}
          className="aspect-video w-full object-cover"
        />


        {story.progress ? (
          <div className="absolute inset-x-3 bottom-3 h-1.5 overflow-hidden rounded-full bg-primary-foreground/30">
            <div className="h-full rounded-full bg-sunny" style={{ width: `${story.progress}%` }} />
          </div>
        ) : null}

        <div className="absolute right-2.5 top-2.5 grid h-10 w-10 place-items-center rounded-full bg-gradient-brand opacity-0 shadow-glow transition-opacity duration-300 group-hover:opacity-100">
          <Play className="h-4 w-4 fill-current text-primary-foreground" />
        </div>
      </div>

      <div className="mt-2">
        <h3 className="font-display text-base leading-tight text-foreground">
          {story.title}
        </h3>
        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          {story.duration} · {story.ageRange}
        </p>
      </div>
    </Link>
  );
}

