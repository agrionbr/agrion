import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, Plus, Trash2, CheckCircle2, Circle, XCircle } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/app/tasks" as never)({
  component: TasksPage,
}) as never;

type Status = "pendente" | "concluida" | "cancelada";
type Task = { id: string; title: string; description: string | null; due_date: string | null; status: Status; notes: string | null };

function TasksPage() {
  const { farm } = useCurrentFarm();
  const farmId = farm?.id;
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"todas" | Status>("todas");

  const { data, isLoading } = useQuery({
    queryKey: ["tasks", farmId],
    enabled: !!farmId,
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*").eq("farm_id", farmId!).order("due_date", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data as Task[];
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      const patch: Partial<Task> & { completed_at?: string | null } = { status };
      (patch as { completed_at?: string | null }).completed_at = status === "concluida" ? new Date().toISOString() : null;
      const { error } = await supabase.from("tasks").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", farmId] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Tarefa removida"); qc.invalidateQueries({ queryKey: ["tasks", farmId] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const tasks = (data ?? []).filter((t) => filter === "todas" || t.status === filter);
  const counts = {
    todas: data?.length ?? 0,
    pendente: data?.filter((t) => t.status === "pendente").length ?? 0,
    concluida: data?.filter((t) => t.status === "concluida").length ?? 0,
    cancelada: data?.filter((t) => t.status === "cancelada").length ?? 0,
  };

  return (
    <div>
      <PageHeader
        title="Tarefas"
        subtitle={`${counts.pendente} pendentes · ${counts.concluida} concluídas`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-agro text-agro-foreground hover:bg-agro/90"><Plus className="mr-2 h-4 w-4" /> Nova tarefa</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nova tarefa</DialogTitle></DialogHeader>
              <TaskForm farmId={farmId!} onDone={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {(["todas", "pendente", "concluida", "cancelada"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${filter === k ? "bg-agro text-agro-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/70"}`}
          >
            {k === "todas" ? "Todas" : k === "pendente" ? "Pendentes" : k === "concluida" ? "Concluídas" : "Canceladas"} ({counts[k]})
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Carregando...</div>
      ) : !tasks.length ? (
        <EmptyState icon={ClipboardList} title="Sem tarefas" description="Crie tarefas para organizar a equipe." action={<Button onClick={() => setOpen(true)} className="rounded-full bg-agro text-agro-foreground hover:bg-agro/90"><Plus className="mr-2 h-4 w-4" /> Nova tarefa</Button>} />
      ) : (
        <div className="space-y-2">
          {tasks.map((t) => {
            const overdue = t.status === "pendente" && t.due_date && new Date(t.due_date) < new Date(new Date().toDateString());
            return (
              <div key={t.id} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
                <button
                  onClick={() => setStatus.mutate({ id: t.id, status: t.status === "concluida" ? "pendente" : "concluida" })}
                  className="mt-0.5 text-agro"
                  aria-label="Alternar status"
                >
                  {t.status === "concluida" ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`font-medium ${t.status === "concluida" ? "line-through text-muted-foreground" : ""}`}>{t.title}</span>
                    {t.status === "cancelada" && <Badge variant="secondary">Cancelada</Badge>}
                    {overdue && <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/10">Atrasada</Badge>}
                  </div>
                  {t.description && <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>}
                  {t.due_date && <p className="mt-1 text-xs text-muted-foreground">Vence em {fmtDate(t.due_date)}</p>}
                </div>
                <div className="flex gap-1">
                  {t.status !== "cancelada" && (
                    <Button size="icon" variant="ghost" title="Cancelar" onClick={() => setStatus.mutate({ id: t.id, status: "cancelada" })}>
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" onClick={() => confirm("Remover tarefa?") && del.mutate(t.id)}>
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

function TaskForm({ farmId, onDone }: { farmId: string; onDone: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: "", description: "", due_date: "" });
  const m = useMutation({
    mutationFn: async () => {
      if (!form.title.trim()) throw new Error("Título obrigatório");
      const { error } = await supabase.from("tasks").insert({
        farm_id: farmId,
        title: form.title.trim(),
        description: form.description || null,
        due_date: form.due_date || null,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Tarefa criada"); qc.invalidateQueries({ queryKey: ["tasks", farmId] }); onDone(); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="space-y-3">
      <div><Label>Título *</Label><Input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
      <div><Label>Descrição</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
      <div><Label>Vencimento</Label><Input type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} /></div>
      <Button type="submit" disabled={m.isPending} className="w-full rounded-full bg-agro text-agro-foreground hover:bg-agro/90">
        {m.isPending ? "Salvando..." : "Criar tarefa"}
      </Button>
    </form>
  );
}