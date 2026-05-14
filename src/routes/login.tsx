import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — AGRION" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) return toast.error(error);
    toast.success("Bem-vindo de volta!");
    navigate({ to: "/app" });
  };

  return (
    <AuthShell
      title="Entrar na sua conta"
      subtitle="Acesse seu painel AGRION"
      footer={<>Ainda não tem conta? <Link to="/signup" className="font-semibold text-agro hover:underline">Criar conta grátis</Link></>}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="pwd">Senha</Label>
            <Link to="/reset-password" className="text-xs text-muted-foreground hover:text-foreground">Esqueci minha senha</Link>
          </div>
          <Input id="pwd" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" disabled={loading} className="w-full rounded-full bg-agro text-agro-foreground hover:bg-agro/90">
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </AuthShell>
  );
}