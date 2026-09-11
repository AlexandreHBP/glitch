import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { ProvisionalNotice } from "@/components/content/ProvisionalNotice";
import { ContentPageHeader } from "@/components/content/ContentPageHeader";

// TODO(Alexandre): página criada como rascunho de estrutura para resolver o
// link morto do rodapé ("Sustentabilidade" apontava para mailto:). NENHUM
// número ou compromisso de sustentabilidade foi inventado — preencha só o
// que for verdade sobre a operação da Glitch (materiais, produção,
// embalagem, logística reversa etc.). Se algo ainda não existir, é melhor
// não mencionar do que prometer. Depois de preenchido, remova
// <ProvisionalNotice />.
export const metadata: Metadata = buildMetadata({
  title: "Sustentabilidade",
  description: "Como a Glitch pensa produção e impacto.",
  path: "/sustentabilidade",
  noIndex: true,
});

export default function SustentabilidadePage() {
  return (
    <div className="container-section py-16 sm:py-20">
      <ProvisionalNotice />

      <ContentPageHeader eyebrow="Sobre a Glitch" title="Sustentabilidade" />

      <div className="mt-12 max-w-2xl space-y-10">
        <section>
          <h2 className="font-display text-xl uppercase tracking-tight text-bone sm:text-2xl">
            Materiais e produção
          </h2>
          <p className="mt-3 leading-relaxed text-slate-300">
            [TODO(Alexandre): descreva os materiais usados, fornecedores e o processo de produção,
            só com informações confirmadas.]
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase tracking-tight text-bone sm:text-2xl">
            Embalagem e logística
          </h2>
          <p className="mt-3 leading-relaxed text-slate-300">
            [TODO(Alexandre): descreva a embalagem usada no envio e eventuais iniciativas de
            logística reversa, se existirem.]
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase tracking-tight text-bone sm:text-2xl">
            Próximos passos
          </h2>
          <p className="mt-3 leading-relaxed text-slate-300">
            [TODO(Alexandre): se houver planos futuros de sustentabilidade, descreva-os como planos
            — não como compromissos já cumpridos.]
          </p>
        </section>
      </div>
    </div>
  );
}
