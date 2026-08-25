import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { useAppStore } from "@/lib/app-store";

const columns: { title: string; links: { label: string; to?: "/" | "/perfis" | "/auth" }[] }[] = [
  {
    title: "Maná Kids+",
    links: [
      { label: "Início", to: "/" },
      { label: "Perfis", to: "/perfis" },
      { label: "Minha lista" },
    ],
  },
  {
    title: "Famílias",
    links: [{ label: "Controle dos pais" }, { label: "Modo criança" }, { label: "Tempo de tela" }],
  },
  {
    title: "Ajuda",
    links: [{ label: "Central de ajuda" }, { label: "Fale com a gente" }, { label: "Conta", to: "/auth" }],
  },
  {
    title: "Legal",
    links: [{ label: "Termos de uso" }, { label: "Privacidade" }, { label: "Cookies" }],
  },
];

export function SiteFooter() {
  const { state } = useAppStore();

  return (
    <footer className="mt-8 border-t border-border/60 bg-card/40">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-center gap-4">
          <p className="font-display text-lg font-extrabold">
            <span className="text-gradient-brand">Maná Kids</span>
            <span className="text-secondary">+</span>
          </p>
          <div className="ml-auto flex items-center gap-2">
            {[
              { Icon: Instagram, label: "Instagram" },
              { Icon: Youtube, label: "YouTube" },
              { Icon: Facebook, label: "Facebook" },
            ].map(({ Icon, label }) => (
              <button
                key={label}
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Icon className="h-4.5 w-4.5" />
              </button>
            ))}
          </div>
        </div>

        <nav className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <h2 className="font-display text-sm font-extrabold">{col.title}</h2>
              <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.to ? (
                      <Link to={l.to} className="transition-colors hover:text-foreground">
                        {l.label}
                      </Link>
                    ) : (
                      <span className="cursor-default">{l.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="mt-10 flex flex-col gap-2 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{state.texts.footer}</p>
          <p>© {new Date().getFullYear()} Maná Kids+. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
