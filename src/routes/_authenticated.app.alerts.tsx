import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Plus, Trash2, AlertTriangle, AlertCircle, Info, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentFarm } from "@/hooks/use-current-farm";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/app/alerts" as never)({
  component: AlertsPage,
}) as never;

type Severity = "info" | "aviso" | "critico";
type Alert = { id: string; title: string; message: string | null; severity: Severity; read: boolean; created_at: string };

const sevMeta: Record<Severity, { label: string; icon: typeof Info; classes: string }> = {
  info: { label: "Info", icon: Info, classes: "bg-secondary text-foreground" },
  aviso: { label: "Aviso", icon: AlertTriangle, classes: "bg-amber-500/10 text-amber-600" },
  critico: { label: "Crítico", icon: AlertCircle, classes: "bg-destructive/10 text-destructive" },
};

function AlertsPage() {
  const { farm } = useCurrentFarm();
  const farmId = farm?.id;
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["alerts", farmId],
    enabled: !!farmId,
    queryFn: async () => {
      const { data, error } = await supabase.from("alerts").select("*").eq("farm_id", farmId!).order("created_at", { ascending: false });
      if (error) throw error;
      return data as Alert[];
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ id, read }: { id: string; read: boolean }) => {
      const { error } = await supabase.from("alerts").update({ read }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts", farmId] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("alerts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Alerta removido"); qc.invalidateQueries({ queryKey: ["alerts", farmId] }); },
  });

  const markAll = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("alerts").update({ read: true }).eq("farm_id", farmId!).eq("read", false);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Todos marcados como lidos"); qc.invalidateQueries({ queryKey: ["alerts", farmId] }); },
  });

  const alerts = data ?? [];
  const unread = alerts.filter((a) => !a.read).length;

  return (
    <div>
      <PageHeader
        title="Alertas"
        subtitle={`${unread} não lido${unread === 1 ? "" : "s"} de ${alerts.length}`}
        actions={
          <div className="flex gap-2">
            {unread > 0 && (
              <Button variant="outline" className="rounded-full" onClick={() => markAll.mutate()}>
                <Check className="mr-2 h-4 w-4" /> Marcar todos
              </Button>
            )}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full bg-agro text-agro-foreground hover:bg-agro/90"><Plus className="mr-2 h-4 w-4" /> Novo alerta</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Novo alerta</DialogTitle></DialogHeader>
                <AlertForm farmId={farmId!} onDone={() => setOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Carregando...</div>
      ) : !alerts.length ? (
        <EmptyState icon={Bell} title="Sem alertas" description="Crie alertas para acompanhar eventos da fazenda." />
      ) : (
        <div className="space-y-2">
          {alerts.map((a) => {
            const meta = sevMeta[a.severity];
            const Icon = meta.icon;
            return (
              <div key={a.id} className={`flex items-start gap-3 rounded-2xl border bg-card p-4 ${a.read ? "border-border opacity-60" : "border-agro/30"}`}>
                <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${meta.classes}`}><Icon className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{a.title}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${meta.classes}`}>{meta.label}</span>
                    {!a.read && <span className="h-2 w-2 rounded-full bg-agro" />}
                  </div>
                  {a.message && <p className="mt-1 text-sm text-muted-foreground">{a.message}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">{fmtDate(a.created_at)}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" title={a.read ? "Marcar não lido" : "Marcar lido"} onClick={() => toggle.mutate({ id: a.id, read: !a.read })}>
                    <Check className={`h-4 w-4 ${a.read ? "text-muted-foreground" : "text-agro"}`} />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => confirm("Remover alerta?") && del.mutate(a.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AlertForm({ farmId, onDone }: { farmId: string; onDone: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: "", message: "", severity: "info" as Severity });
  const m = useMutation({
    mutationFn: async () => {
      if (!form.title.trim()) throw new Error("Título obrigatório");
      const { error } = await supabase.from("alerts").insert({
        farm_id: farmId, title: form.title.trim(), message: form.message || null, severity: form.severity,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Alerta criado"); qc.invalidateQueries({ queryKey: ["alerts", farmId] }); onDone(); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="space-y-3">
      <div><Label>Título *</Label><Input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
      <div>
        <Label>Severidade</Label>
        <Select value={form.severity} onValueChange={(v) => setForm((f) => ({ ...f, severity: v as Severity }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="aviso">Aviso</SelectItem>
            <SelectItem value="critico">Crítico</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div><Label>Mensagem</Label><Textarea rows={3} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} /></div>
      <Button type="submit" disabled={m.isPending} className="w-full rounded-full bg-agro text-agro-foreground hover:bg-agro/90">
        {m.isPending ? "Salvando..." : "Criar alerta"}
      </Button>
    </form>
  );
}