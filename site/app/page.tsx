import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { Collection } from "@/components/sections/Collection";
import { Features } from "@/components/sections/Features";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { ManifestoSection } from "@/components/sections/ManifestoSection";
import { CTA } from "@/components/sections/CTA";
import { FAQ } from "@/components/sections/FAQ";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = buildMetadata({
  title: siteConfig.tagline,
  path: "/",
});

// Home como vitrine de loja (não landing page institucional): produtos
// reais logo no topo, vindos da API, antes de qualquer conteúdo de texto
// sobre a marca. Features/HowItWorks/FAQ continuam depois, como reforço de
// confiança para quem ainda está decidindo comprar. Sem navegação por
// categoria: a loja vende só camisetas, então uma única categoria não
// justifica esse nível de navegação (pedido do Alexandre).
export default function HomePage() {
  return (
    <>
      <Hero />
      <Collection />
      <Features />
      <HowItWorks />
      <ManifestoSection />
      <CTA />
      <FAQ />
    </>
  );
}
