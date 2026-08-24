import { createFileRoute } from "@tanstack/react-router";
import { CatalogTab } from "@/components/admin/CatalogTab";

export const Route = createFileRoute("/admin/catalogo")({
  component: CatalogTab,
});
