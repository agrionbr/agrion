import { createFileRoute } from "@tanstack/react-router";
import { Scale } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

export const Route = createFileRoute("/_authenticated/app/weighings" as never)({
  component: () => (
    <div>
      <PageHeader title="Pesagem" subtitle="Registros e ganho médio diário" />
      <EmptyState icon={Scale} title="Em construção" description="Em breve: registro de pesagem com cálculo automático de GMD." />
    </div>
  ),
}) as never;