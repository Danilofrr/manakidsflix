import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/lib/app-store";
import type { FooterColumn, SocialKey } from "@/lib/app-store";

const uid = () => Math.random().toString(36).slice(2, 9);

const SOCIAL_FIELDS: { key: SocialKey; label: string; placeholder: string }[] = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/manakidsmais" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@manakidsmais" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/manakidsmais" },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@manakidsmais" },
  { key: "whatsapp", label: "WhatsApp", placeholder: "https://wa.me/5511999999999" },
];

export function FooterTab() {
  const { state, update } = useAppStore();
  const texts = state.texts;
  const columns = texts.footerColumns ?? [];

  const setColumns = (next: FooterColumn[]) => update({ texts: { ...texts, footerColumns: next } });

  const moveColumn = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= columns.length) return;
    const next = [...columns];
    const a = next[index]!;
    next[index] = next[target]!;
    next[target] = a;
    setColumns(next);
  };

  return (
    <>
      <PageHeader
        title="Rodapé do site"
        subtitle="Colunas, links e redes sociais que aparecem no rodapé da área dos clientes."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <div className="space-y-4 rounded-3xl border border-border/60 bg-card p-5 shadow-card">
            <h2 className="font-display text-lg font-extrabold">Textos gerais</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="fbrand">Nome da marca no rodapé</Label>
                <Input
                  id="fbrand"
                  value={texts.footerBrand ?? ""}
                  onChange={(e) => update({ texts: { ...texts, footerBrand: e.target.value } })}
                />
              </div>
              <div>
                <Label htmlFor="fcopy">Aviso de direitos</Label>
                <Input
                  id="fcopy"
                  value={texts.footerCopyright ?? ""}
                  onChange={(e) => update({ texts: { ...texts, footerCopyright: e.target.value } })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="fline">Frase do rodapé</Label>
              <Input
                id="fline"
                value={texts.footer}
                onChange={(e) => update({ texts: { ...texts, footer: e.target.value } })}
              />
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-border/60 bg-card p-5 shadow-card">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <h2 className="min-w-0 font-display text-lg font-extrabold">Colunas de links</h2>
              <Button
                size="pill"
                variant="outline"
                onClick={() =>
                  setColumns([...columns, { id: uid(), title: "Nova coluna", links: [] }])
                }
              >
                <Plus className="h-4 w-4" />
                Coluna
              </Button>
            </div>

            {columns.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma coluna. O rodapé fica só com a marca e as redes sociais.
              </p>
            ) : null}

            {columns.map((col, ci) => (
              <div key={col.id} className="space-y-3 rounded-2xl border border-border/60 p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
                  <div className="min-w-0">
                    <Label>Título da coluna</Label>
                    <Input
                      value={col.title}
                      onChange={(e) =>
                        setColumns(
                          columns.map((c) =>
                            c.id === col.id ? { ...c, title: e.target.value } : c,
                          ),
                        )
                      }
                    />
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Subir coluna"
                      onClick={() => moveColumn(ci, -1)}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Descer coluna"
                      onClick={() => moveColumn(ci, 1)}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Remover coluna"
                      onClick={() => setColumns(columns.filter((c) => c.id !== col.id))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {col.links.map((link) => (
                    <div
                      key={link.id}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]"
                    >
                      <Input
                        aria-label="Texto do link"
                        placeholder="Texto"
                        value={link.label}
                        onChange={(e) =>
                          setColumns(
                            columns.map((c) =>
                              c.id === col.id
                                ? {
                                    ...c,
                                    links: c.links.map((l) =>
                                      l.id === link.id ? { ...l, label: e.target.value } : l,
                                    ),
                                  }
                                : c,
                            ),
                          )
                        }
                      />
                      <Input
                        aria-label="Endereço do link"
                        placeholder="/perfis ou https://..."
                        value={link.url}
                        onChange={(e) =>
                          setColumns(
                            columns.map((c) =>
                              c.id === col.id
                                ? {
                                    ...c,
                                    links: c.links.map((l) =>
                                      l.id === link.id ? { ...l, url: e.target.value } : l,
                                    ),
                                  }
                                : c,
                            ),
                          )
                        }
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="Remover link"
                        onClick={() =>
                          setColumns(
                            columns.map((c) =>
                              c.id === col.id
                                ? { ...c, links: c.links.filter((l) => l.id !== link.id) }
                                : c,
                            ),
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setColumns(
                        columns.map((c) =>
                          c.id === col.id
                            ? { ...c, links: [...c.links, { id: uid(), label: "Novo link", url: "" }] }
                            : c,
                        ),
                      )
                    }
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar link
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-border/60 bg-card p-5 shadow-card">
          <h2 className="font-display text-lg font-extrabold">Redes sociais</h2>
          <p className="text-sm text-muted-foreground">
            Deixe em branco para esconder. Se só o Instagram tiver link, só ele aparece no rodapé.
          </p>
          {SOCIAL_FIELDS.map((s) => (
            <div key={s.key}>
              <Label htmlFor={`social-${s.key}`}>{s.label}</Label>
              <Input
                id={`social-${s.key}`}
                placeholder={s.placeholder}
                value={texts.socials?.[s.key] ?? ""}
                onChange={(e) =>
                  update({
                    texts: { ...texts, socials: { ...texts.socials, [s.key]: e.target.value } },
                  })
                }
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
