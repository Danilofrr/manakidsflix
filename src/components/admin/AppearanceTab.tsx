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
            <p className="mt-2 text-xs text-muted-foreground">
              As colunas de links e as redes sociais do rodapé ficam em “Rodapé do site”.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4 rounded-3xl border border-border/60 bg-card p-5 shadow-card">
        <div>
          <h2 className="font-display text-lg font-extrabold">Medidas certas das imagens</h2>
          <p className="text-sm text-muted-foreground">
            Use exatamente estas medidas para as artes ficarem nítidas e sem corte.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {IMAGE_SPECS.map((spec) => (
            <div key={spec.name} className="rounded-2xl border border-border/60 p-4">
              <div className="mb-3 grid place-items-center rounded-xl bg-muted/60 p-3">
                <div
                  className="w-full max-w-[9rem] rounded-lg bg-gradient-brand"
                  style={{ aspectRatio: spec.ratio }}
                />
              </div>
              <h3 className="font-display text-sm font-extrabold">{spec.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {spec.size} px · proporção {spec.ratio.replace("/", ":")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{spec.hint}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Formatos: JPG para fotos e PNG para logos com fundo transparente. Peso ideal até 500 KB
          por imagem.
        </p>
      </div>
    </>
  );
}

const IMAGE_SPECS = [
  {
    name: "Capa central (destaque desktop)",
    size: "1920 × 1080",
    ratio: "16/9",
    hint: "Deixe o rosto/logo no lado esquerdo: o texto do banner fica por cima.",
  },
  {
    name: "Capa central (destaque celular)",
    size: "1080 × 1350",
    ratio: "4/5",
    hint: "Versão vertical do banner, usada em telas pequenas.",
  },
  {
    name: "Capa de filme ou série",
    size: "768 × 1024",
    ratio: "3/4",
    hint: "Pôster vertical das fileiras da home.",
  },
  {
    name: "Miniatura de episódio",
    size: "640 × 360",
    ratio: "16/9",
    hint: "Cena do episódio na lista de temporadas.",
  },
  {
    name: "Logo do título",
    size: "800 × 400",
    ratio: "2/1",
    hint: "PNG com fundo transparente, exibido sobre o banner.",
  },
  {
    name: "Logo da marca",
    size: "512 × 512",
    ratio: "1/1",
    hint: "PNG quadrado com fundo transparente.",
  },
];

