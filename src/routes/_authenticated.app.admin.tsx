import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

export const Route = createFileRoute("/_authenticated/app/admin" as never)({
  component: AdminPage,
}) as never;

function AdminPage() {
  const { isAdmin, isLoading } = useIsAdmin();

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    enabled: isAdmin,
    queryFn: async () => {
      const [farms, animals, plots] = await Promise.all([
        supabase.from("farms").select("id", { count: "exact", head: true }),
        supabase.from("animals").select("id", { count: "exact", head: true }),
        supabase.from("plots").select("id", { count: "exact", head: true }),
      ]);
      return {
        farms: farms.count ?? 0,
        animals: animals.count ?? 0,
        plots: plots.count ?? 0,
      };
    },
  });

  if (isLoading) return <div className="p-6 text-muted-foreground">Carregando...</div>;
  if (!isAdmin) return <Navigate to="/app" />;

  return (
    <div>
      <PageHeader title="Administração" subtitle="Painel restrito ao administrador AGRION" />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Fazendas" value={stats?.farms ?? "—"} />
        <Stat label="Animais" value={stats?.animals ?? "—"} />
        <Stat label="Talhões" value={stats?.plots ?? "—"} />
      </div>

      <div className="mt-8">
        <EmptyState
          icon={Users}
          title="Gestão de usuários"
          description="Em breve: listagem de usuários, papéis e bloqueio de contas."
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-agro" /> {label}
      </div>
      <div className="mt-2 font-display text-3xl font-bold">{value}</div>
    </div>
  );
}
