import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  deleteHeroSlide,
  listHeroSlides,
  reorderHeroSlides,
  upsertHeroSlide,
  loadTitleMaps,
  type HeroSlide,
} from "@/lib/hero-slides";
import { useAppStore } from "@/lib/app-store";

export function HeroSlidesTab() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [idBySlug, setIdBySlug] = useState<Map<string, string>>(new Map());
  const [slugById, setSlugById] = useState<Map<string, string>>(new Map());
  const { state } = useAppStore();

  async function refresh() {
    try {
      setSlides(await listHeroSlides());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    void refresh();
    void loadTitleMaps().then(({ idBySlug: a, slugById: b }) => {
      setIdBySlug(a);
      setSlugById(b);
    });
  }, []);

  async function save(slide: HeroSlide) {
    setSlides((prev) => prev.map((s) => (s.id === slide.id ? slide : s)));
    try {
      await upsertHeroSlide(slide);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= slides.length) return;
    const next = [...slides];
    const a = next[index]!;
    next[index] = next[target]!;
    next[target] = a;
    setSlides(next);
    await reorderHeroSlides(next);
    await refresh();
  }

  return (
    <>
      <PageHeader
        title="Destaques da home"
        subtitle="Carrossel principal do app: use imagens ou vídeos, escolha o tempo de cada slide e a ordem."
        action={
          <Button
            variant="play"
            size="pill"
            onClick={async () => {
              await upsertHeroSlide({
                title: "Novo destaque",
                media_type: "image",
                sort_order: slides.length,
              });
              await refresh();
            }}
          >
            <Plus className="h-4 w-4" />
            Novo destaque
          </Button>
        }
      />

      {error && <p className="mb-4 text-sm font-semibold text-destructive">{error}</p>}

      <div className="space-y-5">
        {slides.map((slide, index) => (
          <div key={slide.id} className="rounded-3xl border border-border/60 bg-card p-5 shadow-card">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="font-display text-lg font-extrabold">
                {index + 1}. {slide.title}
              </p>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 font-display text-xs">
                  <Switch
                    checked={slide.published}
                    onCheckedChange={(published) => void save({ ...slide, published })}
                  />
                  Publicado
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Subir"
                  disabled={index === 0}
                  onClick={() => void move(index, -1)}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Descer"
                  disabled={index === slides.length - 1}
                  onClick={() => void move(index, 1)}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Excluir ${slide.title}`}
                  onClick={async () => {
                    await deleteHeroSlide(slide.id);
                    await refresh();
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <Label>Título</Label>
                  <Input
                    value={slide.title}
                    onChange={(e) => void save({ ...slide, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Selo</Label>
                  <Input
                    value={slide.badge ?? ""}
                    onChange={(e) => void save({ ...slide, badge: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    rows={3}
                    value={slide.description ?? ""}
                    onChange={(e) => void save({ ...slide, description: e.target.value })}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Botão principal</Label>
                    <Input
                      value={slide.cta_primary}
                      onChange={(e) => void save({ ...slide, cta_primary: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Botão secundário</Label>
                    <Input
                      value={slide.cta_secondary}
                      onChange={(e) => void save({ ...slide, cta_secondary: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Segundos na tela</Label>
                  <Input
                    type="number"
                    min={3}
                    value={slide.slide_seconds}
                    onChange={(e) =>
                      void save({ ...slide, slide_seconds: Number(e.target.value) || 8 })
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label>Tipo de mídia</Label>
                  <div className="mt-2 flex gap-2">
                    {(["image", "video"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => void save({ ...slide, media_type: t })}
                        className={`rounded-full border-2 px-4 py-2 font-display text-sm ${
                          slide.media_type === t
                            ? "border-primary bg-muted"
                            : "border-border/70 text-muted-foreground"
                        }`}
                      >
                        {t === "image" ? "Imagem" : "Vídeo"}
                      </button>
                    ))}
                  </div>
                </div>

                {slide.media_type === "image" ? (
                  <>
                    <MediaPicker
                      label="Imagem (desktop)"
                      folder="banners"
                      value={slide.image_desktop ?? ""}
                      onChange={(image_desktop) => void save({ ...slide, image_desktop })}
                    />
                    <MediaPicker
                      label="Imagem (celular)"
                      folder="banners"
                      value={slide.image_mobile ?? ""}
                      onChange={(image_mobile) => void save({ ...slide, image_mobile })}
                    />
                  </>
                ) : (
                  <MediaPicker
                    label="Vídeo do destaque"
                    kind="video"
                    folder="trailers"
                    value={slide.video_url ?? ""}
                    onChange={(video_url) => void save({ ...slide, video_url })}
                  />
                )}

                <MediaPicker
                  label="Logo do título (opcional)"
                  folder="logos"
                  value={slide.logo ?? ""}
                  onChange={(logo) => void save({ ...slide, logo })}
                />

                <div>
                  <Label>Título vinculado (botão assistir)</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {state.stories.map((s) => (
                      <button
                        key={s.slug}
                        onClick={() => void save({ ...slide, title_id: idBySlug.get(s.slug) ?? null })}
                        className={`rounded-full border-2 px-3 py-1.5 text-xs ${
                          slide.title_id != null && slugById.get(slide.title_id) === s.slug
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
            </div>
          </div>
        ))}

        {slides.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nenhum destaque cadastrado ainda.
          </p>
        )}
      </div>
    </>
  );
}
