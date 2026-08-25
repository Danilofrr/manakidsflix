import { Facebook, Instagram, MessageCircle, Music2, Youtube } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAppStore } from "@/lib/app-store";
import type { SocialKey } from "@/lib/app-store";

const SOCIALS: { key: SocialKey; label: string; Icon: LucideIcon }[] = [
  { key: "instagram", label: "Instagram", Icon: Instagram },
  { key: "youtube", label: "YouTube", Icon: Youtube },
  { key: "facebook", label: "Facebook", Icon: Facebook },
  { key: "tiktok", label: "TikTok", Icon: Music2 },
  { key: "whatsapp", label: "WhatsApp", Icon: MessageCircle },
];

export function SiteFooter() {
  const { state } = useAppStore();
  const { texts } = state;
  const socials = SOCIALS.filter((s) => (texts.socials?.[s.key] ?? "").trim().length > 0);
  const columns = (texts.footerColumns ?? []).filter((c) => c.links.length > 0 || c.title);

  return (
    <footer className="mt-8 border-t border-border/60 bg-card/40">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <p className="min-w-0 truncate font-display text-lg font-extrabold">
            <span className="text-gradient-brand">{texts.footerBrand ?? "Maná Kids+"}</span>
          </p>
          {socials.length > 0 ? (
            <div className="flex shrink-0 items-center gap-2">
              {socials.map(({ key, label, Icon }) => (
                <a
                  key={key}
                  href={texts.socials[key]}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Icon className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          ) : null}
        </div>

        {columns.length > 0 ? (
          <nav className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map((col) => (
              <div key={col.id}>
                <h2 className="font-display text-sm font-extrabold">{col.title}</h2>
                <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
                  {col.links.map((l) => (
                    <li key={l.id}>
                      {l.url ? (
                        <a
                          href={l.url}
                          {...(l.url.startsWith("http")
                            ? { target: "_blank", rel: "noreferrer" }
                            : {})}
                          className="transition-colors hover:text-foreground"
                        >
                          {l.label}
                        </a>
                      ) : (
                        <span className="cursor-default">{l.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        ) : null}

        <div className="mt-10 flex flex-col gap-2 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{texts.footer}</p>
          <p>
            © {new Date().getFullYear()} {texts.footerBrand ?? "Maná Kids+"}.{" "}
            {texts.footerCopyright ?? ""}
          </p>
        </div>
      </div>
    </footer>
  );
}
