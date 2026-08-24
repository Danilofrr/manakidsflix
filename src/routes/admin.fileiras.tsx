import { createFileRoute } from "@tanstack/react-router";
import { RowsTab } from "@/components/admin/RowsTab";

export const Route = createFileRoute("/admin/fileiras")({
  component: RowsTab,
});
