import { useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore, newId, type Row } from "@/lib/app-store";

/** Reordena uma lista movendo o item `from` para a posição `to`. */
function reorder<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  if (!item) return list;
  next.splice(to, 0, item);
  return next;
}

export function RowsTab() {
  const { state, saveRow, removeRow, moveRow, toggleStoryInRow, reorderRows, reorderRowItems } =
    useAppStore();
  const [dragRow, setDragRow] = useState<number | null>(null);

  return (
    <>
      <PageHeader
        title="Fileiras da home"
        subtitle="Arraste as fileiras e os títulos para montar a ordem exata da tela inicial."
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
          <div
            key={row.id}
            onDragOver={(e) => {
              if (dragRow !== null) e.preventDefault();
            }}
            onDrop={() => {
              if (dragRow === null) return;
              reorderRows(reorder(state.rows, dragRow, index).map((r) => r.id));
              setDragRow(null);
            }}
            className={dragRow === index ? "opacity-50" : ""}
          >
            <RowEditor
              row={row}
              isFirst={index === 0}
              isLast={index === state.rows.length - 1}
              onSave={saveRow}
              onRemove={removeRow}
              onMove={moveRow}
              onToggleStory={toggleStoryInRow}
              onReorderItems={reorderRowItems}
              onDragStart={() => setDragRow(index)}
              onDragEnd={() => setDragRow(null)}
            />
          </div>
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
  onToggleStory,
  onReorderItems,
  onDragStart,
  onDragEnd,
}: {
  row: Row;
  isFirst: boolean;
  isLast: boolean;
  onSave: (row: Row) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onToggleStory: (rowId: string, slug: string) => void;
  onReorderItems: (rowId: string, slugs: string[]) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const { state } = useAppStore();
  const [dragItem, setDragItem] = useState<number | null>(null);

  return (
    <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-card">
      <div className="flex flex-wrap items-end gap-3">
        <button
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          aria-label={`Arrastar a fileira ${row.title}`}
          className="mb-1.5 cursor-grab rounded-lg p-2 text-muted-foreground hover:bg-muted active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
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
            <li
              key={slug}
              draggable
              onDragStart={() => setDragItem(i)}
              onDragEnd={() => setDragItem(null)}
              onDragOver={(e) => {
                if (dragItem !== null) e.preventDefault();
              }}
              onDrop={() => {
                if (dragItem === null) return;
                onReorderItems(row.id, reorder(row.slugs, dragItem, i));
                setDragItem(null);
              }}
              className={`flex cursor-grab items-center gap-2 rounded-xl bg-muted px-3 py-2 active:cursor-grabbing ${
                dragItem === i ? "opacity-50" : ""
              }`}
            >
              <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="font-display text-xs text-muted-foreground">{i + 1}</span>
              {story.cover ? (
                <img src={story.cover} alt="" className="h-9 w-7 rounded object-cover" loading="lazy" />
              ) : null}
              <span className="min-w-0 flex-1 truncate text-sm">{story.title}</span>
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
        {row.slugs.length === 0 ? (
          <li className="rounded-xl border-2 border-dashed border-border/70 px-3 py-4 text-center text-xs text-muted-foreground">
            Nenhum título nesta fileira ainda.
          </li>
        ) : null}
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
