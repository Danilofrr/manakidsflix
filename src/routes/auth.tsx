import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import mascote from "@/assets/mascote.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";

const ADMIN_EMAIL = "daniloferreiraa80@gmail.com";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar no Maná Kids+ | Cliente e admin" },
      {
        name: "description",
        content:
          "Acesse sua conta Maná Kids+ para assistir às histórias bíblicas animadas ou entre como admin para gerenciar o catálogo.",
      },
      { property: "og:title", content: "Entrar no Maná Kids+" },
      {
        property: "og:description",
        content: "Login de cliente e de admin do streaming infantil Maná Kids+.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, isAdmin, loading: authLoading, roleLoading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && session) {
      navigate({ to: isAdmin ? "/admin" : "/", replace: true });
    }
  }, [authLoading, session, isAdmin, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(traduz(error.message));
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: { display_name: name || email.split("@")[0] },
        },
      });
      if (error) setError(traduz(error.message));
      else if (!data.session)
        setMessage("Conta criada! Confirme o e-mail que enviamos para entrar.");
    }
    setBusy(false);
  }

  async function handleGoogle() {
    setBusy(true);
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("Não foi possível entrar com o Google. Tente novamente.");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
  }

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-b from-secondary/20 via-background to-primary/15 px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-border/60 bg-card p-6 shadow-card sm:p-8">
        <Link to="/" className="flex items-center justify-center gap-2">
          <img
            src={mascote}
            alt="Mascote Maná Kids+"
            width={768}
            height={768}
            className="h-12 w-12 object-contain"
          />
          <span className="font-display text-2xl font-extrabold leading-none">
            <span className="text-gradient-brand">Maná Kids</span>
            <span className="text-secondary">+</span>
          </span>
        </Link>

        <h1 className="mt-5 text-center font-display text-2xl font-extrabold">
          {mode === "login" ? "Bem-vindo de volta!" : "Criar sua conta"}
        </h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Entre como cliente para assistir ou como admin para gerenciar o catálogo.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Como podemos te chamar?"
                autoComplete="name"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              autoComplete="email"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo de 6 caracteres"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          {error && <p className="text-sm font-semibold text-destructive">{error}</p>}
          {message && <p className="text-sm font-semibold text-secondary">{message}</p>}

          <Button type="submit" className="w-full" disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "login" ? "Entrar" : "Criar conta"}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          ou
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={busy}>
          Continuar com Google
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "login" ? "Ainda não tem conta?" : "Já tem uma conta?"}{" "}
          <button
            type="button"
            className="font-display font-bold text-primary hover:underline"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
              setMessage(null);
            }}
          >
            {mode === "login" ? "Criar agora" : "Entrar"}
          </button>
        </p>

        <p className="mt-4 flex items-center justify-center gap-1.5 rounded-2xl bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
          Acesso de admin liberado para {ADMIN_EMAIL}
        </p>
      </div>
    </main>
  );
}

function traduz(msg: string) {
  if (/Invalid login credentials/i.test(msg)) return "E-mail ou senha incorretos.";
  if (/already registered|already exists/i.test(msg)) return "Este e-mail já tem uma conta.";
  if (/Email not confirmed/i.test(msg)) return "Confirme seu e-mail antes de entrar.";
  if (/at least/i.test(msg)) return "A senha precisa ter no mínimo 6 caracteres.";
  return msg;
}
