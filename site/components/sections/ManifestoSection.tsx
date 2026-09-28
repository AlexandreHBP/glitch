import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { GlitchText } from "@/components/glitch/GlitchText";

// Recorte do manifesto (texto completo em app/manifesto/page.tsx) para dar
// visibilidade a ele já na home, sem tirar o protagonismo dos produtos —
// por isso esta seção vem depois de Collection/Features/HowItWorks, nunca
// antes.
export function ManifestoSection() {
  return (
    <Section id="manifesto" align="left" className="border-t border-white/5">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-wine-bright">
          Sobre a Glitch
        </p>
        <h2 className="mt-3 font-display text-3xl uppercase tracking-tight text-bone sm:text-4xl">
          <GlitchText as="span" intensity="subtle">
            Nosso manifesto
          </GlitchText>
        </h2>

        <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-300">
          <p>
            Glitch é aquele instante em que o sistema falha e mostra o que tem por trás da tela
            perfeita. A gente decidiu vestir esse instante — porque sair do padrão não é um defeito
            a esconder, é a coisa mais interessante que você tem.
          </p>
          <p>
            Roupa do XS ao 5XL, pra todo corpo e toda expressão de gênero, sem exceções e sem
            asteriscos. Se você já se sentiu a ovelha negra em algum lugar, essa marca é sua.
          </p>
        </div>

        <div className="mt-8">
          <Button href="/manifesto" variant="secondary" size="lg">
            Leia o manifesto completo
          </Button>
        </div>
      </div>
    </Section>
  );
}
