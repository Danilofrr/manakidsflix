import { Link, useNavigate } from "@tanstack/react-router";
import {
  Search,
  Moon,
  Sun,
  ChevronDown,
  LayoutDashboard,
  LogIn,
  LogOut,
} from "lucide-react";
import mascote from "@/assets/mascote.png";
import { useTheme } from "@/lib/theme";
import { useAppStore } from "@/lib/app-store";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function BrandHeader() {
  const { theme, toggle } = useTheme();
  const { state } = useAppStore();
  const { session, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    navigate({ to: "/auth", replace: true });
  }
  const profile =
    state.profiles.find((p) => p.id === state.activeProfileId) ?? state.profiles[0];

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
            { label: "Início", to: "/" as const },
            { label: "Telas", to: "/perfis" as const },
            ...(isAdmin ? [{ label: "Admin", to: "/admin" as const }] : []),
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

          <button
            onClick={toggle}
            aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
            className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-full px-1.5 py-1 transition-colors hover:bg-muted">
              <span className="hidden font-display text-sm sm:inline">
                {profile?.name ?? "Criar tela"}
              </span>
              <span
                className="grid h-9 w-9 place-items-center rounded-full text-base shadow-card ring-2 ring-background"
                style={{ backgroundColor: profile?.color ?? "var(--muted)" }}
                aria-hidden="true"
              >
                {profile?.emoji ?? "+"}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 overflow-hidden rounded-2xl p-0">
              <DropdownMenuLabel asChild>
                <Link
                  to="/perfis"
                  className="block bg-grape px-4 py-3.5 font-display text-sm text-grape-foreground"
                >
                  Gerenciar telas
                </Link>
              </DropdownMenuLabel>
              <div className="py-2">
                <DropdownMenuItem asChild>
                  <Link to="/perfis" className="px-4 py-2.5 font-display text-sm">
                    Minha conta
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="px-4 py-2.5 font-display text-sm">
                      <LayoutDashboard className="h-4 w-4" />
                      Painel do admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="px-4 py-2.5 font-display text-sm">Ajuda</DropdownMenuItem>
                <DropdownMenuItem className="px-4 py-2.5 font-display text-sm">Sobre</DropdownMenuItem>
                <DropdownMenuSeparator />
                {session ? (
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="px-4 py-2.5 font-display text-sm"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link to="/auth" className="px-4 py-2.5 font-display text-sm">
                      <LogIn className="h-4 w-4" />
                      Entrar
                    </Link>
                  </DropdownMenuItem>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
