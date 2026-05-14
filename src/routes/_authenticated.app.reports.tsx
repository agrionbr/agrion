import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Download, Beef, Wallet, ClipboardList, Wheat, Sprout } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentFarm } from "@/hooks/use-current-farm";
import { useSegment } from "@/hooks/use-segment";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/app/reports" as never)({
  component: ReportsPage,
}) as never;

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(";"), ...rows.map((r) => headers.map((h) => escape(r[h])).join(";"))].join("\n");
}

function download(filename: string, csv: string) {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function ReportsPage() {
  const { farm } = useCurrentFarm();
  const { segment } = useSegment();
  const farmId = farm?.id;
  const [loading, setLoading] = useState<string | null>(null);

  const exportTable = async (table: string, label: string, filename: string) => {
    if (!farmId) return;
    setLoading(table);
    try {
      const { data, error } = await supabase.from(table as never).select("*").eq("farm_id", farmId);
      if (error) throw error;
      if (!data?.length) { toast.info(`Sem dados de ${label} para exportar`); return; }
      download(filename, toCSV(data as Record<string, unknown>[]));
      toast.success(`${label} exportado`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setLoading(null); }
  };

  const reports = [
    ...(segment === "pecuaria" ? [
      { key: "animals", label: "Rebanho", icon: Beef, file: "rebanho.csv" },
      { key: "weighings", label: "Pesagens", icon: Beef, file: "pesagens.csv" },
      { key: "vaccinations", label: "Vacinações", icon: Beef, file: "vacinacoes.csv" },
    ] : []),
    ...(segment === "graos" ? [
      { key: "plots", label: "Talhões", icon: Sprout, file: "talhoes.csv" },
      { key: "crop_seasons", label: "Safras", icon: Sprout, file: "safras.csv" },
      { key: "applications", label: "Aplicações", icon: Sprout, file: "aplicacoes.csv" },
      { key: "harvests", label: "Colheitas", icon: Wheat, file: "colheitas.csv" },
    ] : []),
    { key: "transactions", label: "Financeiro", icon: Wallet, file: "financeiro.csv" },
    { key: "tasks", label: "Tarefas", icon: ClipboardList, file: "tarefas.csv" },
  ];

  return (
    <div>
      <PageHeader title="Relatórios" subtitle="Exporte seus dados em CSV (compatível com Excel)" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((r) => {
          const Icon = r.icon;
          return (
            <div key={r.key} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-agro-soft text-agro"><Icon className="h-5 w-5" /></div>
                <div>
                  <h3 className="font-display font-semibold">{r.label}</h3>
                  <p className="text-xs text-muted-foreground">Exportar todos os registros</p>
                </div>
              </div>
              <Button
                onClick={() => exportTable(r.key, r.label, r.file)}
                disabled={loading === r.key}
                className="mt-4 w-full rounded-full bg-agro text-agro-foreground hover:bg-agro/90"
              >
                <Download className="mr-2 h-4 w-4" /> {loading === r.key ? "Gerando..." : "Baixar CSV"}
              </Button>
            </div>
          );
        })}
      </div>
      <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-5 text-sm text-muted-foreground">
        <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-agro" /><span className="font-medium text-foreground">Em breve</span></div>
        <p className="mt-1">Relatórios PDF com KPIs, gráficos de produtividade e DRE consolidado.</p>
      </div>
    </div>
  );
}