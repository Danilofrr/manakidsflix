import { Link } from "@tanstack/react-router";
import { Search, Sparkles } from "lucide-react";
import mascote from "@/assets/mascote.png";

export function BrandHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={mascote}
            alt="Mascote Maná Kids+"
            width={768}
            height={768}
            className="h-10 w-10 shrink-0 object-contain"
          />
          <span className="font-display text-xl font-extrabold leading-none sm:text-2xl">
            <span className="text-gradient-brand">Maná Kids</span>
            <span className="text-secondary">+</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {[
            { label: "Início", to: "/" },
            { label: "Histórias", to: "/" },
            { label: "Músicas", to: "/" },
            { label: "Meus favoritos", to: "/" },
          ].map((item, i) => (
            <Link
              key={item.label}
              to={item.to}
              className={`rounded-full px-4 py-2 font-display text-sm transition-colors ${
                i === 0
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            aria-label="Buscar histórias"
            className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Search className="h-5 w-5" />
          </button>
          <span className="hidden items-center gap-1.5 rounded-full bg-sunny px-3 py-1.5 font-display text-xs text-sunny-foreground sm:inline-flex">
            <Sparkles className="h-3.5 w-3.5" />
            Modo criança
          </span>
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-sky font-display text-sm text-primary-foreground shadow-card">
            N
          </div>
        </div>
      </div>
    </header>
  );
}
