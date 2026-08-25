import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  LayoutDashboard,
  Clapperboard,
  ListVideo,
  Rows3,
  Tags,
  Images,
  Sparkles,
  Users,
  CreditCard,
  Palette,
  Menu,
  X,
} from "lucide-react";
import mascote from "@/assets/mascote.png";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Maná Kids+ Admin | Backoffice da plataforma" },
      {
        name: "description",
        content:
          "Backoffice do Maná Kids+: métricas, catálogo de filmes e séries, biblioteca de mídia, destaques da home, clientes, planos e identidade visual.",
      },
      { property: "og:title", content: "Maná Kids+ Admin" },
      {
        property: "og:description",
        content: "Gerencie catálogo, mídia, destaques, clientes e planos do Maná Kids+.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminLayout,
});

const nav = [
  { to: "/admin" as const, label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/catalogo" as const, label: "Filmes e séries", icon: Clapperboard },
  { to: "/admin/episodios" as const, label: "Temporadas e episódios", icon: ListVideo },
  { to: "/admin/destaques" as const, label: "Destaques da home", icon: Sparkles },
  { to: "/admin/fileiras" as const, label: "Fileiras da home", icon: Rows3 },
  { to: "/admin/categorias" as const, label: "Categorias", icon: Tags },
  { to: "/admin/midia" as const, label: "Biblioteca de mídia", icon: Images },
  { to: "/admin/clientes" as const, label: "Clientes", icon: Users },
  { to: "/admin/planos" as const, label: "Planos", icon: CreditCard },
  { to: "/admin/aparencia" as const, label: "Aparência e textos", icon: Palette },
];

function AdminLayout() {
  const { session, isAdmin, loading, roleLoading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!session) navigate({ to: "/auth", replace: true });
  }, [loading, session, navigate]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (loading || roleLoading || !session) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <p className="font-display text-muted-foreground">Carregando…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="max-w-md text-center">
          <h1 className="font-display text-2xl font-extrabold">Área restrita</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Esta conta não tem permissão de admin.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-display text-sm text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40 lg:flex">
      {open && (
        <button
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-foreground/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border/60 bg-card transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 border-b border-border/60 px-5 py-4">
          <img src={mascote} alt="" aria-hidden="true" className="h-9 w-9 object-contain" />
          <div className="leading-tight">
            <p className="font-display text-lg font-extrabold">
              <span className="text-gradient-brand">Maná Kids</span>
              <span className="text-secondary">+</span>
            </p>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Admin</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
            className="ml-auto rounded-full p-1.5 text-muted-foreground lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-display text-sm transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground shadow-pop"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border/60 p-3">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-display text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Ver o streaming
          </Link>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
          <button
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-display text-base font-extrabold">Maná Kids+ Admin</span>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
