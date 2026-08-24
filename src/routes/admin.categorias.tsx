import { createFileRoute } from "@tanstack/react-router";
import { CategoriesTab } from "@/components/admin/CategoriesTab";

export const Route = createFileRoute("/admin/categorias")({
  component: CategoriesTab,
});
