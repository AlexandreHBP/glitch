import { Button } from "@/components/ui/Button";
import { GlitchText } from "@/components/glitch/GlitchText";

export function CTA() {
  return (
    <section id="cta" aria-labelledby="cta-title" className="relative isolate overflow-hidden py-20 sm:py-28">
      <div className="container-section">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-wine/25 via-wine-deep/20 to-transparent p-10 text-center shadow-2xl shadow-black/40 sm:p-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-wine-bright/40 blur-3xl"
          />

          <h2 id="cta-title" className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            <GlitchText as="span" intensity="subtle">
              Pronto pra vestir a falha?
            </GlitchText>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-balance text-base text-slate-300">
            Veja o catálogo completo, escolha sua peça e finalize o pedido. O pagamento a
            gente combina depois, sem burocracia.
          </p>

          <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" href="/produtos">
              Ver catálogo
            </Button>
            <Button size="lg" variant="secondary" href="/cadastro">
              Criar conta
            </Button>
          </div>

          <p className="mt-4 text-xs text-slate-500">Sem cobrança no site. Pagamento combinado com a gente.</p>
        </div>
      </div>
    </section>
  );
}
