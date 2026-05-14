import {
  Beef, Scale, Syringe, Wallet, Bell, ClipboardList,
  TrendingUp, Users, BarChart3, Sprout, Map as MapIcon, FlaskConical, Wheat,
} from "lucide-react";

const pecuaria = [
  { icon: Beef, title: "Rebanho", desc: "Cadastro completo, lotes, fotos e histórico de cada animal." },
  { icon: Scale, title: "Pesagem & GMD", desc: "Registre pesagens, ranking automático e alerta de baixo desempenho." },
  { icon: Syringe, title: "Sanidade", desc: "Calendário de vacinas, medicamentos e notificações automáticas." },
];
const graos = [
  { icon: MapIcon, title: "Talhões", desc: "Cadastro de áreas com hectares, cultura e tipo de solo." },
  { icon: Sprout, title: "Safras", desc: "Plantio, acompanhamento e ciclo completo por safra." },
  { icon: FlaskConical, title: "Insumos & Aplicações", desc: "Fertilizantes, defensivos e sementes com custo por talhão." },
  { icon: Wheat, title: "Colheita", desc: "Sacas/ha, umidade, peso e produtividade real." },
];
const compartilhados = [
  { icon: Wallet, title: "Financeiro", desc: "Receitas, despesas, custo por animal e por hectare. DRE simplificada." },
  { icon: Bell, title: "Alertas inteligentes", desc: "Avisos de prejuízo, atraso de manejo, queda de peso e janelas de aplicação." },
  { icon: ClipboardList, title: "Tarefas da equipe", desc: "Checklist com foto e conferência em tempo real, no celular." },
  { icon: TrendingUp, title: "Lucratividade", desc: "Análise de rentabilidade por lote, talhão e safra." },
  { icon: Users, title: "Multiusuário", desc: "Várias fazendas, equipes e permissões granulares." },
  { icon: BarChart3, title: "Relatórios", desc: "Exporte PDF e Excel prontos para reunião e banco." },
];

export function Features() {
  return (
    <section id="beneficios" className="border-t border-border bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-agro">Pecuária + Grãos</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">
            Um sistema para os dois lados da fazenda.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Ative só pecuária, só grãos ou os dois ao mesmo tempo. A interface se adapta automaticamente
            ao seu segmento, com linguagem simples e foco no que gera resultado.
          </p>
        </div>

        <Block label="🐄 Para a Pecuária" items={pecuaria} />
        <Block label="🌾 Para os Grãos" items={graos} />
        <Block label="⚙️ Para toda a fazenda" items={compartilhados} />
      </div>
    </section>
  );
}

function Block({ label, items }: { label: string; items: { icon: typeof Beef; title: string; desc: string }[] }) {
  return (
    <div className="mt-12">
      <h3 className="font-display text-lg font-bold text-foreground">{label}</h3>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-agro/40 hover:shadow-lg"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-agro-soft text-agro transition-colors group-hover:bg-agro group-hover:text-agro-foreground">
              <Icon className="h-5 w-5" />
            </div>
            <h4 className="mt-5 font-display text-lg font-semibold text-foreground">{title}</h4>
            <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}