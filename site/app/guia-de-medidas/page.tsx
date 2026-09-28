import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { ProvisionalNotice } from "@/components/content/ProvisionalNotice";
import { ContentPageHeader } from "@/components/content/ContentPageHeader";

// TODO(Alexandre): página criada como rascunho de estrutura para resolver o
// link morto do rodapé ("Guia de Medidas" apontava para mailto:). NENHUMA
// medida real foi inventada — a tabela abaixo só tem a estrutura de
// colunas (tamanho + medidas do corpo) com células vazias ("—") para você
// preencher com as medidas reais de cada peça/tamanho. Depois de
// preenchido, remova <ProvisionalNotice /> e este comentário.
const SIZES = ["XS", "S", "M", "G", "GG", "XG", "2XG", "3XG", "4XG", "5XG"];

const MEASURE_COLUMNS = ["Busto/Peito (cm)", "Cintura (cm)", "Quadril (cm)", "Comprimento (cm)"];

export const metadata: Metadata = buildMetadata({
  title: "Guia de Medidas",
  description: "Como medir e escolher o tamanho certo nas peças Glitch.",
  path: "/guia-de-medidas",
  noIndex: true,
});

export default function GuiaDeMedidasPage() {
  return (
    <div className="container-section py-16 sm:py-20">
      <ProvisionalNotice />

      <ContentPageHeader
        eyebrow="Ajuda"
        title="Guia de Medidas"
        description="Tamanhos de XS a 5XG, com corte adaptável em peças selecionadas."
      />

      <div className="mt-12 max-w-3xl space-y-10">
        <section>
          <h2 className="font-display text-xl uppercase tracking-tight text-bone sm:text-2xl">
            Como medir
          </h2>
          <p className="mt-3 leading-relaxed text-slate-300">
            [TODO(Alexandre): explique aqui como o cliente deve se medir em casa — busto/peito,
            cintura, quadril, comprimento — e qual referência usar (fita métrica, peça já usada
            etc.).]
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase tracking-tight text-bone sm:text-2xl">
            Tabela de medidas
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            [TODO(Alexandre): preencha as células abaixo com as medidas reais de cada tamanho. Os
            valores &ldquo;—&rdquo; são placeholder, não medidas reais.]
          </p>
          <div className="mt-4 overflow-x-auto rounded-md border border-white/10">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th scope="col" className="px-4 py-3 font-semibold uppercase tracking-wide text-bone">
                    Tamanho
                  </th>
                  {MEASURE_COLUMNS.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="px-4 py-3 font-semibold uppercase tracking-wide text-bone"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SIZES.map((size) => (
                  <tr key={size} className="border-b border-white/5 last:border-0">
                    <th scope="row" className="px-4 py-3 font-medium text-slate-200">
                      {size}
                    </th>
                    {MEASURE_COLUMNS.map((column) => (
                      <td key={column} className="px-4 py-3 text-slate-500">
                        —
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase tracking-tight text-bone sm:text-2xl">
            Corte adaptável
          </h2>
          <p className="mt-3 leading-relaxed text-slate-300">
            [TODO(Alexandre): explique o que muda nas peças marcadas como &ldquo;Corte
            Adaptável&rdquo; — ajustes, aberturas, elásticos — comparado ao corte padrão.]
          </p>
        </section>
      </div>
    </div>
  );
}
