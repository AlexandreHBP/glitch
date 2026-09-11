import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { ProvisionalNotice } from "@/components/content/ProvisionalNotice";
import { ContentPageHeader } from "@/components/content/ContentPageHeader";

// TODO(Alexandre): página criada como rascunho de estrutura para resolver o
// link morto do rodapé ("Nosso Manifesto" apontava para mailto:). Substitua
// os textos abaixo pelo manifesto real da marca (por que a Glitch existe,
// o que ela recusa, para quem ela é) e então remova <ProvisionalNotice />
// e este comentário.
export const metadata: Metadata = buildMetadata({
  title: "Nosso Manifesto",
  description: "O que a Glitch defende e por que a marca existe.",
  path: "/manifesto",
  noIndex: true,
});

export default function ManifestoPage() {
  return (
    <div className="container-section py-16 sm:py-20">
      <ProvisionalNotice />

      <ContentPageHeader
        eyebrow="Sobre a Glitch"
        title="Nosso Manifesto"
        description="Roupa com falha de propósito — para quem não cabe (e não quer caber) nos padrões."
      />

      <div className="mt-12 max-w-2xl space-y-10">
        <section>
          <h2 className="font-display text-xl uppercase tracking-tight text-bone sm:text-2xl">
            Por que existimos
          </h2>
          <p className="mt-3 leading-relaxed text-slate-300">
            [TODO(Alexandre): escreva aqui, com suas palavras, por que a Glitch foi criada — a
            lacuna que você viu no mercado de moda alternativa e o que te fez começar.]
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase tracking-tight text-bone sm:text-2xl">
            O que recusamos
          </h2>
          <p className="mt-3 leading-relaxed text-slate-300">
            [TODO(Alexandre): liste os padrões da indústria da moda que a Glitch rejeita —
            tamanho único, estética padronizada, o que fizer sentido pra marca.]
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase tracking-tight text-bone sm:text-2xl">
            Para quem fazemos
          </h2>
          <p className="mt-3 leading-relaxed text-slate-300">
            [TODO(Alexandre): descreva quem é o público da Glitch — todo corpo, toda expressão, sem
            concessões — com exemplos concretos se fizer sentido.]
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase tracking-tight text-bone sm:text-2xl">
            Nossos compromissos
          </h2>
          <p className="mt-3 leading-relaxed text-slate-300">
            [TODO(Alexandre): se houver compromissos concretos — produção, materiais, comunidade —
            descreva-os aqui. Evite promessas que a operação atual não sustenta.]
          </p>
        </section>
      </div>
    </div>
  );
}
