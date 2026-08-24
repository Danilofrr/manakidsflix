import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Plus, Trash2 } from "lucide-react";
import { BrandHeader } from "@/components/BrandHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAppStore, newId, type Profile } from "@/lib/app-store";

export const Route = createFileRoute("/perfis")({
  head: () => ({
    meta: [
      { title: "Gerenciar perfis | Maná Kids+" },
      {
        name: "description",
        content:
          "Crie, edite e escolha os perfis da família no Maná Kids+: um espaço por criança, com nome, cor e avatar.",
      },
      { property: "og:title", content: "Gerenciar perfis | Maná Kids+" },
      {
        property: "og:description",
        content: "Um perfil para cada criança, com cor e avatar próprios.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilesPage,
});

const emojis = ["🦸", "🐝", "🦁", "🐳", "🌟", "🕊️", "🧑", "👩", "🐑", "🌈"];

function ProfilesPage() {
  const { state, update, saveProfile, removeProfile } = useAppStore();
  const [draft, setDraft] = useState<Profile | null>(null);

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

        <h1 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">Gerenciar perfis</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Escolha quem está assistindo ou crie um novo perfil para a família.
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
                aria-label={`Usar o perfil ${p.name}`}
              >
                {p.emoji}
              </button>
              <p className="mt-3 font-display text-base">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.kid ? "Modo criança" : "Adulto"}</p>
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

          <button
            onClick={() =>
              setDraft({ id: newId(), name: "", color: "#a463e0", emoji: "🌟", kid: true })
            }
            className="grid min-h-44 place-items-center rounded-3xl border-2 border-dashed border-border/70 text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
          >
            <span className="flex flex-col items-center gap-2 font-display text-sm">
              <Plus className="h-7 w-7" />
              Novo perfil
            </span>
          </button>
        </div>

        {draft ? (
          <div className="mt-8 rounded-3xl border-2 border-border/70 bg-card p-5 shadow-card">
            <h2 className="font-display text-xl">
              {state.profiles.some((p) => p.id === draft.id) ? "Editar perfil" : "Novo perfil"}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="Miguel"
                />
              </div>
              <div>
                <Label htmlFor="cor">Cor do avatar</Label>
                <Input
                  id="cor"
                  type="color"
                  value={draft.color}
                  onChange={(e) => setDraft({ ...draft, color: e.target.value })}
                  className="h-10 p-1"
                />
              </div>
            </div>

            <div className="mt-4">
              <Label>Avatar</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {emojis.map((e) => (
                  <button
                    key={e}
                    onClick={() => setDraft({ ...draft, emoji: e })}
                    className={`grid h-11 w-11 place-items-center rounded-full border-2 text-xl ${
                      draft.emoji === e ? "border-primary bg-muted" : "border-border/70"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Switch
                id="kid"
                checked={draft.kid}
                onCheckedChange={(v) => setDraft({ ...draft, kid: v })}
              />
              <Label htmlFor="kid">Modo criança</Label>
            </div>

            <div className="mt-5 flex gap-3">
              <Button
                variant="play"
                size="pill"
                onClick={() => {
                  saveProfile({ ...draft, name: draft.name.trim() || "Novo perfil" });
                  setDraft(null);
                }}
              >
                Salvar
              </Button>
              <Button variant="outline" size="pill" onClick={() => setDraft(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
