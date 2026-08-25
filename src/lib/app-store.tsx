import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { stories as defaultStories, rows as defaultRows, categories as defaultCategories } from "@/lib/catalog";
import heroImage from "@/assets/hero-mana.jpg";
import { loadCms, loadSettings, saveCms } from "@/lib/cms";
import { useAuth } from "@/lib/auth";

export type Kind = "filme" | "serie";

export type Story = {
  slug: string;
  title: string;
  cover: string;
  duration: string;
  ageRange: string;
  verse: string;
  summary: string;
  tags: string[];
  progress?: number;
  kind: Kind;
  videoUrl?: string;
  trailerUrl?: string;
};

export type Row = { id: string; title: string; subtitle: string; slugs: string[] };
export type Category = { id: string; label: string; tone: Tone };
export type Tone = "primary" | "secondary" | "accent" | "sunny" | "mint";

export type Hero = {
  slug: string;
  badge: string;
  title: string;
  description: string;
  image: string;
  ctaPrimary: string;
  ctaSecondary: string;
};

export type Brand = {
  primary: string;
  secondary: string;
  accent: string;
  sunny: string;
};

export type Profile = { id: string; name: string; color: string; emoji: string; kid: boolean };

/** Limite de telas por conta, como na Netflix. */
export const MAX_PROFILES = 3;

export type Texts = {
  safetyTitle: string;
  safetyBody: string;
  footer: string;
};

export type AppState = {
  stories: Story[];
  rows: Row[];
  categories: Category[];
  hero: Hero;
  brand: Brand;
  profiles: Profile[];
  activeProfileId: string;
  texts: Texts;
};

const uid = () => Math.random().toString(36).slice(2, 9);

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || `historia-${uid()}`;

export const defaultState: AppState = {
  stories: defaultStories.map((s) => ({ ...s, kind: "filme" as Kind })),
  rows: defaultRows.map((r) => ({
    id: r.id,
    title: r.title,
    subtitle: r.subtitle,
    slugs: r.items.map((i) => i.slug),
  })),
  categories: defaultCategories.map((c) => ({ id: uid(), label: c.label, tone: c.tone as Tone })),
  hero: {
    slug: "moises-e-o-mar-vermelho",
    badge: "Novo episódio desta semana",
    title: "Moisés e o Mar Vermelho",
    description:
      "As águas se abrem em duas paredes gigantes e um caminho seco aparece. A maior travessia da história vira uma aventura para as crianças.",
    image: heroImage,
    ctaPrimary: "Assistir agora",
    ctaSecondary: "Minha lista",
  },
  brand: {
    primary: "#ef6a4d",
    secondary: "#3fbfc9",
    accent: "#a463e0",
    sunny: "#f6c445",
  },
  profiles: [],
  activeProfileId: "",
  texts: {
    safetyTitle: "Tudo seguro, do começo ao fim",
    safetyBody:
      "Sem anúncios, sem links externos e com controle de tempo de tela. Os pais escolhem, as crianças se divertem.",
    footer: "Maná Kids+ · histórias bíblicas animadas para os pequenos",
  },
};

type Ctx = {
  state: AppState;
  update: (patch: Partial<AppState>) => void;
  storyBySlug: (slug: string) => Story | undefined;
  saveStory: (story: Story, originalSlug?: string) => void;
  removeStory: (slug: string) => void;
  saveRow: (row: Row) => void;
  removeRow: (id: string) => void;
  moveRow: (id: string, dir: -1 | 1) => void;
  moveStoryInRow: (rowId: string, slug: string, dir: -1 | 1) => void;
  reorderRows: (ids: string[]) => void;
  reorderRowItems: (rowId: string, slugs: string[]) => void;
  toggleStoryInRow: (rowId: string, slug: string) => void;
  saveCategory: (cat: Category) => void;
  removeCategory: (id: string) => void;
  saveProfile: (p: Profile) => void;
  removeProfile: (id: string) => void;
  reset: () => void;
};

const StoreCtx = createContext<Ctx | null>(null);
const KEY = "mana-kids-admin-state";

