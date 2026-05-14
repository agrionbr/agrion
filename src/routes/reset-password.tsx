import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Redefinir senha — AGRION" }] }),
  component: ResetPage,
});

function ResetPage() {
  const { resetPassword } = useAuth();
  const [recovery, setRecovery] = useState(false);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
      setRecovery(true);
    }
  }, []);

  const onSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) return toast.error(error);
    toast.success("Link enviado! Verifique seu e-mail.");
  };

  const onUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Senha atualizada! Entre novamente.");
    window.location.href = "/login";
  };

  return (
    <AuthShell
      title={recovery ? "Definir nova senha" : "Recuperar senha"}
      subtitle={recovery ? "Escolha uma senha forte" : "Enviaremos um link de redefinição"}
      footer={<><Link to="/login" className="text-agro hover:underline">Voltar para o login</Link></>}
    >
      {recovery ? (
        <form onSubmit={onUpdate} className="space-y-4">
          <div>
            <Label htmlFor="np">Nova senha</Label>
            <Input id="np" type="password" required minLength={6} value={pwd} onChange={(e) => setPwd(e.target.value)} />
          </div>
          <Button disabled={loading} className="w-full rounded-full bg-agro text-agro-foreground hover:bg-agro/90">
            {loading ? "Salvando..." : "Atualizar senha"}
          </Button>
        </form>
      ) : (
        <form onSubmit={onSendLink} className="space-y-4">
          <div>
            <Label htmlFor="em">E-mail</Label>
            <Input id="em" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button disabled={loading} className="w-full rounded-full bg-agro text-agro-foreground hover:bg-agro/90">
            {loading ? "Enviando..." : "Enviar link"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}