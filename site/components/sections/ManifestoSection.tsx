import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { GlitchText } from "@/components/glitch/GlitchText";
import { ProvisionalNotice } from "@/components/content/ProvisionalNotice";

// Recorte do manifesto (texto completo em app/manifesto/page.tsx) para dar
// visibilidade a ele já na home, sem tirar o protagonismo dos produtos —
// por isso esta seção vem depois de Collection/Features/HowItWorks, nunca
// antes. Mantém o mesmo aviso de conteúdo provisório da página completa,
// já que o texto do manifesto em si ainda não foi escrito pelo Alexandre.
//
// TODO(Alexandre): quando o manifesto completo (app/manifesto/page.tsx) for
// escrito e revisado, atualize também este resumo e remova o
// <ProvisionalNotice /> daqui.
export function ManifestoSection() {
  return (
    <Section id="manifesto" align="left" className="border-t border-white/5">
      <div className="mx-auto max-w-3xl">
        <ProvisionalNotice />

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
            A Glitch existe pra quem não cabe (e não quer caber) nos padrões da moda tradicional.
            Roupa do XS ao 5XL, sem exceções e sem asteriscos — porque estilo alternativo não é
            sobre caber numa grade de tamanho, é sobre ser exatamente quem você é.
          </p>
          <p>
            Recusamos tamanho único, estética padronizada e a ideia de que existe um jeito
            &quot;certo&quot; de se vestir. Fazemos moda pra todo corpo e toda expressão, sem
            concessões.
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
