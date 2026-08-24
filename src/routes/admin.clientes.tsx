import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/admin/PageHeader";
import { ClientsTab } from "@/components/admin/ClientsTab";

export const Route = createFileRoute("/admin/clientes")({
  component: () => (
    <>
      <PageHeader
        title="Clientes e assinaturas"
        subtitle="Acompanhe quem está usando o app e a situação de cada assinatura."
      />
      <ClientsTab />
    </>
  ),
});
