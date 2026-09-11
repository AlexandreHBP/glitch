import Script from "next/script";

type GoogleAnalyticsProps = {
  measurementId: string;
};

/**
 * Carrega o gtag.js do GA4 com strategy="afterInteractive" — não bloqueia
 * a hidratação. Use somente quando NEXT_PUBLIC_GA_ID estiver definido,
 * para não emitir hits em dev/preview.
 *
 * Uso:
 *   {process.env.NEXT_PUBLIC_GA_ID && (
 *     <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_ID} />
 *   )}
 */
export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            anonymize_ip: true,
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}
