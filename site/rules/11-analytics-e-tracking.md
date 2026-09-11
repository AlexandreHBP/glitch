# Analytics e Tracking

> Toda lógica de analytics é **opt-in via variáveis de ambiente**. Em dev/preview, com env vazio, **nenhum** script externo é carregado.

## Variáveis de ambiente

| Variável | Formato | Quando usar |
|---|---|---|
| `NEXT_PUBLIC_GA_ID` | `G-XXXXXXXXXX` | Google Analytics 4 direto, sem GTM |
| `NEXT_PUBLIC_GTM_ID` | `GTM-XXXXXXX` | Google Tag Manager (orquestra GA, Meta Pixel, etc.) |

Ambas são **opcionais**. Defina apenas a que você usa:

- Site simples → use só `NEXT_PUBLIC_GA_ID` (mais leve).
- Site com várias tags de marketing → use `NEXT_PUBLIC_GTM_ID` e configure tudo no painel do GTM.

Com env vazio, os componentes não renderizam nada — zero overhead em dev.

## Onde está implementado

- `lib/site-config.ts` → expõe os IDs em `siteConfig.analytics.*`
- `components/analytics/GoogleAnalytics.tsx` → carrega `gtag.js` do GA4
- `components/analytics/GoogleTagManager.tsx` → carrega script do GTM + `<noscript>` para usuários sem JS
- `app/layout.tsx` → renderiza ambos condicionalmente quando os IDs estão presentes

## Onde encontrar os IDs

### Google Analytics 4

1. Acesse [analytics.google.com](https://analytics.google.com).
2. Admin (engrenagem) → **Property** → **Data Streams**.
3. Selecione o stream **Web** (ou crie um).
4. Copie o **Measurement ID** (começa com `G-`).

### Google Tag Manager

1. Acesse [tagmanager.google.com](https://tagmanager.google.com).
2. Crie/abra um container.
3. O **Container ID** aparece no topo (formato `GTM-XXXXXXX`).

## Estratégia de carregamento

Ambos componentes usam `<Script strategy="afterInteractive">`:

- ✅ Não bloqueia a hidratação.
- ✅ Carrega depois do primeiro paint, preservando LCP.
- ❌ Os primeiros milissegundos não são rastreados (geralmente irrelevante).

Para tracking ainda mais leve, considere alternativas privacy-first:
- [Plausible](https://plausible.io/) — sem cookies, GDPR-friendly.
- [Umami](https://umami.is/) — open source, self-hosted.
- [Vercel Analytics](https://vercel.com/analytics) — nativo no Vercel.

## LGPD/GDPR e consentimento

GA4 e GTM **rastreiam dados pessoais** (IP, fingerprint, cookies). No Brasil/UE você precisa:

1. **Banner de consentimento** antes de carregar tracking não essencial.
2. **Modo de consentimento (Consent Mode v2)** do Google — envia eventos anonimizados até o usuário aceitar.
3. **Política de privacidade** descrevendo o uso.

Implementação recomendada com Consent Mode v2:

```tsx
// Carregue ANTES do GA4
<Script id="consent-default" strategy="beforeInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      wait_for_update: 500,
    });
  `}
</Script>
```

Quando o usuário consentir:

```ts
window.gtag?.("consent", "update", {
  analytics_storage: "granted",
  ad_storage: "granted",
});
```

## Eventos customizados

### GA4 direto

```ts
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

window.gtag?.("event", "cta_click", {
  cta_location: "hero",
  cta_label: "começar grátis",
});
```

### Via GTM (preferido)

Empurra para o `dataLayer` e configura a tag no painel do GTM:

```ts
window.dataLayer?.push({
  event: "cta_click",
  cta_location: "hero",
  cta_label: "começar grátis",
});
```

Isso desacopla o código do app das tags de marketing.

## Checklist

- [ ] `.env.example` documenta as variáveis (✅ já está)
- [ ] Em dev, env vazio → sem requests para `googletagmanager.com`
- [ ] Em produção, IDs configurados no host (Vercel/Netlify/etc.)
- [ ] Banner de consentimento presente se há usuários BR/UE
- [ ] Política de privacidade lista o uso de GA/GTM
- [ ] Anonimização de IP habilitada (já é default no GA4)
- [ ] DebugView do GA4 verificado em staging antes de subir

## Anti-padrões

❌ Hardcodar `G-XXXXXXX` no código (sempre via env).
❌ Carregar tracking sem consentimento em mercados regulados.
❌ Usar `strategy="beforeInteractive"` para gtag — bloqueia o LCP.
❌ Múltiplas instâncias do GA na mesma página (gera double-counting).
❌ Tags de marketing direto no código quando há GTM disponível.
