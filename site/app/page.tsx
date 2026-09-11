import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { CategoryShowcase } from "@/components/sections/CategoryShowcase";
import { FeaturedProducts } from "@/components/sections/FeaturedProducts";
import { Features } from "@/components/sections/Features";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { CTA } from "@/components/sections/CTA";
import { FAQ } from "@/components/sections/FAQ";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = buildMetadata({
  title: siteConfig.tagline,
  path: "/",
});

// Home como vitrine de loja (não landing page institucional): categorias e
// produtos reais logo no topo, vindos da API, antes de qualquer conteúdo
// de texto sobre a marca. Features/HowItWorks/FAQ continuam depois, como
// reforço de confiança para quem ainda está decidindo comprar.
export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryShowcase />
      <FeaturedProducts />
      <Features />
      <HowItWorks />
      <CTA />
      <FAQ />
    </>
  );
}
