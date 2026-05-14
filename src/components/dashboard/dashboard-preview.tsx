import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { ArrowDownRight, ArrowUpRight, Beef, Bell, Scale, Wallet } from "lucide-react";

const revenue = [
  { m: "Jan", receita: 42, custo: 28 },
  { m: "Fev", receita: 48, custo: 30 },
  { m: "Mar", receita: 55, custo: 33 },
  { m: "Abr", receita: 51, custo: 31 },
  { m: "Mai", receita: 63, custo: 36 },
  { m: "Jun", receita: 71, custo: 38 },
  { m: "Jul", receita: 78, custo: 40 },
];

const gmd = [
  { lote: "L-01", v: 0.82 },
  { lote: "L-02", v: 0.91 },
  { lote: "L-03", v: 1.04 },
  { lote: "L-04", v: 0.74 },
  { lote: "L-05", v: 0.96 },
  { lote: "L-06", v: 1.11 },
];

export function DashboardPreview() {
  return (
    <div className="bg-background p-4 sm:p-6">
      {/* fake browser bar */}
      <div className="mb-4 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-chart-4" />
        <span className="h-2.5 w-2.5 rounded-full bg-agro" />
        <div className="ml-3 hidden flex-1 truncate rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground sm:block">
          app.agrion.com.br/dashboard
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Beef} label="Animais" value="1.284" delta="+24" up />
        <Kpi icon={Scale} label="GMD médio" value="0,92 kg" delta="+6%" up />
        <Kpi icon={Wallet} label="Lucro estimado" value="R$ 624 mil" delta="+12%" up />
        <Kpi icon={Bell} label="Alertas" value="7" delta="-3" up={false} />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h4 className="font-display text-sm font-semibold">Fluxo financeiro</h4>
              <p className="text-xs text-muted-foreground">Últimos 7 meses</p>
            </div>
            <span className="rounded-full bg-agro-soft px-2 py-0.5 text-xs font-medium text-agro">+18% vs ano anterior</span>
          </div>
          <div className="h-52">
            <ResponsiveContainer>
              <AreaChart data={revenue} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.62 0.18 142)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.62 0.18 142)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 140)" />
                <XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 12 }} />
                <Area type="monotone" dataKey="receita" stroke="oklch(0.62 0.18 142)" strokeWidth={2.5} fill="url(#g1)" />
                <Area type="monotone" dataKey="custo" stroke="oklch(0.55 0.04 150)" strokeWidth={2} fill="transparent" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <h4 className="font-display text-sm font-semibold">GMD por lote (kg/dia)</h4>
          <p className="text-xs text-muted-foreground">Comparativo</p>
          <div className="h-52">
            <ResponsiveContainer>
              <BarChart data={gmd} margin={{ top: 12, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 140)" vertical={false} />
                <XAxis dataKey="lote" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 12 }} />
                <Bar dataKey="v" fill="oklch(0.62 0.18 142)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  icon: Icon, label, value, delta, up,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; delta: string; up: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-agro-soft text-agro">
          <Icon className="h-4 w-4" />
        </span>
        <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${up ? "text-agro" : "text-destructive"}`}>
          {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {delta}
        </span>
      </div>
      <div className="mt-3 font-display text-2xl font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}