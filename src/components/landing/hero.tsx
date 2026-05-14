import { Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Sparkles, Beef, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-cattle.jpg";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-agro/20 bg-agro-soft px-3 py-1 text-xs font-medium text-agro">
            <Sparkles className="h-3.5 w-3.5" />
            Novo · IA preditiva para pecuária e grãos
          </div>
          <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Sua fazenda inteira em{" "}
            <span className="text-gradient-agro">um só sistema</span>.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            AGRION é a plataforma que une <strong>pecuária</strong> e <strong>grãos</strong> em um só lugar:
            rebanho, pesagem, sanidade, talhões, safras, colheita e financeiro.
            Decisões mais rápidas, menos prejuízo e mais lucro por hectare e por cabeça.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-agro/20 bg-agro-soft px-3 py-1 text-xs font-semibold text-agro">
              <Beef className="h-3.5 w-3.5" /> Pecuária
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-agro/20 bg-agro-soft px-3 py-1 text-xs font-semibold text-agro">
              <Sprout className="h-3.5 w-3.5" /> Grãos
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold text-foreground/70">
              Fazenda mista
            </span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full bg-agro px-6 text-agro-foreground hover:bg-agro/90">
              <Link to="/login">
                Começar teste grátis <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <a href="#produto">Ver produto</a>
            </Button>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-agro" />
            14 dias grátis · sem cartão · cancele quando quiser
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-agro/30 to-transparent blur-2xl" />
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
            <img
              src={heroImg}
              alt="Rebanho bovino em pasto verde"
              width={1600}
              height={1100}
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2 rounded-2xl border border-white/20 bg-black/40 p-3 text-white backdrop-blur-md sm:bottom-6 sm:left-6 sm:right-6">
              <Stat label="Animais" value="1.284" />
              <Stat label="Hectares" value="2.150" />
              <Stat label="Lucro/ha" value="R$ 1.4k" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-base font-bold sm:text-lg">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-white/70 sm:text-xs">{label}</div>
    </div>
  );
}