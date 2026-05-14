import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Cta() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] border border-agro/30 bg-sidebar p-10 text-sidebar-foreground shadow-2xl sm:p-14">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-agro/30 blur-3xl" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Pronto para lucrar mais por animal e por hectare?
            </h2>
            <p className="mt-3 max-w-xl text-sidebar-foreground/70">
              Teste o AGRION por 14 dias, sem cartão. Cadastre rebanho, talhões e safras
              em minutos e descubra exatamente onde está seu dinheiro.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full bg-agro text-agro-foreground hover:bg-agro/90">
                <Link to="/login">Começar grátis <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent">
                <a href="#planos">Ver planos</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}