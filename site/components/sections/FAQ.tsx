import { Section } from "@/components/ui/Section";

const faqs = [
  {
    q: "Preciso pagar no site?",
    a: "Não. O site só registra o pedido. O pagamento é combinado diretamente com a gente depois, na entrega ou como preferir.",
  },
  {
    q: "Preciso criar conta para comprar?",
    a: "Sim. A conta é grátis e rápida de criar — é o que garante que o pedido fique salvo no seu histórico e você consiga acompanhar o status.",
  },
  {
    q: "Como funciona o estoque?",
    a: "Cada tamanho e cor tem estoque próprio. Se uma variação estiver esgotada, o site avisa antes de você finalizar o pedido.",
  },
  {
    q: "Onde vejo o status do meu pedido?",
    a: "Em \"Minha conta\", depois de fazer login. Lá aparece a linha do tempo completa: aguardando contato, em preparo, enviado ou entregue.",
  },
  {
    q: "Posso cancelar um pedido?",
    a: "Fale com a gente pelo contato do rodapé. Pedidos cancelados têm o estoque devolvido automaticamente.",
  },
];

export function FAQ() {
  return (
    <Section id="faq" eyebrow="Perguntas frequentes" title="Dúvidas comuns, respostas diretas" description="Não encontrou o que procurava? Fale com a gente.">
      <div className="mx-auto max-w-3xl divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.02]">
        {faqs.map((faq) => (
          <details key={faq.q} className="group p-6 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-4 text-left text-base font-medium text-white">
              <span>{faq.q}</span>
              <span aria-hidden="true" className="text-wine-bright transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">{faq.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
