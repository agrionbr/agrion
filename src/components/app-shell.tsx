import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Beef, Scale, Syringe, Wallet,
  ClipboardList, Bell, FileText, Settings, LogOut, Menu, X,
  Sprout, Map as MapIcon, FlaskConical, Wheat, ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentFarm } from "@/hooks/use-current-farm";
import { SegmentProvider, useSegment } from "@/hooks/use-segment";
import { useIsAdmin } from "@/hooks/use-is-admin";
import type { FarmSegment } from "@/hooks/use-current-farm";

type NavItem = {
  to: string; label: string; icon: typeof LayoutDashboard;
  exact?: boolean; segments?: FarmSegment[]; // undefined = always show
};
const nav: NavItem[] = [
  { to: "/app", label: "Visão geral", icon: LayoutDashboard, exact: true },
  // Pecuária
  { to: "/app/animals", label: "Rebanho", icon: Beef, segments: ["pecuaria"] },
  { to: "/app/weighings", label: "Pesagem", icon: Scale, segments: ["pecuaria"] },
  { to: "/app/health", label: "Sanidade", icon: Syringe, segments: ["pecuaria"] },
  // Grãos
  { to: "/app/plots", label: "Talhões", icon: MapIcon, segments: ["graos"] },
  { to: "/app/seasons", label: "Safras", icon: Sprout, segments: ["graos"] },
  { to: "/app/applications", label: "Aplicações", icon: FlaskConical, segments: ["graos"] },
  { to: "/app/harvests", label: "Colheita", icon: Wheat, segments: ["graos"] },
  // Compartilhados
  { to: "/app/finance", label: "Financeiro", icon: Wallet },
  { to: "/app/tasks", label: "Tarefas", icon: ClipboardList },
  { to: "/app/alerts", label: "Alertas", icon: Bell },
  { to: "/app/reports", label: "Relatórios", icon: FileText },
  { to: "/app/settings", label: "Configurações", icon: Settings },
];

export function AppShell() {
  return (
    <SegmentProvider>
      <ShellInner />
    </SegmentProvider>
  );
}

function ShellInner() {
  const { user, signOut } = useAuth();
  const { farm } = useCurrentFarm();
  const { segment, setSegment, available } = useSegment();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const onLogout = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  const visibleNav = nav.filter((n) => !n.segments || n.segments.includes(segment));
  const fullNav = isAdmin
    ? [...visibleNav, { to: "/app/admin", label: "Admin", icon: ShieldCheck } as NavItem]
    : visibleNav;

  const SegmentSwitcher = () => {
    if (available.length < 2) return null;
    return (
      <div className="mx-3 mb-2 flex rounded-full bg-sidebar-accent/40 p-1 text-xs">
        {available.map((s) => (
          <button
            key={s}
            onClick={() => setSegment(s)}
            className={`flex-1 rounded-full px-3 py-1.5 font-medium capitalize transition ${
              segment === s ? "bg-agro text-agro-foreground shadow" : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
            }`}
          >
            {s === "pecuaria" ? "🐄 Pecuária" : "🌾 Grãos"}
          </button>
        ))}
      </div>
    );
  };

  const SideNav = () => (
    <nav className="flex-1 space-y-1 overflow-y-auto p-3">
      {fullNav.map(({ to, label, icon: Icon, exact }) => {
        const active = exact ? location.pathname === to : location.pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to as never}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-agro text-agro-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-secondary/40">
      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-sidebar text-sidebar-foreground" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-sidebar-border p-4">
              <Logo className="text-sidebar-foreground" />
              <button onClick={() => setOpen(false)} className="text-sidebar-foreground/70"><X className="h-5 w-5" /></button>
            </div>
            <SideNav />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <div className="border-b border-sidebar-border p-5">
          <Logo className="text-sidebar-foreground" />
          {farm && <p className="mt-2 truncate text-xs text-sidebar-foreground/60">🌾 {farm.name}</p>}
        </div>
        <div className="pt-3"><SegmentSwitcher /></div>
        <SideNav />
        <div className="border-t border-sidebar-border p-3">
          <div className="mb-2 px-2 text-xs text-sidebar-foreground/60 truncate">{user?.email}</div>
          <button onClick={onLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent">
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(true)} aria-label="Abrir menu"><Menu className="h-5 w-5" /></button>
          <div className="flex items-center gap-2">
            <Logo />
            {available.length >= 2 && (
              <button
                onClick={() => setSegment(segment === "pecuaria" ? "graos" : "pecuaria")}
                className="rounded-full bg-agro-soft px-2 py-1 text-xs font-medium text-agro"
              >
                {segment === "pecuaria" ? "🐄" : "🌾"}
              </button>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onLogout}><LogOut className="h-4 w-4" /></Button>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}