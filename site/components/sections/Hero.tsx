import { Button } from "@/components/ui/Button";
import { GlitchText } from "@/components/glitch/GlitchText";
import { ParallaxSection } from "@/components/glitch/ParallaxSection";

// TODO(Alexandre): números de exemplo do mockup de referência, não dados
// reais da loja (que está começando agora). Troque pelos números reais
// assim que houver histórico — ex.: total de peças no catálogo, faixa de
// tamanhos realmente cadastrada e países atendidos, se aplicável.
const STATS = [
  { value: "14K+", label: "Estilos" },
  { value: "XS–5XL", label: "Cada peça" },
  { value: "50+", label: "Países" },
] as const;

export function Hero() {
  return (
    <section
      id="hero"
      className="relative isolate overflow-hidden border-b border-white/5"
      aria-labelledby="hero-title"
    >
      {/*
        TODO(Alexandre): este grid de 3 colunas é só um placeholder de
        estilo (gradiente + textura, sem fotos) — o mockup de referência
        mostra 3 fotos reais de campanha (modelos diversos vestindo a
        coleção). Não geramos/inventamos fotos de pessoas aqui: assim que
        você tiver os arquivos originais da campanha (com direito de uso),
        substitua este bloco por <Image> apontando para as 3 fotos, mantendo
        o overlay escuro para a legibilidade do texto por cima.
      */}
      <div
        className="absolute inset-0 -z-20 grid grid-cols-3"
        role="img"
        aria-label="Espaço reservado para 3 fotos da campanha Glitch, com modelos diversos vestindo a coleção — imagens serão adicionadas em breve."
      >
        <div className="border-r border-black/50 bg-gradient-to-b from-slate-800 via-ink to-black" />
        <div className="border-r border-black/50 bg-gradient-to-b from-wine-deep via-ink to-black" />
        <div className="bg-gradient-to-b from-slate-800 via-ink to-black" />
      </div>

      {/* Overlay escuro (mais forte à esquerda, onde fica o texto) + textura
          de scanline, iguais ao tratamento visual do mockup. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/75 to-black/50"
      />
      <ParallaxSection speed={0.1} className="pointer-events-none absolute inset-0 -z-10">
        <div aria-hidden="true" className="absolute inset-0 bg-noise-glitch mix-blend-overlay opacity-30" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-grid-pattern bg-[size:48px_48px] opacity-10"
        />
      </ParallaxSection>

      <div className="container-section relative flex min-h-[80vh] flex-col justify-center py-20 sm:min-h-[85vh] sm:py-28">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-8 bg-wine-bright" />
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-wine-bright">
              Ver-2026 // Todos os corpos, todos os gêneros
            </p>
          </div>

          <h1
            id="hero-title"
            className="mt-6 font-display text-7xl uppercase leading-[0.9] tracking-tight text-bone sm:text-8xl lg:text-9xl"
          >
            <GlitchText as="span" intensity="strong">
              GLITCH
            </GlitchText>
          </h1>

          <p className="mt-6 max-w-xl text-balance text-base text-slate-300 animate-fade-up sm:text-lg [animation-delay:120ms]">
            Moda sem filtro. GLITCH foi feita para todo corpo, toda expressão, todo
            tamanho do XS ao 5XL — sem exceções, sem asteriscos.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row animate-fade-up [animation-delay:240ms]">
            <Button size="lg" href="/produtos">
              Ver todos os tamanhos
            </Button>
            {/* "Novidades" leva à seção "A Coleção" da própria home, que já
                lista os produtos mais recentes vindos da API — ainda não
                existe uma rota/ordenação dedicada de "lançamentos". */}
            <Button size="lg" variant="secondary" href="#colecao">
              Novidades
            </Button>
          </div>

          <dl className="mt-16 grid grid-cols-3 gap-6 border-t border-white/10 pt-8 animate-fade-up [animation-delay:320ms] sm:max-w-md">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-display text-3xl text-bone sm:text-4xl">{stat.value}</dd>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{stat.label}</p>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
