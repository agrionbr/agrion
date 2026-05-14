export const fmtBRL = (n: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n ?? 0);
export const fmtNum = (n: number | null | undefined, d = 0) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: d }).format(n ?? 0);
export const fmtDate = (d: string | Date | null | undefined) => {
  if (!d) return "—";
  const x = typeof d === "string" ? new Date(d) : d;
  return x.toLocaleDateString("pt-BR");
};