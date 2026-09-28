import { Shirt, Heart, Package, Handshake, MapPin, Headphones, type LucideIcon } from "lucide-react";
import { Section } from "@/components/ui/Section";

const features: Array<{ icon: LucideIcon; title: string; description: string }> = [
  {
    icon: Shirt,
    title: "Estoque por variação",
    description: "Cada tamanho e cor tem seu próprio estoque. Se a P esgotou, a G continua disponível.",
  },
  {
    icon: Heart,
    title: "Estética alternativa",
    description: "Peças com identidade forte, pensadas pra quem não quer se vestir igual todo mundo.",
  },
  {
    icon: Package,
    title: "Pedido sem enrolação",
    description: "Monte o carrinho, finalize o pedido e a gente já recebe tudo organizado — sem papel, sem caderno.",
  },
  {
    icon: Handshake,
    title: "Pagamento combinado",
    description: "Nada é cobrado no site. Você combina forma de pagamento e entrega direto com a gente.",
  },
  {
    icon: MapPin,
    title: "Acompanhe o pedido",
    description: "Veja o status do seu pedido — aguardando contato, em preparo, enviado ou entregue.",
  },
  {
    icon: Headphones,
    title: "Trilha sonora própria",
    description: "Navegue com a playlist da loja tocando — só se você clicar em play.",
  },
];

export function Features() {
  return (
    <Section
      id="features"
      eyebrow="Por que a Glitch"
      title="Feito pra quem também é diferente"
      description="Os detalhes que fazem a diferença entre comprar numa loja qualquer e comprar na Glitch."
    >
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
        {features.map((feature) => (
          <li
            key={feature.title}
            className="group relative rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-colors hover:border-wine/60 hover:bg-white/[0.04]"
          >
            <span aria-hidden="true" className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-wine/10 text-wine-bright">
              <feature.icon className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <h3 className="mt-5 text-lg font-semibold text-white">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{feature.description}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
