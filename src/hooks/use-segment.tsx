import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useCurrentFarm, type FarmSegment } from "@/hooks/use-current-farm";

type Ctx = {
  segment: FarmSegment;
  setSegment: (s: FarmSegment) => void;
  available: FarmSegment[];
};
const SegmentContext = createContext<Ctx | null>(null);

const KEY = "bovi.segment";

export function SegmentProvider({ children }: { children: ReactNode }) {
  const { farm } = useCurrentFarm();
  const available = farm?.segments?.length ? farm.segments : (["pecuaria"] as FarmSegment[]);
  const [segment, setSegmentState] = useState<FarmSegment>("pecuaria");

  useEffect(() => {
    const saved = (typeof window !== "undefined" ? localStorage.getItem(KEY) : null) as FarmSegment | null;
    if (saved && available.includes(saved)) setSegmentState(saved);
    else setSegmentState(available[0]);
  }, [available.join(",")]);

  const setSegment = (s: FarmSegment) => {
    setSegmentState(s);
    if (typeof window !== "undefined") localStorage.setItem(KEY, s);
  };

  const value = useMemo(() => ({ segment, setSegment, available }), [segment, available.join(",")]);
  return <SegmentContext.Provider value={value}>{children}</SegmentContext.Provider>;
}

export function useSegment() {
  const ctx = useContext(SegmentContext);
  if (!ctx) throw new Error("useSegment must be used within SegmentProvider");
  return ctx;
}