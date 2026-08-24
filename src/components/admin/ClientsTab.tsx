import { useEffect, useState } from "react";
import { Loader2, Users, BadgeCheck, AlertTriangle, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

type Sub = {
  user_id: string;
  plan: string;
  status: string;
  current_period_end: string | null;
};

type Client = {
  id: string;
  display_name: string | null;
  email: string | null;
  created_at: string;
  role: string;
  sub: Sub | null;
};

const statusLabel: Record<string, string> = {
  em_dia: "Em dia",
  atrasado: "Atrasado",
  cancelado: "Cancelado",
};

const statusClass: Record<string, string> = {
  em_dia: "bg-secondary text-secondary-foreground",
  atrasado: "bg-sunny text-sunny-foreground",
  cancelado: "bg-destructive text-destructive-foreground",
};

export function ClientsTab() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    const [profiles, roles, subs] = await Promise.all([
      supabase.from("profiles").select("id, display_name, email, created_at"),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("subscriptions").select("user_id, plan, status, current_period_end"),
    ]);

    if (profiles.error) {
      setError("Não foi possível carregar os clientes.");
      setLoading(false);
      return;
    }

    const roleBy = new Map((roles.data ?? []).map((r) => [r.user_id, r.role as string]));
    const subBy = new Map((subs.data ?? []).map((s) => [s.user_id, s as Sub]));

    setClients(
      (profiles.data ?? []).map((p) => ({
        id: p.id,
        display_name: p.display_name,
        email: p.email,
        created_at: p.created_at,
        role: roleBy.get(p.id) ?? "cliente",
        sub: subBy.get(p.id) ?? null,
      })),
    );
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function updateSub(userId: string, patch: Partial<Sub>) {
    setSaving(userId);
    const { error: err } = await supabase
      .from("subscriptions")
      .upsert({ user_id: userId, ...patch }, { onConflict: "user_id" });
    if (err) setError("Não foi possível salvar a assinatura.");
    else await load();
    setSaving(null);
  }

  const onlyClients = clients.filter((c) => c.role !== "admin");
  const emDia = onlyClients.filter((c) => (c.sub?.status ?? "em_dia") === "em_dia").length;
  const atrasados = onlyClients.filter((c) => c.sub?.status === "atrasado").length;
  const cancelados = onlyClients.filter((c) => c.sub?.status === "cancelado").length;

  if (loading) {
    return (
      <p className="flex items-center gap-2 py-10 font-display text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Carregando clientes…
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {error && <p className="text-sm font-semibold text-destructive">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard icon={Users} label="Clientes" value={onlyClients.length} />
        <StatCard icon={BadgeCheck} label="Assinaturas em dia" value={emDia} />
        <StatCard icon={AlertTriangle} label="Atrasadas" value={atrasados} />
        <StatCard icon={Ban} label="Canceladas" value={cancelados} />
      </div>

      <div className="space-y-3">
        {onlyClients.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum cliente cadastrado ainda.</p>
        )}
        {onlyClients.map((c) => {
          const status = c.sub?.status ?? "em_dia";
          return (
            <div
              key={c.id}
              className="rounded-3xl border border-border/60 bg-card p-4 shadow-card"
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-extrabold">
                    {c.display_name ?? "Sem nome"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 font-display text-xs ${statusClass[status] ?? "bg-muted"}`}
                >
                  {statusLabel[status] ?? status}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor={`plan-${c.id}`}>Plano</Label>
                  <Input
                    id={`plan-${c.id}`}
                    defaultValue={c.sub?.plan ?? "gratis"}
                    onBlur={(e) => {
                      if (e.target.value !== (c.sub?.plan ?? "gratis"))
                        void updateSub(c.id, { plan: e.target.value });
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`end-${c.id}`}>Válida até</Label>
                  <Input
                    id={`end-${c.id}`}
                    type="date"
                    defaultValue={c.sub?.current_period_end ?? ""}
                    onChange={(e) =>
                      void updateSub(c.id, { current_period_end: e.target.value || null })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Situação</Label>
                  <div className="flex flex-wrap gap-2">
                    {(["em_dia", "atrasado", "cancelado"] as const).map((s) => (
                      <Button
                        key={s}
                        type="button"
                        size="sm"
                        variant={status === s ? "default" : "outline"}
                        disabled={saving === c.id}
                        onClick={() => void updateSub(c.id, { status: s })}
                      >
                        {statusLabel[s]}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-card">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-2 font-display text-2xl font-extrabold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