const move = <T,>(list: T[], index: number, dir: -1 | 1): T[] => {
  const target = index + dir;
  if (index < 0 || target < 0 || target >= list.length) return list;
  const next = [...list];
  const a = next[index]!;
  next[index] = next[target]!;
  next[target] = a;
  return next;
};

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const { isAdmin } = useAuth();
  const isAdminRef = useRef(isAdmin);
  isAdminRef.current = isAdmin;
  const loaded = useRef(false);

  // Salvamento no banco: com debounce (evita um sync por tecla digitada) e
  // em fila (dois syncs simultâneos apagavam itens um do outro).
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<AppState | null>(null);
  const saving = useRef(false);

  const flushSave = async () => {
    if (saving.current) return;
    const next = pending.current;
    if (!next) return;
    pending.current = null;
    saving.current = true;
    try {
      await saveCms(next);
    } catch (err) {
      console.error("Falha ao salvar no banco", err);
    } finally {
      saving.current = false;
      if (pending.current) void flushSave();
    }
  };

  const scheduleSave = (next: AppState) => {
    pending.current = next;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void flushSave(), 700);
  };


  // Conteúdo vem do banco; perfis/kids ficam por dispositivo no navegador.
  useEffect(() => {
    let active = true;
    (async () => {
      const [cms, settings] = await Promise.all([loadCms(), loadSettings()]);
      if (!active) return;
      let local: Partial<AppState> = {};
      try {
        local = JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as Partial<AppState>;
      } catch {
        /* ignora */
      }
      setState((prev) => ({
        ...prev,
        ...(cms ?? {}),
        ...(settings?.brand ? { brand: settings.brand as AppState["brand"] } : {}),
        ...(settings?.texts ? { texts: settings.texts as AppState["texts"] } : {}),
        ...(local.profiles ? { profiles: local.profiles } : {}),
        ...(local.activeProfileId ? { activeProfileId: local.activeProfileId } : {}),
      }));
      loaded.current = true;
    })();
    return () => {
      active = false;
    };
  }, []);

  const persist = (next: AppState) => {
    setState(next);
    try {
      window.localStorage.setItem(
        KEY,
        JSON.stringify({ profiles: next.profiles, activeProfileId: next.activeProfileId }),
      );
    } catch {
      /* ignora quota */
    }
    if (isAdminRef.current && loaded.current) scheduleSave(next);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primary", state.brand.primary);
    root.style.setProperty("--secondary", state.brand.secondary);
    root.style.setProperty("--accent", state.brand.accent);
    root.style.setProperty("--sunny", state.brand.sunny);
    root.style.setProperty("--ring", state.brand.primary);
  }, [state.brand]);

  const api = useMemo<Ctx>(() => {
    const update = (patch: Partial<AppState>) => persist({ ...state, ...patch });

    return {
      state,
      update,
      storyBySlug: (slug) => state.stories.find((s) => s.slug === slug),
      saveStory: (story, originalSlug) => {
        const key = originalSlug ?? story.slug;
        const exists = state.stories.some((s) => s.slug === key);
        const stories = exists
          ? state.stories.map((s) => (s.slug === key ? story : s))
          : [story, ...state.stories];
        const rows = state.rows.map((r) => ({
          ...r,
          slugs: r.slugs.map((s) => (s === key ? story.slug : s)),
        }));
        persist({ ...state, stories, rows });
      },
      removeStory: (slug) =>
        persist({
          ...state,
          stories: state.stories.filter((s) => s.slug !== slug),
          rows: state.rows.map((r) => ({ ...r, slugs: r.slugs.filter((s) => s !== slug) })),
          hero: state.hero.slug === slug ? { ...state.hero, slug: "" } : state.hero,
        }),
      saveRow: (row) => {
        const exists = state.rows.some((r) => r.id === row.id);
        persist({
          ...state,
          rows: exists ? state.rows.map((r) => (r.id === row.id ? row : r)) : [...state.rows, row],
        });
      },
      removeRow: (id) => persist({ ...state, rows: state.rows.filter((r) => r.id !== id) }),
      moveRow: (id, dir) =>
        persist({ ...state, rows: move(state.rows, state.rows.findIndex((r) => r.id === id), dir) }),
      moveStoryInRow: (rowId, slug, dir) =>
        persist({
          ...state,
          rows: state.rows.map((r) =>
            r.id === rowId ? { ...r, slugs: move(r.slugs, r.slugs.indexOf(slug), dir) } : r,
          ),
        }),
      reorderRows: (ids) =>
        persist({
          ...state,
          rows: ids
            .map((id) => state.rows.find((r) => r.id === id))
            .filter((r): r is Row => Boolean(r)),
        }),
      reorderRowItems: (rowId, slugs) =>
        persist({
          ...state,
          rows: state.rows.map((r) => (r.id === rowId ? { ...r, slugs } : r)),
        }),
      toggleStoryInRow: (rowId, slug) =>
        persist({
          ...state,
          rows: state.rows.map((r) =>
            r.id === rowId
              ? {
                  ...r,
                  slugs: r.slugs.includes(slug)
                    ? r.slugs.filter((s) => s !== slug)
                    : [...r.slugs, slug],
                }
              : r,
          ),
        }),
      saveCategory: (cat) => {
        const exists = state.categories.some((c) => c.id === cat.id);
        persist({
          ...state,
          categories: exists
            ? state.categories.map((c) => (c.id === cat.id ? cat : c))
            : [...state.categories, cat],
        });
      },
      removeCategory: (id) =>
        persist({ ...state, categories: state.categories.filter((c) => c.id !== id) }),
      saveProfile: (p) => {
        const exists = state.profiles.some((x) => x.id === p.id);
        if (!exists && state.profiles.length >= MAX_PROFILES) return;
        const profiles = exists
          ? state.profiles.map((x) => (x.id === p.id ? p : x))
          : [...state.profiles, p];
        persist({
          ...state,
          profiles,
          activeProfileId: state.activeProfileId || p.id,
        });
      },
      removeProfile: (id) =>
        persist({
          ...state,
          profiles: state.profiles.filter((p) => p.id !== id),
          activeProfileId:
            state.activeProfileId === id
              ? (state.profiles.find((p) => p.id !== id)?.id ?? "")
              : state.activeProfileId,
        }),
      reset: () => persist(defaultState),
    };
  }, [state]);

  return <StoreCtx.Provider value={api}>{children}</StoreCtx.Provider>;
}

export function useAppStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useAppStore precisa estar dentro de AppStoreProvider");
  return ctx;
}

export function useResolvedRows() {
  const { state } = useAppStore();
  return state.rows.map((row) => ({
    ...row,
    items: row.slugs
      .map((slug) => state.stories.find((s) => s.slug === slug))
      .filter((s): s is Story => Boolean(s)),
  }));
}

export const newStoryTemplate = (): Story => ({
  slug: "",
  title: "",
  cover: "",
  duration: "10 min",
  ageRange: "3-6 anos",
  verse: "",
  summary: "",
  tags: [],
  kind: "filme",
});

export const newId = uid;
