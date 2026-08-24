import { createFileRoute } from "@tanstack/react-router";
import { HeroSlidesTab } from "@/components/admin/HeroSlidesTab";

export const Route = createFileRoute("/admin/destaques")({
  component: HeroSlidesTab,
});
