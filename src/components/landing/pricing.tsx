import { Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Pequeno",
    price: "R$ 89",
    desc: "Até 200 cabeças ou 200 ha",
    features: ["Pecuária OU Grãos", "Cadastros essenciais", "1 usuário", "Suporte por e-mail"],
  },
  {
    name: "Profissional",
    price: "R$ 199",
    desc: "Até 1.500 cabeças ou 1.500 ha",
    features: ["Pecuária + Grãos (fazenda mista)", "Financeiro completo", "Tarefas da equipe", "5 usuários", "Relatórios PDF/Excel"],
    highlight: true,
  },
  {
    name: "Fazenda+",
    price: "Sob consulta",
    desc: "Rebanho e área ilimitados",
    features: ["Múltiplas fazendas", "IA preditiva", "Integração RFID/balança/clima", "Usuários ilimitados", "Suporte dedicado"],
  },
];

export function Pricing() {
  return (
    <section id="planos" className="border-t border-border bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-agro">Planos</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            Comece grátis. Cresça com a fazenda.
          </h2>
          <p className="mt-4 text-muted-foreground">14 dias grátis em qualquer plano. Sem cartão de crédito.</p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-3xl border p-7 transition-all ${
                p.highlight
                  ? "border-agro bg-card shadow-xl ring-1 ring-agro/30"
                  : "border-border bg-card"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-7 rounded-full bg-agro px-3 py-0.5 text-xs font-semibold text-agro-foreground">
                  Mais popular
                </span>
              )}
              <h3 className="font-display text-xl font-bold">{p.name}</h3>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-display text-4xl font-extrabold">{p.price}</span>
                {p.price.startsWith("R$") && <span className="text-sm text-muted-foreground">/mês</span>}
              </div>
              <Button
                asChild
                className={`mt-6 w-full rounded-full ${
                  p.highlight ? "bg-agro text-agro-foreground hover:bg-agro/90" : ""
                }`}
                variant={p.highlight ? "default" : "outline"}
              >
                <Link to="/login">Começar agora</Link>
              </Button>
              <ul className="mt-6 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-agro" />
                    <span className="text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}