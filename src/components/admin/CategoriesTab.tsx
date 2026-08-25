import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore, newId, type Tone } from "@/lib/app-store";

const tones: Tone[] = ["primary", "secondary", "accent", "sunny", "mint"];

export function CategoriesTab() {
  const { state, saveCategory, removeCategory } = useAppStore();

  return (
    <>
      <PageHeader
        title="Categorias"
        subtitle="Etiquetas coloridas que aparecem no topo da tela inicial."
        action={
          <Button
            variant="play"
            size="pill"
            onClick={() => saveCategory({ id: newId(), label: "Nova categoria", tone: "primary" })}
          >
            <Plus className="h-4 w-4" />
            Nova categoria
          </Button>
        }
      />

      <div className="space-y-4">
        {state.categories.map((cat) => (
          <div
            key={cat.id}
            className="flex flex-wrap items-end gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-card"
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
    </>
  );
}
