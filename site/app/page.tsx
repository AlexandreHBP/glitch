import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
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

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <Features />
      <HowItWorks />
      <CTA />
      <FAQ />
    </>
  );
}
