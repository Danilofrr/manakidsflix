import { createFileRoute } from "@tanstack/react-router";
import { PlansTab } from "@/components/admin/PlansTab";

export const Route = createFileRoute("/admin/planos")({
  component: PlansTab,
});
