import { createFileRoute } from "@tanstack/react-router";
import { MediaTab } from "@/components/admin/MediaTab";

export const Route = createFileRoute("/admin/midia")({
  component: MediaTab,
});
