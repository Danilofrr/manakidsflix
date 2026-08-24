import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { deletePlan, listPlans, upsertPlan, formatPrice, type Plan } from "@/lib/plans";

export function PlansTab() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      setPlans(await listPlans());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function save(plan: Plan) {
    setPlans((prev) => prev.map((p) => (p.id === plan.id ? plan : p)));
    try {
      await upsertPlan(plan);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <>
      <PageHeader
        title="Planos"
        subtitle="Defina os planos de assinatura oferecidos no Maná Kids+."
        action={
          <Button
            variant="play"
            size="pill"
            onClick={async () => {
              await upsertPlan({
                name: "Novo plano",
                price_cents: 0,
                period: "mensal",
                sort_order: plans.length,
              });
              await refresh();
            }}
          >
            <Plus className="h-4 w-4" />
            Novo plano
          </Button>
        }
      />

      {error && <p className="mb-4 text-sm font-semibold text-destructive">{error}</p>}

      <div className="space-y-4">
        {plans.map((plan) => (
          <div key={plan.id} className="rounded-3xl border border-border/60 bg-card p-5 shadow-card">
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="sm:col-span-2">
                <Label>Nome</Label>
                <Input value={plan.name} onChange={(e) => void save({ ...plan, name: e.target.value })} />
              </div>
              <div>
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={(plan.price_cents / 100).toString()}
                  onChange={(e) =>
                    void save({ ...plan, price_cents: Math.round(Number(e.target.value) * 100) })
                  }
                />
              </div>
              <div>
                <Label>Periodicidade</Label>
                <Input
                  value={plan.period}
                  onChange={(e) => void save({ ...plan, period: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-3">
              <Label>Benefícios (separados por vírgula)</Label>
              <Input
                value={plan.benefits.join(", ")}
                onChange={(e) =>
                  void save({
                    ...plan,
                    benefits: e.target.value.split(",").map((b) => b.trim()).filter(Boolean),
                  })
                }
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="font-display text-sm text-muted-foreground">
                {formatPrice(plan.price_cents)} / {plan.period}
              </span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 font-display text-sm">
                  <Switch
                    checked={plan.active}
                    onCheckedChange={(active) => void save({ ...plan, active })}
                  />
                  Ativo
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Excluir ${plan.name}`}
                  onClick={async () => {
                    await deletePlan(plan.id);
                    await refresh();
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
