import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { buildMetadata, buildOrganizationJsonLd, buildWebsiteJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import {
  GoogleTagManager,
  GoogleTagManagerNoScript,
} from "@/components/analytics/GoogleTagManager";
import { AppProviders } from "@/components/providers/AppProviders";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MusicPlayer } from "@/components/glitch/MusicPlayer";
import "./globals.css";

// next/font auto-hospeda a fonte, evita CLS e adiciona size-adjust automático.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = buildMetadata();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: siteConfig.themeColor },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const orgJsonLd = buildOrganizationJsonLd();
  const siteJsonLd = buildWebsiteJsonLd();
  const { googleAnalyticsId, googleTagManagerId } = siteConfig.analytics;

  return (
    <html lang={siteConfig.language} className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Dados estruturados (JSON-LD) — habilitam rich results no Google */}
        <Script
          id="ld-organization"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <Script
          id="ld-website"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />

        {/* Analytics — ativam apenas quando o env estiver configurado */}
        {googleTagManagerId && <GoogleTagManager containerId={googleTagManagerId} />}
        {googleAnalyticsId && <GoogleAnalytics measurementId={googleAnalyticsId} />}
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-brand-500/40">
        {googleTagManagerId && <GoogleTagManagerNoScript containerId={googleTagManagerId} />}

        {/* Skip link de acessibilidade — primeiro elemento focável */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg"
        >
          Pular para o conteúdo principal
        </a>

        <AppProviders>
          <Header />
          {/* pb-24: reserva espaço para o widget flutuante do player (RF10),
              que agora é um disco de vinil fixo no canto inferior em
              qualquer tamanho de tela — não só no mobile como antes. */}
          <main id="main" tabIndex={-1} className="min-h-[60vh] pb-24">
            {children}
          </main>
          <Footer />
          <MusicPlayer />
        </AppProviders>
      </body>
    </html>
  );
}
