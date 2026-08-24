import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, BadgeCheck, AlertTriangle, Film, Tv, Images, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAppStore } from "@/lib/app-store";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

type Counts = {
  clients: number;
  emDia: number;
  atrasados: number;
  media: number;
  slides: number;
  byMonth: { label: string; value: number }[];
};

function AdminDashboard() {
  const { state } = useAppStore();
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const [profiles, subs, media, slides] = await Promise.all([
        supabase.from("profiles").select("id, created_at"),
        supabase.from("subscriptions").select("status"),
        supabase.from("media_assets").select("id"),
        supabase.from("hero_slides").select("id"),
      ]);
      if (!active) return;

      const months: { label: string; value: number }[] = [];
      const now = new Date();
      for (let i = 5; i >= 0; i -= 1) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleDateString("pt-BR", { month: "short" });
        const value = (profiles.data ?? []).filter((p) => {
          const c = new Date(p.created_at);
          return c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth();
        }).length;
        months.push({ label, value });
      }

      setCounts({
        clients: profiles.data?.length ?? 0,
        emDia: (subs.data ?? []).filter((s) => s.status === "em_dia").length,
        atrasados: (subs.data ?? []).filter((s) => s.status === "atrasado").length,
        media: media.data?.length ?? 0,
        slides: slides.data?.length ?? 0,
        byMonth: months,
      });
    })();
    return () => {
      active = false;
    };
  }, []);

  const filmes = state.stories.filter((s) => s.kind === "filme").length;
  const series = state.stories.filter((s) => s.kind === "serie").length;
  const max = Math.max(1, ...(counts?.byMonth.map((m) => m.value) ?? [1]));

  const cards = [
    { icon: Users, label: "Contas cadastradas", value: counts?.clients ?? "—" },
    { icon: BadgeCheck, label: "Assinaturas em dia", value: counts?.emDia ?? "—" },
    { icon: AlertTriangle, label: "Assinaturas atrasadas", value: counts?.atrasados ?? "—" },
    { icon: Film, label: "Filmes", value: filmes },
    { icon: Tv, label: "Séries", value: series },
    { icon: Sparkles, label: "Destaques da home", value: counts?.slides ?? "—" },
    { icon: Images, label: "Arquivos de mídia", value: counts?.media ?? "—" },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral da plataforma Maná Kids+."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-3xl border border-border/60 bg-card p-4 shadow-card">
            <c.icon className="h-5 w-5 text-primary" />
            <p className="mt-2 font-display text-3xl font-extrabold">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-card">
          <h2 className="font-display text-lg font-extrabold">Novos cadastros por mês</h2>
          <div className="mt-6 flex h-44 items-end gap-3">
            {(counts?.byMonth ?? []).map((m) => (
              <div key={m.label} className="flex flex-1 flex-col items-center gap-2">
                <span className="font-display text-xs text-muted-foreground">{m.value}</span>
                <div
                  className="w-full rounded-t-xl bg-gradient-brand"
                  style={{ height: `${Math.max(4, (m.value / max) * 100)}%` }}
                />
                <span className="text-[11px] capitalize text-muted-foreground">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-card">
          <h2 className="font-display text-lg font-extrabold">Atalhos</h2>
          <div className="mt-4 grid gap-2">
            {[
              { to: "/admin/catalogo" as const, label: "Cadastrar filme ou série" },
              { to: "/admin/destaques" as const, label: "Editar destaques da home" },
              { to: "/admin/midia" as const, label: "Enviar imagens e vídeos" },
              { to: "/admin/clientes" as const, label: "Ver clientes e assinaturas" },
            ].map((s) => (
              <Link
                key={s.to}
                to={s.to}
                className="rounded-xl bg-muted px-4 py-3 font-display text-sm hover:bg-muted/70"
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
