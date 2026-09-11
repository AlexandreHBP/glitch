import type { Metadata } from "next";
import { siteConfig } from "./site-config";

type BuildMetadataInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  keywords?: string[];
};

/**
 * Gera o objeto Metadata do Next.js já populado com OG, Twitter,
 * canonical e robots. Use em cada page.tsx via:
 *
 *   export const metadata = buildMetadata({ title: "...", path: "/precos" });
 */
export function buildMetadata({
  title,
  description = siteConfig.description,
  path = "/",
  image = siteConfig.ogImage,
  noIndex = false,
  keywords = [],
}: BuildMetadataInput = {}): Metadata {
  const url = `${siteConfig.url}${path}`;
  const fullTitle = title ? `${title} — ${siteConfig.name}` : siteConfig.name;
  const ogImageUrl = image.startsWith("http") ? image : `${siteConfig.url}${image}`;

  return {
    title: fullTitle,
    description,
    keywords: [...siteConfig.keywords, ...keywords],
    authors: [...siteConfig.authors],
    creator: siteConfig.creator,
    publisher: siteConfig.publisher,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
      languages: {
        "pt-BR": url,
      },
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url,
      siteName: siteConfig.name,
      title: fullTitle,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.social.twitter,
      creator: siteConfig.social.twitter,
      title: fullTitle,
      description,
      images: [ogImageUrl],
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon.svg", type: "image/svg+xml" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
    manifest: "/manifest.webmanifest",
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
    formatDetection: {
      email: false,
      telephone: false,
      address: false,
    },
  };
}

/**
 * JSON-LD Organization — injetado via <script type="application/ld+json">
 * no layout root. Mantém os dados estruturados próximos ao site-config.
 */
export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
    sameAs: [siteConfig.social.linkedin, siteConfig.social.github].filter(Boolean),
    contactPoint: [
      {
        "@type": "ContactPoint",
        email: siteConfig.contact.email,
        telephone: siteConfig.contact.phone,
        contactType: "customer support",
        availableLanguage: ["Portuguese", "English"],
      },
    ],
  };
}

/**
 * JSON-LD WebSite — habilita o sitelinks search box no Google.
 */
export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: siteConfig.language,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/buscar?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
