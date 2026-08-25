import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, KeyRound, Loader2, User2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { BrandHeader } from "@/components/BrandHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { listPlans, formatPrice, type Plan } from "@/lib/plans";

export const Route = createFileRoute("/conta")({
  head: () => ({
    meta: [
      { title: "Configurações da conta | Maná Kids+" },
      {
        name: "description",
        content:
          "Altere seu nome, troque a senha e gerencie o plano da sua assinatura do Maná Kids+.",
      },
      { property: "og:title", content: "Configurações da conta | Maná Kids+" },
      {
        property: "og:description",
        content: "Nome, senha e assinatura da sua conta Maná Kids+ em um só lugar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountPage,
});

type Subscription = {
  plan: string;
  status: string;
  plan_id: string | null;
  amount_cents: number;
  current_period_end: string | null;
  started_at: string;
};

function AccountPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [savingPass, setSavingPass] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [savingPlan, setSavingPlan] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setDisplayName(data?.display_name ?? "");
      });
    supabase
      .from("subscriptions")
      .select("plan, status, plan_id, amount_cents, current_period_end, started_at")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setSub((data as Subscription) ?? null);
      });
    listPlans()
      .then((p) => {
        if (active) setPlans(p.filter((x) => x.active));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [user]);

  async function saveName() {
    if (!user) return;
    const name = displayName.trim();
    if (!name) {
      toast.error("Escreva um nome.");
      return;
    }
    setSavingName(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: name })
      .eq("id", user.id);
    await supabase.auth.updateUser({ data: { display_name: name } });
    setSavingName(false);
    if (error) toast.error(error.message);
    else toast.success("Nome atualizado!");
  }

  async function savePassword() {
    if (password.length < 8) {
      toast.error("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== password2) {
      toast.error("As senhas não são iguais.");
      return;
    }
    setSavingPass(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSavingPass(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setPassword("");
    setPassword2("");
    toast.success("Senha alterada com sucesso!");
  }

  async function choosePlan(plan: Plan) {
    if (!user) return;
    setSavingPlan(plan.id);
    const { error } = await supabase
      .from("subscriptions")
      .update({
        plan: plan.name,
        plan_id: plan.id,
        amount_cents: plan.price_cents,
      })
      .eq("user_id", user.id);
    setSavingPlan(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSub((s) =>
      s ? { ...s, plan: plan.name, plan_id: plan.id, amount_cents: plan.price_cents } : s,
    );
    toast.success(`Plano ${plan.name} ativado!`);
  }

  const statusLabel = sub?.status === "em_dia" ? "Em dia" : "Pendente";

  return (
    <div className="min-h-screen bg-background">
      <BrandHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 font-display text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <h1 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">
          Configurações da conta
        </h1>
        <p className="mt-1 text-muted-foreground">
          {user?.email ?? "Carregando..."}
        </p>

        <section className="mt-8 rounded-3xl border border-border/60 bg-card p-5 shadow-card sm:p-6">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold">
            <User2 className="h-5 w-5 text-secondary" />
            Seus dados
          </h2>
          <div className="mt-4 grid gap-3 sm:max-w-sm">
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Como podemos te chamar?"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" value={user?.email ?? ""} disabled className="mt-1" />
            </div>
            <Button onClick={saveName} disabled={savingName} className="w-fit">
              {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Salvar nome
            </Button>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-border/60 bg-card p-5 shadow-card sm:p-6">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold">
            <KeyRound className="h-5 w-5 text-primary" />
            Trocar senha
          </h2>
          <div className="mt-4 grid gap-3 sm:max-w-sm">
            <div>
              <Label htmlFor="senha">Nova senha</Label>
              <Input
                id="senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo de 8 caracteres"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="senha2">Repita a nova senha</Label>
              <Input
                id="senha2"
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button onClick={savePassword} disabled={savingPass} className="w-fit">
              {savingPass ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Atualizar senha
            </Button>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-border/60 bg-card p-5 shadow-card sm:p-6">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold">
            <CreditCard className="h-5 w-5 text-grape" />
            Assinatura
          </h2>

          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-muted/60 px-4 py-3">
            <div>
              <p className="font-display text-lg font-bold capitalize">
                {sub?.plan ?? "Grátis"}
              </p>
              <p className="text-sm text-muted-foreground">
                {sub ? formatPrice(sub.amount_cents) : "R$ 0,00"}
                {sub?.current_period_end
                  ? ` · renova em ${new Date(sub.current_period_end).toLocaleDateString("pt-BR")}`
                  : ""}
              </p>
            </div>
            <span
              className={`ml-auto rounded-full px-3 py-1 font-display text-xs ${
                sub?.status === "em_dia"
                  ? "bg-secondary/15 text-secondary"
                  : "bg-primary/15 text-primary"
              }`}
            >
              {statusLabel}
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {plans.map((plan) => {
              const current = sub?.plan_id === plan.id || sub?.plan === plan.name;
              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl border p-4 ${
                    current ? "border-secondary bg-secondary/5" : "border-border/60"
                  }`}
                >
                  <p className="font-display text-lg font-bold">{plan.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(plan.price_cents)} / {plan.period}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {plan.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-1.5">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={current ? "outline" : "default"}
                    disabled={current || savingPlan === plan.id}
                    onClick={() => choosePlan(plan)}
                    className="mt-3 w-full"
                  >
                    {savingPlan === plan.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    {current ? "Plano atual" : "Escolher plano"}
                  </Button>
                </div>
              );
            })}
            {plans.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhum plano disponível no momento.
              </p>
            )}
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Precisa de ajuda com pagamentos ou quer cancelar? Fale com a gente pelo suporte.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
