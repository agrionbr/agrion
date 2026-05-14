import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Map as MapIcon, Plus, Trash2 } from "lucide-react";
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
import { fmtNum } from "@/lib/format";

const CROPS = ["soja","milho","trigo","algodao","feijao","arroz","sorgo","girassol","outro"] as const;

export const Route = createFileRoute("/_authenticated/app/plots" as never)({
  component: PlotsPage,
}) as never;

type Plot = { id: string; name: string; area_ha: number; current_crop: string | null; soil_type: string | null };

function PlotsPage() {
  const { farm } = useCurrentFarm();
  const farmId = farm?.id;
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["plots", farmId],
    enabled: !!farmId,
    queryFn: async () => {
      const { data, error } = await supabase.from("plots").select("*").eq("farm_id", farmId!).order("name");
      if (error) throw error;
      return data as Plot[];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("plots").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Talhão removido"); qc.invalidateQueries({ queryKey: ["plots", farmId] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const totalHa = (data ?? []).reduce((s, p) => s + Number(p.area_ha), 0);

  return (
    <div>
      <PageHeader
        title="Talhões"
        subtitle={`${data?.length ?? 0} talhões • ${fmtNum(totalHa, 1)} ha totais`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-agro text-agro-foreground hover:bg-agro/90"><Plus className="mr-2 h-4 w-4" /> Novo talhão</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Cadastrar talhão</DialogTitle></DialogHeader>
              <PlotForm farmId={farmId!} onDone={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Carregando...</div>
      ) : !data?.length ? (
        <EmptyState icon={MapIcon} title="Nenhum talhão" description="Cadastre seus talhões para começar a planejar safras." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-display text-lg font-semibold">{p.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{p.current_crop ?? "Sem cultura"} {p.soil_type ? `• ${p.soil_type}` : ""}</div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => confirm("Remover talhão?") && del.mutate(p.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="mt-3 inline-flex rounded-full bg-agro-soft px-3 py-1 text-sm font-medium text-agro">
                {fmtNum(Number(p.area_ha), 1)} ha
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlotForm({ farmId, onDone }: { farmId: string; onDone: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", area_ha: "", current_crop: "soja", soil_type: "" });

  const m = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error("Nome obrigatório");
      if (!form.area_ha) throw new Error("Área obrigatória");
      const { error } = await supabase.from("plots").insert({
        farm_id: farmId,
        name: form.name.trim(),
        area_ha: Number(form.area_ha),
        current_crop: form.current_crop as "soja",
        soil_type: form.soil_type || null,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Talhão cadastrado"); qc.invalidateQueries({ queryKey: ["plots", farmId] }); onDone(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="space-y-3">
      <div><Label>Nome *</Label><Input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Talhão 1" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Área (ha) *</Label><Input required type="number" step="0.01" value={form.area_ha} onChange={(e) => setForm((f) => ({ ...f, area_ha: e.target.value }))} /></div>
        <div>
          <Label>Cultura atual</Label>
          <Select value={form.current_crop} onValueChange={(v) => setForm((f) => ({ ...f, current_crop: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CROPS.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div><Label>Tipo de solo</Label><Input value={form.soil_type} onChange={(e) => setForm((f) => ({ ...f, soil_type: e.target.value }))} placeholder="Argiloso, arenoso..." /></div>
      <Button type="submit" disabled={m.isPending} className="w-full rounded-full bg-agro text-agro-foreground hover:bg-agro/90">
        {m.isPending ? "Salvando..." : "Cadastrar talhão"}
      </Button>
    </form>
  );
}