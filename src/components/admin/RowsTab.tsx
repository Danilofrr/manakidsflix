import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore, newId, type Row } from "@/lib/app-store";

export function RowsTab() {
  const { state, saveRow, removeRow, moveRow, moveStoryInRow, toggleStoryInRow } = useAppStore();

  return (
    <>
      <PageHeader
        title="Fileiras da home"
        subtitle="Monte as prateleiras que aparecem na tela inicial e escolha a ordem dos títulos."
        action={
          <Button
            variant="play"
            size="pill"
            onClick={() => saveRow({ id: newId(), title: "Nova fileira", subtitle: "", slugs: [] })}
          >
            <Plus className="h-4 w-4" />
            Nova fileira
          </Button>
        }
      />

      <div className="space-y-5">
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
    </>
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
    <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-card">
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
