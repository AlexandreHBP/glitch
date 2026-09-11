import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { ProvisionalNotice } from "@/components/content/ProvisionalNotice";
import { ContentPageHeader } from "@/components/content/ContentPageHeader";

// TODO(Alexandre): página criada como rascunho de estrutura para resolver o
// link morto do rodapé ("Acessibilidade" apontava para mailto:). A seção
// "O que já existe no site" lista práticas de acessibilidade técnica
// realmente implementadas (ver site/rules/05-acessibilidade-a11y.md) — pode
// ficar como está. As demais seções são rascunho para você revisar/
// completar (ex.: canal de contato para reportar barreiras de
// acessibilidade). Depois de revisado, remova <ProvisionalNotice />.
export const metadata: Metadata = buildMetadata({
  title: "Acessibilidade",
  description: "Compromisso e práticas de acessibilidade da Glitch.",
  path: "/acessibilidade",
  noIndex: true,
});

export default function AcessibilidadePage() {
  return (
    <div className="container-section py-16 sm:py-20">
      <ProvisionalNotice />

      <ContentPageHeader
        eyebrow="Sobre a Glitch"
        title="Acessibilidade"
        description="Moda alternativa para todo corpo, toda expressão — incluindo como este site funciona."
      />

      <div className="mt-12 max-w-2xl space-y-10">
        <section>
          <h2 className="font-display text-xl uppercase tracking-tight text-bone sm:text-2xl">
            Nosso compromisso
          </h2>
          <p className="mt-3 leading-relaxed text-slate-300">
            [TODO(Alexandre): descreva o compromisso da Glitch com acessibilidade — tanto no
            produto (tamanhos, cortes adaptáveis) quanto na experiência de compra.]
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase tracking-tight text-bone sm:text-2xl">
            O que já existe no site
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-slate-300">
            <li>Navegação completa pelo teclado, com foco sempre visível.</li>
            <li>Marcação semântica (landmarks, hierarquia de títulos, botões e links nativos).</li>
            <li>Textos alternativos em imagens de produto e ícones com rótulo para leitores de tela.</li>
            <li>Contraste de cores pensado para o tema escuro do site.</li>
            <li>Animações respeitam a preferência do sistema por movimento reduzido.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase tracking-tight text-bone sm:text-2xl">
            Encontrou uma barreira?
          </h2>
          <p className="mt-3 leading-relaxed text-slate-300">
            [TODO(Alexandre): confirme o canal preferido para reportar problemas de acessibilidade
            (e-mail, WhatsApp etc.) e o prazo esperado de resposta.]
          </p>
        </section>
      </div>
    </div>
  );
}
