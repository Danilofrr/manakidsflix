import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  Film,
  Tv,
} from "lucide-react";
import { BrandHeader } from "@/components/BrandHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAppStore,
  newStoryTemplate,
  newId,
  slugify,
  type Story,
  type Row,
  type Tone,
} from "@/lib/app-store";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel do admin | Maná Kids+" },
      {
        name: "description",
        content:
          "Painel administrativo do Maná Kids+: cadastre filmes e séries, organize fileiras e categorias, troque o banner, os textos e as cores da marca.",
      },
      { property: "og:title", content: "Painel do admin | Maná Kids+" },
      {
        property: "og:description",
        content: "Gerencie o catálogo, o banner, as categorias e as cores do app infantil.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

const tones: Tone[] = ["primary", "secondary", "accent", "sunny", "mint"];

function AdminPage() {
  const store = useAppStore();
  const { state } = store;
  const { session, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!session) navigate({ to: "/auth", replace: true });
  }, [loading, session, navigate]);

  if (loading || !session) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <p className="font-display text-muted-foreground">Carregando…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <BrandHeader />
        <main className="mx-auto max-w-md px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-extrabold">Área restrita</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Esta conta não tem permissão de admin. Entre com a conta de administrador para
            gerenciar o catálogo.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-display text-sm text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o início
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BrandHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 font-display text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Ver o app
        </Link>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Painel do admin</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Tudo que você mudar aqui aparece na hora na tela das crianças.
            </p>
          </div>
          <Button variant="outline" size="pill" onClick={store.reset}>
            <RotateCcw className="h-4 w-4" />
            Restaurar padrão
          </Button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {[
            { label: "Títulos", value: state.stories.length },
            { label: "Fileiras", value: state.rows.length },
            { label: "Categorias", value: state.categories.length },
            { label: "Perfis", value: state.profiles.length },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border-2 border-border/70 bg-card p-4">
              <p className="font-display text-3xl">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="catalogo" className="mt-8">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-2xl">
            <TabsTrigger value="catalogo">Filmes e séries</TabsTrigger>
            <TabsTrigger value="fileiras">Fileiras</TabsTrigger>
            <TabsTrigger value="categorias">Categorias</TabsTrigger>
            <TabsTrigger value="banner">Banner e textos</TabsTrigger>
            <TabsTrigger value="cores">Cores</TabsTrigger>
          </TabsList>

          <TabsContent value="catalogo" className="mt-6">
            <CatalogTab />
          </TabsContent>
          <TabsContent value="fileiras" className="mt-6">
            <RowsTab />
          </TabsContent>
          <TabsContent value="categorias" className="mt-6">
            <CategoriesTab />
          </TabsContent>
          <TabsContent value="banner" className="mt-6">
            <BannerTab />
          </TabsContent>
          <TabsContent value="cores" className="mt-6">
            <ColorsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function CatalogTab() {
  const { state, saveStory, removeStory } = useAppStore();
  const [draft, setDraft] = useState<Story | null>(null);
  const [originalSlug, setOriginalSlug] = useState<string | undefined>();

  const startNew = () => {
    setDraft(newStoryTemplate());
    setOriginalSlug(undefined);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl">Catálogo</h2>
          <Button variant="play" size="sm" onClick={startNew}>
            <Plus className="h-4 w-4" />
            Novo título
          </Button>
        </div>
        <ul className="mt-4 space-y-3">
          {state.stories.map((s) => (
            <li
              key={s.slug}
              className="flex items-center gap-3 rounded-2xl border-2 border-border/70 bg-card p-3"
            >
              {s.cover ? (
                <img
                  src={s.cover}
                  alt=""
                  className="h-16 w-12 shrink-0 rounded-xl object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="grid h-16 w-12 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                  <Film className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm">{s.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {s.kind === "serie" ? "Série" : "Filme"} · {s.duration} · {s.ageRange}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Editar ${s.title}`}
                onClick={() => {
                  setDraft({ ...s });
                  setOriginalSlug(s.slug);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Excluir ${s.title}`}
                onClick={() => removeStory(s.slug)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-3xl border-2 border-border/70 bg-card p-5 shadow-card">
        {draft ? (
          <>
            <h2 className="font-display text-xl">
              {originalSlug ? "Editar título" : "Novo título"}
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="A Arca de Noé"
                />
              </div>
              <div>
                <Label>Tipo</Label>
                <div className="mt-2 flex gap-2">
                  {(["filme", "serie"] as const).map((k) => (
                    <button
                      key={k}
                      onClick={() => setDraft({ ...draft, kind: k })}
                      className={`inline-flex items-center gap-1.5 rounded-full border-2 px-4 py-2 font-display text-sm ${
                        draft.kind === k ? "border-primary bg-muted" : "border-border/70"
                      }`}
                    >
                      {k === "filme" ? <Film className="h-4 w-4" /> : <Tv className="h-4 w-4" />}
                      {k === "filme" ? "Filme" : "Série"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="capa">Imagem da capa (URL)</Label>
                <Input
                  id="capa"
                  value={draft.cover}
                  onChange={(e) => setDraft({ ...draft, cover: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="duracao">Duração</Label>
                  <Input
                    id="duracao"
                    value={draft.duration}
                    onChange={(e) => setDraft({ ...draft, duration: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="idade">Faixa de idade</Label>
                  <Input
                    id="idade"
                    value={draft.ageRange}
                    onChange={(e) => setDraft({ ...draft, ageRange: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="versiculo">Na Bíblia</Label>
                <Input
                  id="versiculo"
                  value={draft.verse}
                  onChange={(e) => setDraft({ ...draft, verse: e.target.value })}
                  placeholder="Gênesis 6-9"
                />
              </div>
              <div>
                <Label htmlFor="resumo">Resumo</Label>
                <Textarea
                  id="resumo"
                  rows={4}
                  value={draft.summary}
                  onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                <Input
                  id="tags"
                  value={draft.tags.join(", ")}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="play"
                  size="pill"
                  onClick={() => {
                    const title = draft.title.trim() || "Nova história";
                    saveStory(
                      { ...draft, title, slug: draft.slug || slugify(title) },
                      originalSlug,
                    );
                    setDraft(null);
                    setOriginalSlug(undefined);
                  }}
                >
                  Salvar
                </Button>
                <Button variant="outline" size="pill" onClick={() => setDraft(null)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Selecione um título para editar ou clique em <strong>Novo título</strong> para
            cadastrar um filme ou uma série.
          </p>
        )}
      </div>
    </div>
  );
}

function RowsTab() {
  const { state, saveRow, removeRow, moveRow, moveStoryInRow, toggleStoryInRow } = useAppStore();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl">Fileiras da home</h2>
        <Button
          variant="play"
          size="sm"
          onClick={() =>
            saveRow({ id: newId(), title: "Nova fileira", subtitle: "", slugs: [] })
          }
        >
          <Plus className="h-4 w-4" />
          Nova fileira
        </Button>
      </div>

      {state.rows.map((row, index) => (
        <RowEditor
          key={row.id}
          row={row}
          isFirst={index === 0}
          isLast={index === state.rows.length - 1}
          onSave={saveRow}
          onRemove={removeRow}
          onMove={moveRow}
          onMoveStory={moveStoryInRow}
          onToggleStory={toggleStoryInRow}
        />
      ))}
    </div>
  );
}

function RowEditor({
  row,
  isFirst,
  isLast,
  onSave,
  onRemove,
  onMove,
  onMoveStory,
  onToggleStory,
}: {
  row: Row;
  isFirst: boolean;
  isLast: boolean;
  onSave: (row: Row) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onMoveStory: (rowId: string, slug: string, dir: -1 | 1) => void;
  onToggleStory: (rowId: string, slug: string) => void;
}) {
  const { state } = useAppStore();

  return (
    <div className="rounded-3xl border-2 border-border/70 bg-card p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-40 flex-1">
          <Label>Título da fileira</Label>
          <Input value={row.title} onChange={(e) => onSave({ ...row, title: e.target.value })} />
        </div>
        <div className="min-w-40 flex-1">
          <Label>Subtítulo</Label>
          <Input
            value={row.subtitle}
            onChange={(e) => onSave({ ...row, subtitle: e.target.value })}
          />
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={isFirst}
            aria-label="Mover fileira para cima"
            onClick={() => onMove(row.id, -1)}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isLast}
            aria-label="Mover fileira para baixo"
            onClick={() => onMove(row.id, 1)}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Excluir fileira"
            onClick={() => onRemove(row.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      <ol className="mt-4 space-y-2">
        {row.slugs.map((slug, i) => {
          const story = state.stories.find((s) => s.slug === slug);
          if (!story) return null;
          return (
            <li key={slug} className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2">
              <span className="font-display text-xs text-muted-foreground">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate text-sm">{story.title}</span>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Mover ${story.title} para a esquerda`}
                onClick={() => onMoveStory(row.id, slug, -1)}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Mover ${story.title} para a direita`}
                onClick={() => onMoveStory(row.id, slug, 1)}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Remover ${story.title} da fileira`}
                onClick={() => onToggleStory(row.id, slug)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </li>
          );
        })}
      </ol>

      <div className="mt-3 flex flex-wrap gap-2">
        {state.stories
          .filter((s) => !row.slugs.includes(s.slug))
          .map((s) => (
            <button
              key={s.slug}
              onClick={() => onToggleStory(row.id, s.slug)}
              className="inline-flex items-center gap-1 rounded-full border-2 border-dashed border-border/70 px-3 py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-foreground"
            >
              <Plus className="h-3 w-3" />
              {s.title}
            </button>
          ))}
      </div>
    </div>
  );
}

function CategoriesTab() {
  const { state, saveCategory, removeCategory } = useAppStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl">Categorias</h2>
        <Button
          variant="play"
          size="sm"
          onClick={() => saveCategory({ id: newId(), label: "Nova categoria", tone: "primary" })}
        >
          <Plus className="h-4 w-4" />
          Nova categoria
        </Button>
      </div>

      {state.categories.map((cat) => (
        <div
          key={cat.id}
          className="flex flex-wrap items-end gap-3 rounded-2xl border-2 border-border/70 bg-card p-4"
        >
          <div className="min-w-44 flex-1">
            <Label>Nome</Label>
            <Input
              value={cat.label}
              onChange={(e) => saveCategory({ ...cat, label: e.target.value })}
            />
          </div>
          <div>
            <Label>Cor</Label>
            <div className="mt-2 flex gap-2">
              {tones.map((tone) => (
                <button
                  key={tone}
                  aria-label={`Cor ${tone}`}
                  onClick={() => saveCategory({ ...cat, tone })}
                  className={`h-8 w-8 rounded-full border-2 bg-${tone} ${
                    cat.tone === tone ? "border-foreground" : "border-transparent"
                  }`}
                />
              ))}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Excluir ${cat.label}`}
            onClick={() => removeCategory(cat.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  );
}

function BannerTab() {
  const { state, update } = useAppStore();
  const hero = state.hero;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4 rounded-3xl border-2 border-border/70 bg-card p-5">
        <h2 className="font-display text-xl">Banner central</h2>
        <div>
          <Label htmlFor="hero-title">Título</Label>
          <Input
            id="hero-title"
            value={hero.title}
            onChange={(e) => update({ hero: { ...hero, title: e.target.value } })}
          />
        </div>
        <div>
          <Label htmlFor="hero-badge">Selo</Label>
          <Input
            id="hero-badge"
            value={hero.badge}
            onChange={(e) => update({ hero: { ...hero, badge: e.target.value } })}
          />
        </div>
        <div>
          <Label htmlFor="hero-desc">Descrição</Label>
          <Textarea
            id="hero-desc"
            rows={4}
            value={hero.description}
            onChange={(e) => update({ hero: { ...hero, description: e.target.value } })}
          />
        </div>
        <div>
          <Label htmlFor="hero-img">Imagem do banner (URL)</Label>
          <Input
            id="hero-img"
            value={hero.image}
            onChange={(e) => update({ hero: { ...hero, image: e.target.value } })}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="cta1">Botão principal</Label>
            <Input
              id="cta1"
              value={hero.ctaPrimary}
              onChange={(e) => update({ hero: { ...hero, ctaPrimary: e.target.value } })}
            />
          </div>
          <div>
            <Label htmlFor="cta2">Botão secundário</Label>
            <Input
              id="cta2"
              value={hero.ctaSecondary}
              onChange={(e) => update({ hero: { ...hero, ctaSecondary: e.target.value } })}
            />
          </div>
        </div>
        <div>
          <Label>História em destaque</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {state.stories.map((s) => (
              <button
                key={s.slug}
                onClick={() => update({ hero: { ...hero, slug: s.slug } })}
                className={`rounded-full border-2 px-3 py-1.5 text-xs ${
                  hero.slug === s.slug
                    ? "border-primary bg-muted text-foreground"
                    : "border-border/70 text-muted-foreground"
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-3xl border-2 border-border/70 bg-card p-5">
        <h2 className="font-display text-xl">Textos do app</h2>
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
        {hero.image ? (
          <img
            src={hero.image}
            alt="Pré-visualização do banner"
            className="mt-2 aspect-video w-full rounded-2xl object-cover"
          />
        ) : null}
      </div>
    </div>
  );
}

function ColorsTab() {
  const { state, update } = useAppStore();
  const brand = state.brand;
  const fields: { key: keyof typeof brand; label: string }[] = [
    { key: "primary", label: "Cor primária (coral)" },
    { key: "secondary", label: "Cor secundária (turquesa)" },
    { key: "accent", label: "Cor de destaque (roxo)" },
    { key: "sunny", label: "Cor solar (amarelo)" },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4 rounded-3xl border-2 border-border/70 bg-card p-5">
        <h2 className="font-display text-xl">Cores da marca</h2>
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
      </div>

      <div className="rounded-3xl border-2 border-border/70 bg-card p-5">
        <h2 className="font-display text-xl">Pré-visualização</h2>
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
        <div className="mt-4 h-24 rounded-2xl bg-gradient-brand" />
        <div className="mt-3 h-24 rounded-2xl bg-gradient-sky" />
        <p className="mt-4 text-xs text-muted-foreground">
          O modo claro e o modo escuro usam essas cores automaticamente. Troque o tema pelo ícone de
          lua/sol no topo.
        </p>
      </div>
    </div>
  );
}
