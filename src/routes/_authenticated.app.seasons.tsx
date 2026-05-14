import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Sprout, Plus, Trash2 } from "lucide-react";
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
import { fmtDate } from "@/lib/format";

const CROPS = ["soja","milho","trigo","algodao","feijao","arroz","sorgo","girassol","outro"] as const;
const STATUS = ["planejado","plantado","em_desenvolvimento","colhido","encerrado"] as const;

export const Route = createFileRoute("/_authenticated/app/seasons" as never)({
  component: SeasonsPage,
}) as never;

type Season = {
  id: string; name: string; crop: string; variety: string | null;
  planted_at: string | null; expected_harvest_at: string | null;
  status: string; plot_id: string | null;
};

function SeasonsPage() {
  const { farm } = useCurrentFarm();
  const farmId = farm?.id;
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: seasons, isLoading } = useQuery({
    queryKey: ["seasons", farmId],
    enabled: !!farmId,
    queryFn: async () => {
      const { data, error } = await supabase.from("crop_seasons").select("*").eq("farm_id", farmId!).order("created_at", { ascending: false });
      if (error) throw error;
      return data as Season[];
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
      const { error } = await supabase.from("crop_seasons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Safra removida"); qc.invalidateQueries({ queryKey: ["seasons", farmId] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader
        title="Safras"
        subtitle={`${seasons?.length ?? 0} safras cadastradas`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-agro text-agro-foreground hover:bg-agro/90"><Plus className="mr-2 h-4 w-4" /> Nova safra</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Cadastrar safra</DialogTitle></DialogHeader>
              <SeasonForm farmId={farmId!} plots={plots ?? []} onDone={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Carregando...</div>
      ) : !seasons?.length ? (
        <EmptyState icon={Sprout} title="Nenhuma safra" description="Cadastre safras para acompanhar plantio e colheita." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">Cultura</th>
                <th className="px-4 py-3 text-left">Plantio</th>
                <th className="px-4 py-3 text-left">Colheita prev.</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {seasons.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 capitalize">{s.crop}{s.variety ? ` • ${s.variety}` : ""}</td>
                  <td className="px-4 py-3 text-muted-foreground">{fmtDate(s.planted_at)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{fmtDate(s.expected_harvest_at)}</td>
                  <td className="px-4 py-3"><Badge className="bg-agro-soft text-agro hover:bg-agro-soft capitalize">{s.status.replace("_", " ")}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <Button size="icon" variant="ghost" onClick={() => confirm("Remover safra?") && del.mutate(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

function SeasonForm({ farmId, plots, onDone }: { farmId: string; plots: { id: string; name: string }[]; onDone: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: "", crop: "soja", variety: "", planted_at: "", expected_harvest_at: "",
    status: "planejado", plot_id: "",
  });

  const m = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error("Nome obrigatório");
      const { error } = await supabase.from("crop_seasons").insert({
        farm_id: farmId,
        name: form.name.trim(),
        crop: form.crop as "soja",
        variety: form.variety || null,
        planted_at: form.planted_at || null,
        expected_harvest_at: form.expected_harvest_at || null,
        status: form.status as "planejado",
        plot_id: form.plot_id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Safra cadastrada"); qc.invalidateQueries({ queryKey: ["seasons", farmId] }); onDone(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="space-y-3">
      <div><Label>Nome *</Label><Input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Safra Verão 25/26" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Cultura</Label>
          <Select value={form.crop} onValueChange={(v) => setForm((f) => ({ ...f, crop: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CROPS.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Variedade</Label><Input value={form.variety} onChange={(e) => setForm((f) => ({ ...f, variety: e.target.value }))} /></div>
        <div><Label>Plantio</Label><Input type="date" value={form.planted_at} onChange={(e) => setForm((f) => ({ ...f, planted_at: e.target.value }))} /></div>
        <div><Label>Colheita prev.</Label><Input type="date" value={form.expected_harvest_at} onChange={(e) => setForm((f) => ({ ...f, expected_harvest_at: e.target.value }))} /></div>
        <div>
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{STATUS.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Talhão</Label>
          <Select value={form.plot_id} onValueChange={(v) => setForm((f) => ({ ...f, plot_id: v }))}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>{plots.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" disabled={m.isPending} className="w-full rounded-full bg-agro text-agro-foreground hover:bg-agro/90">
        {m.isPending ? "Salvando..." : "Cadastrar safra"}
      </Button>
    </form>
  );
}