import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { ArrowUpRight, Beef, Bell, Scale, Wallet, Sprout, Map as MapIcon, Wheat } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentFarm } from "@/hooks/use-current-farm";
import { useSegment } from "@/hooks/use-segment";
import { PageHeader } from "@/components/page-header";
import { fmtBRL, fmtNum } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/app/" as never)({
  component: Dashboard,
}) as never;

function Dashboard() {
  const { farm } = useCurrentFarm();
  const { segment } = useSegment();
  const farmId = farm?.id;

  const { data } = useQuery({
    queryKey: ["dashboard", farmId, segment],
    enabled: !!farmId,
    queryFn: async () => {
      const [animals, weighings, txs, alerts, plots, harvests, seasons] = await Promise.all([
        supabase.from("animals").select("id,current_weight_kg,status").eq("farm_id", farmId!),
        supabase.from("weighings").select("weight_kg,weighed_at,animal_id").eq("farm_id", farmId!).order("weighed_at"),
        supabase.from("transactions").select("kind,amount,occurred_at").eq("farm_id", farmId!).order("occurred_at"),
        supabase.from("alerts").select("id,read").eq("farm_id", farmId!),
        supabase.from("plots").select("id,area_ha").eq("farm_id", farmId!),
        supabase.from("harvests").select("bags,bag_weight_kg,harvested_at,area_ha").eq("farm_id", farmId!).order("harvested_at"),
        supabase.from("crop_seasons").select("id,status").eq("farm_id", farmId!),
      ]);
      return {
        animals: animals.data ?? [],
        weighings: weighings.data ?? [],
        txs: txs.data ?? [],
        alerts: alerts.data ?? [],
        plots: plots.data ?? [],
        harvests: harvests.data ?? [],
        seasons: seasons.data ?? [],
      };
    },
  });

  const total = data?.animals.filter((a) => a.status === "ativo").length ?? 0;
  const receita = (data?.txs ?? []).filter((t) => t.kind === "receita").reduce((s, t) => s + Number(t.amount), 0);
  const despesa = (data?.txs ?? []).filter((t) => t.kind === "despesa").reduce((s, t) => s + Number(t.amount), 0);
  const lucro = receita - despesa;
  const alertasAbertos = (data?.alerts ?? []).filter((a) => !a.read).length;
  const avgWeight = total > 0
    ? (data?.animals ?? []).reduce((s, a) => s + Number(a.current_weight_kg ?? 0), 0) / total
    : 0;

  // Grãos
  const totalHa = (data?.plots ?? []).reduce((s, p) => s + Number(p.area_ha ?? 0), 0);
  const totalBags = (data?.harvests ?? []).reduce((s, h) => s + Number(h.bags), 0);
  const totalTon = (data?.harvests ?? []).reduce((s, h) => s + (Number(h.bags) * Number(h.bag_weight_kg)) / 1000, 0);
  const activeSeasons = (data?.seasons ?? []).filter((s) => s.status !== "encerrado" && s.status !== "colhido").length;

  // monthly aggregation
  const byMonth = new Map<string, { m: string; receita: number; custo: number }>();
  for (const t of data?.txs ?? []) {
    const m = new Date(t.occurred_at).toLocaleDateString("pt-BR", { month: "short" });
    const r = byMonth.get(m) ?? { m, receita: 0, custo: 0 };
    if (t.kind === "receita") r.receita += Number(t.amount);
    else r.custo += Number(t.amount);
    byMonth.set(m, r);
  }
  const chart = Array.from(byMonth.values());

  return (
    <div>
      <PageHeader
        title={`Olá! Aqui está sua fazenda${farm ? ` · ${farm.name}` : ""}`}
        subtitle={segment === "graos" ? "Visão de Grãos · últimos registros" : "Visão de Pecuária · últimos 30 dias"}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {segment === "pecuaria" ? (
          <>
            <Kpi icon={Beef} label="Animais ativos" value={fmtNum(total)} />
            <Kpi icon={Scale} label="Peso médio" value={`${fmtNum(avgWeight, 1)} kg`} />
            <Kpi icon={Wallet} label="Lucro estimado" value={fmtBRL(lucro)} positive={lucro >= 0} />
            <Kpi icon={Bell} label="Alertas abertos" value={fmtNum(alertasAbertos)} />
          </>
        ) : (
          <>
            <Kpi icon={MapIcon} label="Área total" value={`${fmtNum(totalHa, 1)} ha`} />
            <Kpi icon={Sprout} label="Safras ativas" value={fmtNum(activeSeasons)} />
            <Kpi icon={Wheat} label="Colhido" value={`${fmtNum(totalBags)} sc · ${fmtNum(totalTon, 1)} t`} />
            <Kpi icon={Wallet} label="Lucro estimado" value={fmtBRL(lucro)} positive={lucro >= 0} />
          </>
        )}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-semibold">Fluxo financeiro</h3>
              <p className="text-xs text-muted-foreground">Receita vs. custo</p>
            </div>
            <Link to={"/app/finance" as never} className="text-xs text-agro hover:underline">Ver tudo →</Link>
          </div>
          <div className="h-64">
            {chart.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer>
                <AreaChart data={chart} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                  <defs>
                    <linearGradient id="ag" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.62 0.18 142)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="oklch(0.62 0.18 142)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 140)" />
                  <XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Area type="monotone" dataKey="receita" stroke="oklch(0.62 0.18 142)" strokeWidth={2.5} fill="url(#ag)" />
                  <Area type="monotone" dataKey="custo" stroke="oklch(0.55 0.04 150)" strokeWidth={2} fill="transparent" strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-display text-base font-semibold">
            {segment === "graos" ? "Colheitas recentes" : "Pesagens recentes"}
          </h3>
          <p className="text-xs text-muted-foreground">Últimos registros</p>
          <div className="mt-3 h-64">
            {segment === "graos" ? (
              !data?.harvests.length ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer>
                  <BarChart data={data.harvests.slice(-8).map((h) => ({ d: new Date(h.harvested_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), v: Number(h.bags) }))} margin={{ top: 12, right: 8, bottom: 0, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 140)" vertical={false} />
                    <XAxis dataKey="d" tickLine={false} axisLine={false} fontSize={11} />
                    <YAxis tickLine={false} axisLine={false} fontSize={11} />
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                    <Bar dataKey="v" fill="oklch(0.62 0.18 142)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )
            ) : !data?.weighings.length ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer>
                <BarChart data={data.weighings.slice(-8).map((w) => ({ d: new Date(w.weighed_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), v: Number(w.weight_kg) }))} margin={{ top: 12, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 140)" vertical={false} />
                <XAxis dataKey="d" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="v" fill="oklch(0.62 0.18 142)" radius={[6, 6, 0, 0]} />
              </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, positive = true }: {
  icon: typeof Beef; label: string; value: string; positive?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-agro-soft text-agro">
          <Icon className="h-4 w-4" />
        </span>
        <ArrowUpRight className={`h-4 w-4 ${positive ? "text-agro" : "text-destructive"}`} />
      </div>
      <div className="mt-3 font-display text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="grid h-full place-items-center rounded-xl bg-secondary text-xs text-muted-foreground">
      Sem dados ainda — comece registrando.
    </div>
  );
}