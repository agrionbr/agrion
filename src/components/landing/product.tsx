import { DashboardPreview } from "@/components/dashboard/dashboard-preview";

export function Product() {
  return (
    <section id="produto" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-agro">Produto</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">
            Decisões mais rápidas, com dados claros.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Dashboards modernos, gráficos interativos e indicadores que importam.
            Funciona perfeito no celular, no escritório e no curral.
          </p>
        </div>

        <div className="relative mt-14">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-agro/20 via-transparent to-agro/10 blur-2xl" />
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}