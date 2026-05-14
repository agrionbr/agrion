import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Beef, Sprout } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentFarm, type FarmSegment } from "@/hooks/use-current-farm";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/app/settings" as never)({
  component: SettingsPage,
}) as never;

function SettingsPage() {
  const { farm } = useCurrentFarm();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [segments, setSegments] = useState<FarmSegment[]>(["pecuaria"]);

  useEffect(() => {
    if (farm) {
      setName(farm.name);
      setCity(farm.city ?? "");
      setState(farm.state ?? "");
      setSegments(farm.segments);
    }
  }, [farm?.id]);

  const toggle = (s: FarmSegment) => {
    setSegments((cur) => {
      const has = cur.includes(s);
      if (has && cur.length === 1) return cur; // pelo menos 1
      return has ? cur.filter((x) => x !== s) : [...cur, s];
    });
  };

  const save = useMutation({
    mutationFn: async () => {
      if (!farm) return;
      const { error } = await supabase
        .from("farms")
        .update({ name, city: city || null, state: state || null, segments })
        .eq("id", farm.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Fazenda atualizada");
      qc.invalidateQueries({ queryKey: ["farms"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Configurações" subtitle="Dados da fazenda e segmentos ativos" />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display text-lg font-semibold">Dados da fazenda</h3>
          <div className="mt-4 space-y-3">
            <div><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2"><Label>Cidade</Label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
              <div><Label>UF</Label><Input maxLength={2} value={state} onChange={(e) => setState(e.target.value.toUpperCase())} /></div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display text-lg font-semibold">Segmentos ativos</h3>
          <p className="text-sm text-muted-foreground">Escolha o tipo de operação. Você pode ativar os dois.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <SegmentCard
              icon={Beef} label="Pecuária" desc="Rebanho, pesagem, sanidade"
              active={segments.includes("pecuaria")} onClick={() => toggle("pecuaria")}
            />
            <SegmentCard
              icon={Sprout} label="Grãos" desc="Talhões, safras, colheita"
              active={segments.includes("graos")} onClick={() => toggle("graos")}
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Button onClick={() => save.mutate()} disabled={save.isPending} className="rounded-full bg-agro text-agro-foreground hover:bg-agro/90">
          {save.isPending ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </div>
  );
}

function SegmentCard({ icon: Icon, label, desc, active, onClick }: {
  icon: typeof Beef; label: string; desc: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
        active ? "border-agro bg-agro-soft/50" : "border-border bg-background hover:border-agro/50"
      }`}
    >
      <span className={`grid h-10 w-10 place-items-center rounded-lg ${active ? "bg-agro text-agro-foreground" : "bg-secondary text-muted-foreground"}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <div className="font-display font-semibold">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </button>
  );
}