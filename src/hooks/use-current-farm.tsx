import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export type FarmSegment = "pecuaria" | "graos";
export type Farm = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  segments: FarmSegment[];
};

export function useFarms() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["farms", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("farms")
        .select("id,name,city,state,segments")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((f) => ({
        ...f,
        segments: (f.segments ?? ["pecuaria"]) as FarmSegment[],
      })) as Farm[];
    },
  });
}

export function useCurrentFarm() {
  const { data: farms, isLoading } = useFarms();
  const farm = farms?.[0] ?? null;
  return { farm, isLoading };
}