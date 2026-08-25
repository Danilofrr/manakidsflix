import { RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/app-store";

export function AppearanceTab() {
  const { state, update, reset } = useAppStore();
  const brand = state.brand;

  const fields: { key: keyof typeof brand; label: string }[] = [
    { key: "primary", label: "Cor primária (coral)" },
    { key: "secondary", label: "Cor secundária (turquesa)" },
    { key: "accent", label: "Cor de destaque (roxo)" },
    { key: "sunny", label: "Cor solar (amarelo)" },
  ];

  return (
    <>
      <PageHeader
        title="Aparência e textos"
        subtitle="Cores da marca e textos fixos que aparecem no app das crianças."
        action={
          <Button variant="outline" size="pill" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            Restaurar padrão
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-3xl border border-border/60 bg-card p-5 shadow-card">
          <h2 className="font-display text-lg font-extrabold">Cores da marca</h2>
          {fields.map((f) => (
            <div key={f.key} className="flex items-center gap-3">
              <Input
                type="color"
                aria-label={f.label}
                value={brand[f.key]}
                onChange={(e) => update({ brand: { ...brand, [f.key]: e.target.value } })}
                className="h-11 w-16 p-1"
              />
              <div className="flex-1">
                <Label>{f.label}</Label>
                <Input
                  value={brand[f.key]}
                  onChange={(e) => update({ brand: { ...brand, [f.key]: e.target.value } })}
                />
              </div>
            </div>
          ))}

          <div className="mt-4 flex flex-wrap gap-3">
            <span className="rounded-full bg-primary px-4 py-2 font-display text-sm text-primary-foreground">
              Primária
            </span>
            <span className="rounded-full bg-secondary px-4 py-2 font-display text-sm text-secondary-foreground">
              Secundária
            </span>
            <span className="rounded-full bg-accent px-4 py-2 font-display text-sm text-accent-foreground">
              Destaque
            </span>
            <span className="rounded-full bg-sunny px-4 py-2 font-display text-sm text-sunny-foreground">
              Solar
            </span>
          </div>
          <div className="h-20 rounded-2xl bg-gradient-brand" />
          <div className="h-20 rounded-2xl bg-gradient-sky" />
        </div>

        <div className="space-y-4 rounded-3xl border border-border/60 bg-card p-5 shadow-card">
          <h2 className="font-display text-lg font-extrabold">Textos do app</h2>
          <div>
            <Label htmlFor="t1">Título da seção de segurança</Label>
            <Input
              id="t1"
              value={state.texts.safetyTitle}
              onChange={(e) => update({ texts: { ...state.texts, safetyTitle: e.target.value } })}
            />
          </div>
          <div>
            <Label htmlFor="t2">Texto da seção de segurança</Label>
            <Textarea
              id="t2"
              rows={4}
              value={state.texts.safetyBody}
              onChange={(e) => update({ texts: { ...state.texts, safetyBody: e.target.value } })}
            />
          </div>
          <div>
            <Label htmlFor="t3">Rodapé</Label>
            <Input
              id="t3"
              value={state.texts.footer}
              onChange={(e) => update({ texts: { ...state.texts, footer: e.target.value } })}
            />
          </div>
        </div>
      </div>
    </>
  );
}
