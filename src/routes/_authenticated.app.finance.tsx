import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Wallet, Plus, Trash2, TrendingUp, TrendingDown, Scale, Calendar, Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentFarm } from "@/hooks/use-current-farm";
import { useSegment } from "@/hooks/use-segment";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { fmtBRL, fmtDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/app/finance" as never)({
  component: FinancePage,
}) as never;

type Tx = {
  id: string; kind: "receita" | "despesa"; category: string;
  description: string | null; amount: number; occurred_at: string; lot: string | null;
};

const CATS_PEC = ["Venda de animais", "Ração", "Sanidade", "Mão de obra", "Manutenção", "Outros"];
const CATS_GR = ["Venda de grãos", "Sementes", "Fertilizantes", "Defensivos", "Combustível", "Mão de obra", "Manutenção", "Outros"];

type PeriodPreset = "30d" | "90d" | "ytd" | "12m" | "all" | "custom";

function getRange(preset: PeriodPreset, from: string, to: string): { from: string; to: string } {
  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const end = iso(today);
  if (preset === "custom") return { from, to };
  if (preset === "all") return { from: "1900-01-01", to: end };
  if (preset === "ytd") return { from: `${today.getFullYear()}-01-01`, to: end };
  const days = preset === "30d" ? 30 : preset === "90d" ? 90 : 365;
  const start = new Date(today); start.setDate(start.getDate() - days);
  return { from: iso(start), to: end };
}

