import { supabase } from "@/integrations/supabase/client";

export type Plan = {
  id: string;
  name: string;
  price_cents: number;
  period: string;
  benefits: string[];
  active: boolean;
  sort_order: number;
};

export async function listPlans() {
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Plan[];
}

export async function upsertPlan(plan: Partial<Plan> & { name: string }) {
  const { error } = await supabase.from("plans").upsert(plan as never);
  if (error) throw new Error(error.message);
}

export async function deletePlan(id: string) {
  const { error } = await supabase.from("plans").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export const formatPrice = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
