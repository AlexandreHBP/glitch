import { Section } from "@/components/ui/Section";

const steps = [
  {
    number: "01",
    title: "Escolha a peça",
    description: "Navegue pelo catálogo, veja fotos, tamanhos e cores e confira o estoque de cada variação.",
  },
  {
    number: "02",
    title: "Crie sua conta",
    description: "Cadastro rápido, só com nome, e-mail e senha. Precisa de conta pra finalizar o pedido.",
  },
  {
    number: "03",
    title: "Combine o pagamento",
    description: "O pedido é registrado automaticamente. Pagamento e entrega são combinados direto com a gente.",
  },
];

export function HowItWorks() {
  return (
    <Section
      id="como-funciona"
      eyebrow="Como funciona"
      title="Do catálogo ao pedido em três passos"
      description="Sem cobrança online. O site organiza o pedido, você combina o resto com a gente."
    >
      <ol className="grid gap-8 md:grid-cols-3" role="list">
        {steps.map((step) => (
          <li key={step.number} className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-8">
            <span className="text-sm font-semibold tracking-widest text-wine-bright">{step.number}</span>
            <h3 className="mt-3 text-xl font-semibold text-white">{step.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">{step.description}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
