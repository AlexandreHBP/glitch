import { Button } from "@/components/ui/Button";
import { GlitchText } from "@/components/glitch/GlitchText";
import { ParallaxSection } from "@/components/glitch/ParallaxSection";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative isolate overflow-hidden border-b border-white/5 pt-24 sm:pt-32"
      aria-labelledby="hero-title"
    >
      {/* Background decorativo — não interativo, marcado aria-hidden. O
          parallax só roda em desktop e respeita prefers-reduced-motion. */}
      <ParallaxSection speed={0.15} className="pointer-events-none absolute inset-0 -z-10">
        <div aria-hidden="true" className="absolute inset-0 bg-radial-fade" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-grid-pattern bg-[size:48px_48px] opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]"
        />
        <div
          aria-hidden="true"
          className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-wine/30 blur-3xl animate-blob"
        />
      </ParallaxSection>

      <div className="container-section">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-wine-bright" />
            Catálogo com estoque em tempo real
          </span>

          <h1 id="hero-title" className="mt-8 text-balance text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            <GlitchText as="span" intensity="strong">
              GLITCH
            </GlitchText>
          </h1>
          <p className="mt-4 text-balance text-2xl font-semibold text-bone animate-fade-up sm:text-3xl">
            Roupa com falha de propósito.
          </p>

          <p className="mx-auto mt-6 max-w-2xl text-balance text-base text-slate-300 sm:text-lg animate-fade-up [animation-delay:120ms]">
            Camisetas, moletons e acessórios de estética alternativa. Escolha tamanho e
            cor, monte seu pedido e combine o pagamento direto com a gente — sem
            complicação, sem formulário de papel.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row animate-fade-up [animation-delay:240ms]">
            <Button size="lg" href="/produtos">
              Ver catálogo
            </Button>
            <Button size="lg" variant="secondary" href="#como-funciona">
              Como funciona
            </Button>
          </div>

          <p className="mt-6 text-xs text-slate-500">
            Pagamento combinado fora do site · Conta grátis para comprar
          </p>
        </div>
      </div>
    </section>
  );
}
