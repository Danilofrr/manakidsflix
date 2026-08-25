import { createFileRoute } from "@tanstack/react-router";
import { FooterTab } from "@/components/admin/FooterTab";

export const Route = createFileRoute("/admin/rodape")({
  component: FooterTab,
});
