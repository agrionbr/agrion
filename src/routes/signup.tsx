import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Criar conta — AGRION" }] }),
  component: SignupPage,
});

const schema = z.object({
  full_name: z.string().trim().min(2).max(120),
  farm_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
});

function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ full_name: "", farm_name: "", email: "", password: "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    const { error } = await signUp(parsed.data.email, parsed.data.password, {
      full_name: parsed.data.full_name,
      farm_name: parsed.data.farm_name,
    });
    setLoading(false);
    if (error) return toast.error(error);
    toast.success("Conta criada! Verifique seu e-mail para confirmar.");
    navigate({ to: "/login" });
  };

  return (
    <AuthShell
      title="Crie sua conta grátis"
      subtitle="14 dias grátis. Sem cartão."
      footer={<>Já tem conta? <Link to="/login" className="font-semibold text-agro hover:underline">Entrar</Link></>}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Seu nome</Label>
          <Input id="name" required value={form.full_name} onChange={set("full_name")} />
        </div>
        <div>
          <Label htmlFor="farm">Nome da fazenda</Label>
          <Input id="farm" required value={form.farm_name} onChange={set("farm_name")} />
        </div>
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" required value={form.email} onChange={set("email")} />
        </div>
        <div>
          <Label htmlFor="pwd">Senha (mín. 6 caracteres)</Label>
          <Input id="pwd" type="password" required minLength={6} value={form.password} onChange={set("password")} />
        </div>
        <Button type="submit" disabled={loading} className="w-full rounded-full bg-agro text-agro-foreground hover:bg-agro/90">
          {loading ? "Criando..." : "Criar minha conta"}
        </Button>
      </form>
    </AuthShell>
  );
}