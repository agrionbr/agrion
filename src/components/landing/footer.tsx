import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            AGRION — Gestão inteligente para pecuária e grãos. Feito no Brasil, para o produtor brasileiro.
          </p>
        </div>
        <div>
          <h5 className="font-display text-sm font-semibold">Produto</h5>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="#beneficios" className="hover:text-foreground">Benefícios</a></li>
            <li><a href="#produto" className="hover:text-foreground">Demo</a></li>
            <li><a href="#planos" className="hover:text-foreground">Planos</a></li>
          </ul>
        </div>
        <div>
          <h5 className="font-display text-sm font-semibold">Contato</h5>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>contato@agrion.com.br</li>
            <li>(11) 4000-0000</li>
            <li>São Paulo · Brasil</li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-border px-4 pt-6 text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} AGRION. Todos os direitos reservados.
      </div>
    </footer>
  );
}