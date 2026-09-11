import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { ProvisionalNotice } from "@/components/content/ProvisionalNotice";
import { ContentPageHeader } from "@/components/content/ContentPageHeader";

// TODO(Alexandre): página criada como rascunho de estrutura para resolver o
// link morto do rodapé ("Envio & Trocas" apontava para mailto:). NENHUM
// prazo de envio ou janela de troca/devolução foi inventado — preencha com
// a política real (prazo em dias, condições da peça, quem paga o frete de
// volta, forma de reembolso). Depois de preenchido, remova
// <ProvisionalNotice />.
export const metadata: Metadata = buildMetadata({
  title: "Envio & Trocas",
  description: "Prazos de envio e como solicitar troca ou devolução.",
  path: "/envio-e-trocas",
  noIndex: true,
});

export default function EnvioETrocasPage() {
  return (
    <div className="container-section py-16 sm:py-20">
      <ProvisionalNotice />

      <ContentPageHeader eyebrow="Ajuda" title="Envio & Trocas" />

      <div className="mt-12 max-w-2xl space-y-10">
        <section>
          <h2 className="font-display text-xl uppercase tracking-tight text-bone sm:text-2xl">
            Prazos de envio
          </h2>
          <p className="mt-3 leading-relaxed text-slate-300">
            [TODO(Alexandre): informe o prazo de despacho após a confirmação do pedido, as regiões
            atendidas e o método de envio usado.]
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase tracking-tight text-bone sm:text-2xl">
            Como solicitar uma troca
          </h2>
          <p className="mt-3 leading-relaxed text-slate-300">
            [TODO(Alexandre): descreva o passo a passo para o cliente solicitar troca — canal de
            contato, informações necessárias, prazo para solicitar a partir do recebimento.]
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase tracking-tight text-bone sm:text-2xl">
            Condições para troca ou devolução
          </h2>
          <p className="mt-3 leading-relaxed text-slate-300">
            [TODO(Alexandre): informe as condições da peça para aceitar troca/devolução (etiqueta,
            uso, embalagem original) e quem paga o frete de retorno.]
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase tracking-tight text-bone sm:text-2xl">
            Reembolso
          </h2>
          <p className="mt-3 leading-relaxed text-slate-300">
            [TODO(Alexandre): informe a forma e o prazo de reembolso quando a troca não for
            possível.]
          </p>
        </section>
      </div>
    </div>
  );
}
