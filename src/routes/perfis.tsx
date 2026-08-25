import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Plus, Trash2 } from "lucide-react";
import { BrandHeader } from "@/components/BrandHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore, newId, MAX_PROFILES, type Profile } from "@/lib/app-store";

export const Route = createFileRoute("/perfis")({
  head: () => ({
    meta: [
      { title: "Suas telas | Maná Kids+" },
      {
        name: "description",
        content:
          "Crie até três telas no Maná Kids+: cada pessoa da família escolhe o próprio nome, avatar e cor.",
      },
      { property: "og:title", content: "Suas telas | Maná Kids+" },
      {
        property: "og:description",
        content: "Até três telas por conta, cada uma com nome e avatar próprios.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilesPage,
});

const emojis = ["🦸", "🐝", "🦁", "🐳", "🌟", "🕊️", "🧑", "👩", "🐑", "🌈"];
const colors = ["#a463e0", "#3fbfc9", "#ef6a4d", "#f6c445", "#5b8def", "#34c77b"];

const emptyDraft = (): Profile => ({
  id: newId(),
  name: "",
  color: colors[0]!,
  emoji: "🌟",
  kid: true,
});

function ProfilesPage() {
  const { state, update, saveProfile, removeProfile } = useAppStore();
  const isFirst = state.profiles.length === 0;
  const [draft, setDraft] = useState<Profile | null>(isFirst ? emptyDraft() : null);
  const full = state.profiles.length >= MAX_PROFILES;

  return (
    <div className="min-h-screen bg-background">
      <BrandHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 font-display text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <h1 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">
          {isFirst ? "Crie sua primeira tela" : "Quem está assistindo?"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Escolha um nome e um avatar. Você pode ter até {MAX_PROFILES} telas nesta conta.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {state.profiles.map((p) => (
            <div
              key={p.id}
              className={`rounded-3xl border-2 bg-card p-4 text-center shadow-card transition-colors ${
                p.id === state.activeProfileId ? "border-primary" : "border-border/70"
              }`}
            >
              <button
                onClick={() => update({ activeProfileId: p.id })}
                className="mx-auto grid h-20 w-20 place-items-center rounded-full text-3xl transition-transform hover:scale-105"
                style={{ backgroundColor: p.color }}
                aria-label={`Usar a tela ${p.name}`}
              >
                {p.emoji}
              </button>
              <p className="mt-3 font-display text-base">{p.name}</p>
              {p.id === state.activeProfileId ? (
                <p className="mt-1 inline-flex items-center gap-1 font-display text-xs text-primary">
                  <Check className="h-3 w-3" /> em uso
                </p>
              ) : null}
              <div className="mt-3 flex justify-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setDraft(p)}>
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Excluir ${p.name}`}
                  onClick={() => removeProfile(p.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}

          {!full && (
            <button
              onClick={() => setDraft(emptyDraft())}
              className="grid min-h-44 place-items-center rounded-3xl border-2 border-dashed border-border/70 text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              <span className="flex flex-col items-center gap-2 font-display text-sm">
                <Plus className="h-7 w-7" />
                Nova tela
              </span>
            </button>
          )}
        </div>

        {full && !draft ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Você já usou as {MAX_PROFILES} telas da conta. Exclua uma para criar outra.
          </p>
        ) : null}

        {draft ? (
          <div className="mt-8 rounded-3xl border-2 border-border/70 bg-card p-5 shadow-card">
            <h2 className="font-display text-xl">
              {state.profiles.some((p) => p.id === draft.id) ? "Editar tela" : "Nova tela"}
            </h2>

            <div className="mt-4 max-w-sm">
              <Label htmlFor="nome">Nome da tela</Label>
              <Input
                id="nome"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Digite o nome"
                autoFocus
              />
            </div>

            <div className="mt-4">
              <Label>Avatar</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {emojis.map((e) => (
                  <button
                    key={e}
                    onClick={() => setDraft({ ...draft, emoji: e })}
                    className={`grid h-12 w-12 place-items-center rounded-full border-2 text-xl ${
                      draft.emoji === e ? "border-primary bg-muted" : "border-border/70"
                    }`}
                    aria-label={`Avatar ${e}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <Label>Cor de fundo</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setDraft({ ...draft, color: c })}
                    style={{ backgroundColor: c }}
                    aria-label={`Cor ${c}`}
                    className={`h-10 w-10 rounded-full border-2 ${
                      draft.color === c ? "border-foreground" : "border-transparent"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <Button
                variant="play"
                size="pill"
                disabled={!draft.name.trim()}
                onClick={() => {
                  saveProfile({ ...draft, name: draft.name.trim() });
                  setDraft(null);
                }}
              >
                Salvar
              </Button>
              {!isFirst && (
                <Button variant="outline" size="pill" onClick={() => setDraft(null)}>
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
