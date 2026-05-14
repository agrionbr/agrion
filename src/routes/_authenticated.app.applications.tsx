import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FlaskConical, Plus, Trash2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { fmtBRL, fmtDate, fmtNum } from "@/lib/format";

const KINDS = ["fertilizante","defensivo","semente","calcario","foliar","outro"] as const;

export const Route = createFileRoute("/_authenticated/app/applications" as never)({
  component: AppsPage,
}) as never;

type App = {
  id: string; kind: string; product: string; dose: string | null;
  quantity: number | null; unit: string | null; cost: number | null;
  applied_at: string; plot_id: string | null;
};

function AppsPage() {
  const { farm } = useCurrentFarm();
  const farmId = farm?.id;
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["applications", farmId],
    enabled: !!farmId,
    queryFn: async () => {
      const { data, error } = await supabase.from("applications").select("*").eq("farm_id", farmId!).order("applied_at", { ascending: false });
      if (error) throw error;
      return data as App[];
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
      const { error } = await supabase.from("applications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Aplicação removida"); qc.invalidateQueries({ queryKey: ["applications", farmId] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader
        title="Aplicações e Insumos"
        subtitle={`${data?.length ?? 0} aplicações registradas`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-agro text-agro-foreground hover:bg-agro/90"><Plus className="mr-2 h-4 w-4" /> Nova aplicação</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Registrar aplicação</DialogTitle></DialogHeader>
              <AppForm farmId={farmId!} plots={plots ?? []} onDone={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Carregando...</div>
      ) : !data?.length ? (
        <EmptyState icon={FlaskConical} title="Nenhuma aplicação" description="Registre fertilizantes, defensivos e demais insumos." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Data</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Produto</th>
                <th className="px-4 py-3 text-left">Quantidade</th>
                <th className="px-4 py-3 text-left">Custo</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {data.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                  <td className="px-4 py-3 text-muted-foreground">{fmtDate(a.applied_at)}</td>
                  <td className="px-4 py-3"><Badge className="bg-agro-soft text-agro hover:bg-agro-soft capitalize">{a.kind}</Badge></td>
                  <td className="px-4 py-3 font-medium">{a.product}{a.dose ? ` • ${a.dose}` : ""}</td>
                  <td className="px-4 py-3">{a.quantity ? `${fmtNum(Number(a.quantity), 2)} ${a.unit ?? ""}` : "—"}</td>
                  <td className="px-4 py-3">{a.cost ? fmtBRL(Number(a.cost)) : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="icon" variant="ghost" onClick={() => confirm("Remover?") && del.mutate(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AppForm({ farmId, plots, onDone }: { farmId: string; plots: { id: string; name: string }[]; onDone: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    kind: "fertilizante", product: "", dose: "", quantity: "", unit: "kg", cost: "",
    applied_at: new Date().toISOString().slice(0, 10), plot_id: "",
  });

  const m = useMutation({
    mutationFn: async () => {
      if (!form.product.trim()) throw new Error("Produto obrigatório");
      const { error } = await supabase.from("applications").insert({
        farm_id: farmId,
        kind: form.kind as "fertilizante",
        product: form.product.trim(),
        dose: form.dose || null,
        quantity: form.quantity ? Number(form.quantity) : null,
        unit: form.unit || null,
        cost: form.cost ? Number(form.cost) : null,
        applied_at: form.applied_at,
        plot_id: form.plot_id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Aplicação registrada"); qc.invalidateQueries({ queryKey: ["applications", farmId] }); onDone(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Tipo</Label>
          <Select value={form.kind} onValueChange={(v) => setForm((f) => ({ ...f, kind: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{KINDS.map((k) => <SelectItem key={k} value={k} className="capitalize">{k}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Data</Label><Input type="date" value={form.applied_at} onChange={(e) => setForm((f) => ({ ...f, applied_at: e.target.value }))} /></div>
        <div className="col-span-2"><Label>Produto *</Label><Input required value={form.product} onChange={(e) => setForm((f) => ({ ...f, product: e.target.value }))} placeholder="Ureia, Glifosato..." /></div>
        <div><Label>Dose</Label><Input value={form.dose} onChange={(e) => setForm((f) => ({ ...f, dose: e.target.value }))} placeholder="200 kg/ha" /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label>Qtd</Label><Input type="number" step="0.01" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} /></div>
          <div><Label>Un.</Label><Input value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} /></div>
        </div>
        <div><Label>Custo (R$)</Label><Input type="number" step="0.01" value={form.cost} onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))} /></div>
        <div>
          <Label>Talhão</Label>
          <Select value={form.plot_id} onValueChange={(v) => setForm((f) => ({ ...f, plot_id: v }))}>
            <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
            <SelectContent>{plots.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" disabled={m.isPending} className="w-full rounded-full bg-agro text-agro-foreground hover:bg-agro/90">
        {m.isPending ? "Salvando..." : "Registrar"}
      </Button>
    </form>
  );
}