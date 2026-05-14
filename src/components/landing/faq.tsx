import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "Funciona offline?", a: "O AGRION roda no celular, tablet e computador. Em áreas sem sinal, o app sincroniza assim que volta a conexão." },
  { q: "Preciso instalar algo?", a: "Não. Você acessa direto pelo navegador. Login com e-mail e senha." },
  { q: "Posso ter mais de uma fazenda?", a: "Sim. O plano Profissional e Fazenda+ suportam várias fazendas e equipes separadas." },
  { q: "Meus dados ficam seguros?", a: "Sim. Criptografia em trânsito e em repouso, backups diários e controle de permissões por usuário." },
  { q: "Tem suporte em português?", a: "Todo o sistema, e-mails e suporte humano são 100% em português brasileiro." },
];

export function Faq() {
  return (
    <section id="faq" className="border-t border-border bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-agro">Perguntas frequentes</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Tudo que você quer saber.</h2>
        </div>
        <Accordion type="single" collapsible className="mt-10">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`i-${i}`} className="border-border">
              <AccordionTrigger className="text-left font-display text-base">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}