import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Beef, Plus, Search, Trash2 } from "lucide-react";
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
import { fmtDate, fmtNum } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/app/animals" as never)({
  component: AnimalsPage,
}) as never;

type Animal = {
  id: string; tag: string; breed: string | null; sex: "macho" | "femea";
  current_weight_kg: number | null; lot: string | null; status: string;
  entry_date: string; birth_date: string | null;
};

function AnimalsPage() {
  const { farm } = useCurrentFarm();
  const farmId = farm?.id;
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["animals", farmId],
    enabled: !!farmId,
    queryFn: async () => {
      const { data, error } = await supabase.from("animals").select("*").eq("farm_id", farmId!).order("created_at", { ascending: false });
      if (error) throw error;
      return data as Animal[];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("animals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Animal removido"); qc.invalidateQueries({ queryKey: ["animals", farmId] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = (data ?? []).filter((a) =>
    !q || a.tag.toLowerCase().includes(q.toLowerCase()) || a.breed?.toLowerCase().includes(q.toLowerCase()) || a.lot?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Rebanho"
        subtitle={`${data?.length ?? 0} animais cadastrados`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-agro text-agro-foreground hover:bg-agro/90"><Plus className="mr-2 h-4 w-4" /> Novo animal</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Cadastrar animal</DialogTitle></DialogHeader>
              <AnimalForm farmId={farmId!} onDone={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar por brinco, raça ou lote..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Carregando...</div>
      ) : !filtered.length ? (
        <EmptyState icon={Beef} title="Nenhum animal" description="Cadastre seu primeiro animal para começar." action={<Button onClick={() => setOpen(true)} className="rounded-full bg-agro text-agro-foreground hover:bg-agro/90"><Plus className="mr-2 h-4 w-4" /> Novo animal</Button>} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Brinco</th>
                  <th className="px-4 py-3 text-left">Raça</th>
                  <th className="px-4 py-3 text-left">Sexo</th>
                  <th className="px-4 py-3 text-left">Peso</th>
                  <th className="px-4 py-3 text-left">Lote</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Entrada</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                    <td className="px-4 py-3 font-mono font-medium">{a.tag}</td>
                    <td className="px-4 py-3">{a.breed ?? "—"}</td>
                    <td className="px-4 py-3 capitalize">{a.sex === "macho" ? "Macho" : "Fêmea"}</td>
                    <td className="px-4 py-3">{a.current_weight_kg ? `${fmtNum(Number(a.current_weight_kg), 1)} kg` : "—"}</td>
                    <td className="px-4 py-3">{a.lot ?? "—"}</td>
                    <td className="px-4 py-3"><Badge variant={a.status === "ativo" ? "default" : "secondary"} className={a.status === "ativo" ? "bg-agro-soft text-agro hover:bg-agro-soft" : ""}>{a.status}</Badge></td>
                    <td className="px-4 py-3 text-muted-foreground">{fmtDate(a.entry_date)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button size="icon" variant="ghost" onClick={() => confirm("Remover animal?") && del.mutate(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function AnimalForm({ farmId, onDone }: { farmId: string; onDone: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    tag: "", breed: "", sex: "macho", current_weight_kg: "", lot: "", origin: "", notes: "",
  });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const m = useMutation({
    mutationFn: async () => {
      if (!form.tag.trim()) throw new Error("Brinco obrigatório");
      const { error } = await supabase.from("animals").insert({
        farm_id: farmId,
        tag: form.tag.trim(),
        breed: form.breed || null,
        sex: form.sex as "macho" | "femea",
        current_weight_kg: form.current_weight_kg ? Number(form.current_weight_kg) : null,
        lot: form.lot || null,
        origin: form.origin || null,
        notes: form.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Animal cadastrado"); qc.invalidateQueries({ queryKey: ["animals", farmId] }); onDone(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Brinco *</Label><Input required value={form.tag} onChange={set("tag")} /></div>
        <div>
          <Label>Sexo</Label>
          <Select value={form.sex} onValueChange={(v) => setForm((f) => ({ ...f, sex: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="macho">Macho</SelectItem><SelectItem value="femea">Fêmea</SelectItem></SelectContent>
          </Select>
        </div>
        <div><Label>Raça</Label><Input value={form.breed} onChange={set("breed")} placeholder="Nelore, Angus..." /></div>
        <div><Label>Peso (kg)</Label><Input type="number" step="0.1" value={form.current_weight_kg} onChange={set("current_weight_kg")} /></div>
        <div><Label>Lote</Label><Input value={form.lot} onChange={set("lot")} placeholder="L-01" /></div>
        <div><Label>Origem</Label><Input value={form.origin} onChange={set("origin")} placeholder="Compra, nascimento..." /></div>
      </div>
      <Button type="submit" disabled={m.isPending} className="w-full rounded-full bg-agro text-agro-foreground hover:bg-agro/90">
        {m.isPending ? "Salvando..." : "Cadastrar animal"}
      </Button>
    </form>
  );
}