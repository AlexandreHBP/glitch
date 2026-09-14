import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { ContentPageHeader } from "@/components/content/ContentPageHeader";

export const metadata: Metadata = buildMetadata({
  title: "Nosso Manifesto",
  description: "O que a Glitch defende e por que a marca existe.",
  path: "/manifesto",
});

export default function ManifestoPage() {
  return (
    <div className="container-section py-16 sm:py-20">
      <ContentPageHeader
        eyebrow="Sobre a Glitch"
        title="Nosso Manifesto"
        description="Estilo fora do padrão, de propósito — para quem não cabe (e não quer caber) nos padrões."
      />

      <div className="mt-12 max-w-2xl space-y-10">
        <section>
          <h2 className="font-display text-xl uppercase tracking-tight text-bone sm:text-2xl">
            Por que existimos
          </h2>
          <p className="mt-3 leading-relaxed text-slate-300">
            Glitch é aquele instante em que o sistema falha e, por um segundo, mostra o que tem por
            trás da tela perfeita. A gente decidiu vestir esse instante. Nascemos porque a moda
            alternativa continuava reproduzindo os mesmos padrões que dizia recusar: uma grade de
            tamanhos que para no G, uma ideia fixa de como um corpo &quot;deveria&quot; vestir uma
            roupa. A Glitch existe pra transformar a falha em estética — pra dizer que sair do
            padrão não é um defeito a esconder, é a coisa mais interessante que você tem.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase tracking-tight text-bone sm:text-2xl">
            O que recusamos
          </h2>
          <p className="mt-3 leading-relaxed text-slate-300">
            Recusamos tamanho único e a ideia de que existe um jeito &quot;certo&quot; de se vestir.
            Recusamos separar roupa por gênero como se estilo tivesse que escolher um lado.
            Recusamos tratar quem foge do padrão como exceção, promoção especial ou nota de rodapé
            — e recusamos, principalmente, a ideia de que ser diferente é uma falha a ser
            corrigida. A ovelha negra do nosso rodapé não está fugindo do rebanho por engano: ela
            escolheu esse caminho.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase tracking-tight text-bone sm:text-2xl">
            Para quem fazemos
          </h2>
          <p className="mt-3 leading-relaxed text-slate-300">
            Fazemos moda pra todo corpo e toda expressão de gênero, do XS ao 5XL, sem exceções e
            sem asteriscos no meio do caminho. É pra quem já ouviu que não tinha o tipo de corpo
            &quot;certo&quot; pra determinada peça, pra quem não se vê representado nas prateleiras
            binárias, e pra quem simplesmente entende estilo alternativo como identidade, não
            fantasia. Se você já se sentiu a ovelha negra em algum lugar, essa marca é sua.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase tracking-tight text-bone sm:text-2xl">
            Nossos compromissos
          </h2>
          <p className="mt-3 leading-relaxed text-slate-300">
            Comprometemo-nos a manter e expandir a faixa de tamanhos conforme a coleção cresce, a
            desenhar peças pensando em corpos e expressões de gênero diversas desde o início — não
            como adaptação posterior —, e a ouvir de verdade quem veste a marca. Somos um projeto
            em construção: à medida que a Glitch cresce, vamos detalhando aqui, com transparência,
            nossos compromissos de produção e sustentabilidade.
          </p>
        </section>
      </div>
    </div>
  );
}
