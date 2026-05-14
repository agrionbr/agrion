import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

const links = [
  { href: "#beneficios", label: "Benefícios" },
  { href: "#produto", label: "Produto" },
  { href: "#planos", label: "Planos" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline">
            Entrar
          </Link>
          <Button asChild size="sm" className="rounded-full bg-agro text-agro-foreground hover:bg-agro/90">
            <Link to="/login">Teste grátis</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}