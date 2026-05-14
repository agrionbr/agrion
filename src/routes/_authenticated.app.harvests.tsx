import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Wheat, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentFarm } from "@/hooks/use-current-farm";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fmtDate, fmtNum } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/app/harvests" as never)({
  component: HarvestsPage,
}) as never;

type Harvest = {
  id: string; harvested_at: string; bags: number; bag_weight_kg: number;
  moisture_pct: number | null; area_ha: number | null; plot_id: string | null;
};

function HarvestsPage() {
  const { farm } = useCurrentFarm();
  const farmId = farm?.id;
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["harvests", farmId],
    enabled: !!farmId,
    queryFn: async () => {
      const { data, error } = await supabase.from("harvests").select("*").eq("farm_id", farmId!).order("harvested_at", { ascending: false });
      if (error) throw error;
      return data as Harvest[];
    },
  });

  const { data: plots } = useQuery({
    queryKey: ["plots-min", farmId],
    enabled: !!farmId,
    queryFn: async () => {
      const { data, error } = await supabase.from("plots").select("id,name").eq("farm_id", farmId!).order("name");
      if (error) throw error;
      return data as { id: string; name: string }[];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("harvests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Colheita removida"); qc.invalidateQueries({ queryKey: ["harvests", farmId] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const totalBags = (data ?? []).reduce((s, h) => s + Number(h.bags), 0);
  const totalKg = (data ?? []).reduce((s, h) => s + Number(h.bags) * Number(h.bag_weight_kg), 0);

  return (
    <div>
      <PageHeader
        title="Colheita"
        subtitle={`${fmtNum(totalBags)} sacas • ${fmtNum(totalKg / 1000, 1)} t totais`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-agro text-agro-foreground hover:bg-agro/90"><Plus className="mr-2 h-4 w-4" /> Nova colheita</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Registrar colheita</DialogTitle></DialogHeader>
              <HarvestForm farmId={farmId!} plots={plots ?? []} onDone={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Carregando...</div>
      ) : !data?.length ? (
        <EmptyState icon={Wheat} title="Nenhuma colheita" description="Registre as colheitas para acompanhar produtividade." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Data</th>
                <th className="px-4 py-3 text-left">Sacas</th>
                <th className="px-4 py-3 text-left">Peso/saca</th>
                <th className="px-4 py-3 text-left">Umidade</th>
                <th className="px-4 py-3 text-left">Sacas/ha</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {data.map((h) => {
                const yld = h.area_ha && Number(h.area_ha) > 0 ? Number(h.bags) / Number(h.area_ha) : null;
                return (
                  <tr key={h.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                    <td className="px-4 py-3 text-muted-foreground">{fmtDate(h.harvested_at)}</td>
                    <td className="px-4 py-3 font-medium">{fmtNum(Number(h.bags))}</td>
                    <td className="px-4 py-3">{fmtNum(Number(h.bag_weight_kg))} kg</td>
                    <td className="px-4 py-3">{h.moisture_pct ? `${fmtNum(Number(h.moisture_pct), 1)}%` : "—"}</td>
                    <td className="px-4 py-3 font-medium text-agro">{yld ? fmtNum(yld, 1) : "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <Button size="icon" variant="ghost" onClick={() => confirm("Remover?") && del.mutate(h.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function HarvestForm({ farmId, plots, onDone }: { farmId: string; plots: { id: string; name: string }[]; onDone: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    harvested_at: new Date().toISOString().slice(0, 10),
    bags: "", bag_weight_kg: "60", moisture_pct: "", area_ha: "", plot_id: "",
  });

  const m = useMutation({
    mutationFn: async () => {
      if (!form.bags) throw new Error("Sacas obrigatório");
      const { error } = await supabase.from("harvests").insert({
        farm_id: farmId,
        harvested_at: form.harvested_at,
        bags: Number(form.bags),
        bag_weight_kg: Number(form.bag_weight_kg) || 60,
        moisture_pct: form.moisture_pct ? Number(form.moisture_pct) : null,
        area_ha: form.area_ha ? Number(form.area_ha) : null,
        plot_id: form.plot_id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Colheita registrada"); qc.invalidateQueries({ queryKey: ["harvests", farmId] }); onDone(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Data</Label><Input type="date" value={form.harvested_at} onChange={(e) => setForm((f) => ({ ...f, harvested_at: e.target.value }))} /></div>
        <div>
          <Label>Talhão</Label>
          <Select value={form.plot_id} onValueChange={(v) => setForm((f) => ({ ...f, plot_id: v }))}>
            <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
            <SelectContent>{plots.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Sacas *</Label><Input required type="number" step="0.01" value={form.bags} onChange={(e) => setForm((f) => ({ ...f, bags: e.target.value }))} /></div>
        <div><Label>Peso/saca (kg)</Label><Input type="number" step="0.1" value={form.bag_weight_kg} onChange={(e) => setForm((f) => ({ ...f, bag_weight_kg: e.target.value }))} /></div>
        <div><Label>Umidade (%)</Label><Input type="number" step="0.1" value={form.moisture_pct} onChange={(e) => setForm((f) => ({ ...f, moisture_pct: e.target.value }))} /></div>
        <div><Label>Área colhida (ha)</Label><Input type="number" step="0.01" value={form.area_ha} onChange={(e) => setForm((f) => ({ ...f, area_ha: e.target.value }))} /></div>
      </div>
      <Button type="submit" disabled={m.isPending} className="w-full rounded-full bg-agro text-agro-foreground hover:bg-agro/90">
        {m.isPending ? "Salvando..." : "Registrar"}
      </Button>
    </form>
  );
}