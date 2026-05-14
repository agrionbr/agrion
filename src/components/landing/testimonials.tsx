const items = [
  { name: "João Mendes", role: "Pecuarista · MT", text: "Em 3 meses parei de perder dinheiro com lotes ruins. O alerta de baixo GMD salva a conta no fim do mês." },
  { name: "Ana Carvalho", role: "Gestora · MS", text: "Substituí 4 planilhas pelo AGRION. A equipe usa no celular sem treinamento, simples demais." },
  { name: "Renato Lopes", role: "Sojicultor · GO", text: "Vejo o custo por hectare e a produtividade da safra em tempo real. Mudou minha tomada de decisão." },
];

export function Testimonials() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-agro">Quem usa, recomenda</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Produtores que dormem mais tranquilos.</h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {items.map((t) => (
            <figure key={t.name} className="rounded-2xl border border-border bg-card p-6">
              <blockquote className="text-foreground/90">"{t.text}"</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-agro-soft font-display font-bold text-agro">
                  {t.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}