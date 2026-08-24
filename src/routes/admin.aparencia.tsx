import { createFileRoute } from "@tanstack/react-router";
import { AppearanceTab } from "@/components/admin/AppearanceTab";

export const Route = createFileRoute("/admin/aparencia")({
  component: AppearanceTab,
});
