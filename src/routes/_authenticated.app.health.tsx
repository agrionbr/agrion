import { createFileRoute } from "@tanstack/react-router";
import { Syringe } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

export const Route = createFileRoute("/_authenticated/app/health" as never)({
  component: () => (
    <div>
      <PageHeader title="Sanidade" subtitle="Vacinas, vermifugação e calendário" />
      <EmptyState icon={Syringe} title="Em construção" description="Em breve: calendário sanitário e histórico por animal." />
    </div>
  ),
}) as never;