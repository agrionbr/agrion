import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";

export function AuthShell({ title, subtitle, children, footer }: {
  title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-sidebar text-sidebar-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link to="/"><Logo className="text-sidebar-foreground" /></Link>
        <div>
          <h2 className="font-display text-4xl font-extrabold leading-tight">
            Controle sua pecuária com{" "}
            <span className="text-agro">inteligência</span>.
          </h2>
          <p className="mt-3 text-sidebar-foreground/70">
            Tudo da sua fazenda em um só lugar: rebanho, pesagem, sanidade e financeiro.
          </p>
        </div>
        <p className="text-xs text-sidebar-foreground/50">© AGRION · Feito no Brasil</p>
      </div>
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="lg:hidden"><Logo /></Link>
          <h1 className="mt-8 font-display text-3xl font-bold">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-sm text-muted-foreground">{footer}</div>}
        </div>
      </div>
    </div>
  );
}