function FinancePage() {
  const { farm } = useCurrentFarm();
  const { segment } = useSegment();
  const farmId = farm?.id;
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<PeriodPreset>("90d");
  const [customFrom, setCustomFrom] = useState(new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10));
  const [customTo, setCustomTo] = useState(new Date().toISOString().slice(0, 10));
  const range = getRange(preset, customFrom, customTo);

  const { data, isLoading } = useQuery({
    queryKey: ["transactions", farmId, range.from, range.to],
    enabled: !!farmId,
    queryFn: async () => {
      const { data, error } = await supabase.from("transactions").select("*")
        .eq("farm_id", farmId!)
        .gte("occurred_at", range.from)
        .lte("occurred_at", range.to)
        .order("occurred_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((t) => ({ ...t, amount: Number(t.amount) })) as Tx[];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Lançamento removido"); qc.invalidateQueries({ queryKey: ["transactions", farmId] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const txs = data ?? [];
  const receitas = txs.filter((t) => t.kind === "receita").reduce((s, t) => s + t.amount, 0);
  const despesas = txs.filter((t) => t.kind === "despesa").reduce((s, t) => s + t.amount, 0);
  const saldo = receitas - despesas;
  const margem = receitas > 0 ? (saldo / receitas) * 100 : 0;

  return (
    <div>
      <PageHeader
        title="Financeiro"
        subtitle="Receitas, despesas, DRE e fluxo de caixa"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-agro text-agro-foreground hover:bg-agro/90"><Plus className="mr-2 h-4 w-4" /> Novo lançamento</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo lançamento</DialogTitle></DialogHeader>
              <TxForm farmId={farmId!} segment={segment} onDone={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        }
      />

      <PeriodFilter preset={preset} setPreset={setPreset} from={customFrom} setFrom={setCustomFrom} to={customTo} setTo={setCustomTo} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={TrendingUp} label="Receitas" value={fmtBRL(receitas)} tone="positive" />
        <KpiCard icon={TrendingDown} label="Despesas" value={fmtBRL(despesas)} tone="negative" />
        <KpiCard icon={Scale} label="Resultado" value={fmtBRL(saldo)} tone={saldo >= 0 ? "positive" : "negative"} />
        <KpiCard icon={Scale} label="Margem" value={`${margem.toFixed(1)}%`} tone={margem >= 0 ? "positive" : "negative"} />
      </div>

      <Tabs defaultValue="ledger" className="w-full">
        <TabsList>
          <TabsTrigger value="ledger">Lançamentos</TabsTrigger>
          <TabsTrigger value="dre">DRE</TabsTrigger>
          <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
        </TabsList>

        <TabsContent value="ledger" className="mt-4">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Carregando...</div>
          ) : !txs.length ? (
            <EmptyState icon={Wallet} title="Sem lançamentos" description="Nenhum movimento no período selecionado." action={<Button onClick={() => setOpen(true)} className="rounded-full bg-agro text-agro-foreground hover:bg-agro/90"><Plus className="mr-2 h-4 w-4" /> Novo lançamento</Button>} />
          ) : (
            <LedgerTable txs={txs} onDelete={(id) => confirm("Remover lançamento?") && del.mutate(id)} />
          )}
        </TabsContent>

        <TabsContent value="dre" className="mt-4">
          <DreView txs={txs} />
        </TabsContent>

        <TabsContent value="cashflow" className="mt-4">
          <CashflowView txs={txs} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PeriodFilter({ preset, setPreset, from, setFrom, to, setTo }: {
  preset: PeriodPreset; setPreset: (p: PeriodPreset) => void;
  from: string; setFrom: (s: string) => void; to: string; setTo: (s: string) => void;
}) {
  const opts: { v: PeriodPreset; label: string }[] = [
    { v: "30d", label: "30 dias" },
    { v: "90d", label: "90 dias" },
    { v: "ytd", label: "Ano atual" },
    { v: "12m", label: "12 meses" },
    { v: "all", label: "Tudo" },
    { v: "custom", label: "Personalizado" },
  ];
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <span className="text-xs uppercase tracking-wide text-muted-foreground">Período:</span>
      <div className="flex flex-wrap gap-1">
        {opts.map((o) => (
          <Button key={o.v} size="sm" variant={preset === o.v ? "default" : "outline"} onClick={() => setPreset(o.v)} className={preset === o.v ? "rounded-full bg-agro text-agro-foreground hover:bg-agro/90" : "rounded-full"}>
            {o.label}
          </Button>
        ))}
      </div>
      {preset === "custom" && (
        <div className="ml-auto flex items-center gap-2">
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-8 w-auto" />
          <span className="text-xs text-muted-foreground">até</span>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-8 w-auto" />
        </div>
      )}
    </div>
  );
}

function LedgerTable({ txs, onDelete }: { txs: Tx[]; onDelete: (id: string) => void }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Data</th>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-left">Categoria</th>
              <th className="px-4 py-3 text-left">Descrição</th>
              <th className="px-4 py-3 text-right">Valor</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {txs.map((t) => (
              <tr key={t.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                <td className="px-4 py-3 text-muted-foreground">{fmtDate(t.occurred_at)}</td>
                <td className="px-4 py-3">
                  <Badge className={t.kind === "receita" ? "bg-agro-soft text-agro hover:bg-agro-soft" : "bg-destructive/10 text-destructive hover:bg-destructive/10"}>
                    {t.kind === "receita" ? "Receita" : "Despesa"}
                  </Badge>
                </td>
                <td className="px-4 py-3">{t.category}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.description ?? "—"}</td>
                <td className={`px-4 py-3 text-right font-medium ${t.kind === "receita" ? "text-agro" : "text-destructive"}`}>
                  {t.kind === "receita" ? "+" : "−"} {fmtBRL(t.amount)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button size="icon" variant="ghost" onClick={() => onDelete(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DreView({ txs }: { txs: Tx[] }) {
  const groups = useMemo(() => {
    const rec = new Map<string, number>();
    const desp = new Map<string, number>();
    for (const t of txs) {
      const map = t.kind === "receita" ? rec : desp;
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    }
    const sortMap = (m: Map<string, number>) => [...m.entries()].sort((a, b) => b[1] - a[1]);
    return { receitas: sortMap(rec), despesas: sortMap(desp) };
  }, [txs]);

  const totalRec = groups.receitas.reduce((s, [, v]) => s + v, 0);
  const totalDesp = groups.despesas.reduce((s, [, v]) => s + v, 0);
  const resultado = totalRec - totalDesp;

  const exportCsv = () => {
    const rows = [
      ["DRE Simplificada"],
      [""],
      ["RECEITAS"],
      ...groups.receitas.map(([k, v]) => [k, v.toFixed(2)]),
      ["Total Receitas", totalRec.toFixed(2)],
      [""],
      ["DESPESAS"],
      ...groups.despesas.map(([k, v]) => [k, v.toFixed(2)]),
      ["Total Despesas", totalDesp.toFixed(2)],
      [""],
      ["RESULTADO LÍQUIDO", resultado.toFixed(2)],
    ];
    const csv = rows.map((r) => r.join(";")).join("\n");
    const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `dre-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (!txs.length) return <EmptyState icon={Scale} title="Sem dados para a DRE" description="Cadastre lançamentos no período para gerar a DRE." />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={exportCsv} className="rounded-full"><Download className="mr-2 h-4 w-4" /> Exportar CSV</Button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-border bg-agro-soft/50"><td className="px-4 py-2 font-semibold uppercase text-xs tracking-wide text-agro">Receitas</td><td /></tr>
            {groups.receitas.map(([k, v]) => (
              <tr key={`r-${k}`} className="border-b border-border">
                <td className="px-4 py-2 pl-8 text-muted-foreground">{k}</td>
                <td className="px-4 py-2 text-right text-agro">{fmtBRL(v)}</td>
              </tr>
            ))}
            <tr className="border-b-2 border-border bg-secondary/30 font-semibold">
              <td className="px-4 py-2">Total de Receitas</td>
              <td className="px-4 py-2 text-right text-agro">{fmtBRL(totalRec)}</td>
            </tr>

            <tr className="border-b border-border bg-destructive/10"><td className="px-4 py-2 font-semibold uppercase text-xs tracking-wide text-destructive">Despesas</td><td /></tr>
            {groups.despesas.map(([k, v]) => (
              <tr key={`d-${k}`} className="border-b border-border">
                <td className="px-4 py-2 pl-8 text-muted-foreground">{k}</td>
                <td className="px-4 py-2 text-right text-destructive">{fmtBRL(v)}</td>
              </tr>
            ))}
            <tr className="border-b-2 border-border bg-secondary/30 font-semibold">
              <td className="px-4 py-2">Total de Despesas</td>
              <td className="px-4 py-2 text-right text-destructive">{fmtBRL(totalDesp)}</td>
            </tr>

            <tr className="bg-secondary/60">
              <td className="px-4 py-3 font-display text-base font-bold">Resultado Líquido</td>
              <td className={`px-4 py-3 text-right font-display text-base font-bold ${resultado >= 0 ? "text-agro" : "text-destructive"}`}>{fmtBRL(resultado)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CashflowView({ txs }: { txs: Tx[] }) {
  const monthly = useMemo(() => {
    const m = new Map<string, { rec: number; desp: number }>();
    for (const t of txs) {
      const key = t.occurred_at.slice(0, 7); // YYYY-MM
      const cur = m.get(key) ?? { rec: 0, desp: 0 };
      if (t.kind === "receita") cur.rec += t.amount; else cur.desp += t.amount;
      m.set(key, cur);
    }
    const arr = [...m.entries()].sort(([a], [b]) => a.localeCompare(b));
    let acc = 0;
    return arr.map(([k, v]) => {
      const saldo = v.rec - v.desp; acc += saldo;
      return { month: k, rec: v.rec, desp: v.desp, saldo, acc };
    });
  }, [txs]);

  if (!monthly.length) return <EmptyState icon={Wallet} title="Sem fluxo de caixa" description="Cadastre lançamentos no período." />;

  const max = Math.max(...monthly.map((m) => Math.max(m.rec, m.desp)), 1);
  const fmtMonth = (k: string) => {
    const [y, m] = k.split("-");
    return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">Movimentação mensal</h3>
        <div className="space-y-3">
          {monthly.map((m) => (
            <div key={m.month}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium">{fmtMonth(m.month)}</span>
                <span className={m.saldo >= 0 ? "text-agro" : "text-destructive"}>{fmtBRL(m.saldo)}</span>
              </div>
              <div className="flex h-6 gap-1">
                <div className="rounded bg-agro/80" style={{ width: `${(m.rec / max) * 50}%` }} title={`Receitas ${fmtBRL(m.rec)}`} />
                <div className="rounded bg-destructive/80" style={{ width: `${(m.desp / max) * 50}%` }} title={`Despesas ${fmtBRL(m.desp)}`} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-agro/80" /> Receitas</span>
          <span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-destructive/80" /> Despesas</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Mês</th>
              <th className="px-4 py-3 text-right">Entradas</th>
              <th className="px-4 py-3 text-right">Saídas</th>
              <th className="px-4 py-3 text-right">Saldo do mês</th>
              <th className="px-4 py-3 text-right">Saldo acumulado</th>
            </tr>
          </thead>
          <tbody>
            {monthly.map((m) => (
              <tr key={m.month} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{fmtMonth(m.month)}</td>
                <td className="px-4 py-3 text-right text-agro">{fmtBRL(m.rec)}</td>
                <td className="px-4 py-3 text-right text-destructive">{fmtBRL(m.desp)}</td>
                <td className={`px-4 py-3 text-right font-medium ${m.saldo >= 0 ? "text-agro" : "text-destructive"}`}>{fmtBRL(m.saldo)}</td>
                <td className={`px-4 py-3 text-right font-semibold ${m.acc >= 0 ? "text-agro" : "text-destructive"}`}>{fmtBRL(m.acc)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, tone }: { icon: typeof Wallet; label: string; value: string; tone: "positive" | "negative" }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
        <div className={`grid h-9 w-9 place-items-center rounded-xl ${tone === "positive" ? "bg-agro-soft text-agro" : "bg-destructive/10 text-destructive"}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className={`mt-2 font-display text-2xl font-bold ${tone === "positive" ? "text-agro" : "text-destructive"}`}>{value}</div>
    </div>
  );
}

function TxForm({ farmId, segment, onDone }: { farmId: string; segment: "pecuaria" | "graos"; onDone: () => void }) {
  const qc = useQueryClient();
  const cats = segment === "graos" ? CATS_GR : CATS_PEC;
  const [form, setForm] = useState({
    kind: "despesa" as "receita" | "despesa",
    category: cats[0],
    description: "",
    amount: "",
    occurred_at: new Date().toISOString().slice(0, 10),
  });

  const m = useMutation({
    mutationFn: async () => {
      const amt = Number(form.amount);
      if (!amt || amt <= 0) throw new Error("Valor inválido");
      const { error } = await supabase.from("transactions").insert({
        farm_id: farmId,
        kind: form.kind,
        category: form.category,
        description: form.description || null,
        amount: amt,
        occurred_at: form.occurred_at,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Lançamento criado"); qc.invalidateQueries({ queryKey: ["transactions", farmId] }); onDone(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Tipo</Label>
          <Select value={form.kind} onValueChange={(v) => setForm((f) => ({ ...f, kind: v as "receita" | "despesa" }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="receita">Receita</SelectItem><SelectItem value="despesa">Despesa</SelectItem></SelectContent>
          </Select>
        </div>
        <div>
          <Label>Categoria</Label>
          <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{cats.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Valor (R$) *</Label><Input required type="number" step="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} /></div>
        <div><Label>Data</Label><Input type="date" value={form.occurred_at} onChange={(e) => setForm((f) => ({ ...f, occurred_at: e.target.value }))} /></div>
      </div>
      <div><Label>Descrição</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
      <Button type="submit" disabled={m.isPending} className="w-full rounded-full bg-agro text-agro-foreground hover:bg-agro/90">
        {m.isPending ? "Salvando..." : "Salvar lançamento"}
      </Button>
    </form>
  );
}
