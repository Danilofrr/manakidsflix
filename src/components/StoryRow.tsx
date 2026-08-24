import type { Story } from "@/lib/catalog";
import { StoryCard } from "@/components/StoryCard";

type Props = {
  title: string;
  subtitle?: string;
  items: Story[];
};

export function StoryRow({ title, subtitle, items }: Props) {
  return (
    <section className="py-5">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
        <h2 className="font-display text-xl font-extrabold sm:text-2xl">{title}</h2>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      <div className="scrollbar-none mt-3 overflow-x-auto px-4 pb-3 sm:px-6">
        <div className="mx-auto flex w-max max-w-7xl justify-center gap-4">
          {items.map((story) => (
            <StoryCard key={`${title}-${story.slug}`} story={story} />
          ))}
        </div>
      </div>
    </section>

  );
}
