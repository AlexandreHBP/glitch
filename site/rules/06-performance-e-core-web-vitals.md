# Performance e Core Web Vitals

## Metas (medidas no campo, não no lab)

| Métrica | Bom | Precisa melhorar | Ruim |
|---|---|---|---|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | 2.5s–4.0s | &gt; 4.0s |
| **INP** (Interaction to Next Paint) | ≤ 200ms | 200ms–500ms | &gt; 500ms |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | 0.1–0.25 | &gt; 0.25 |
| **TTFB** (Time to First Byte) | ≤ 800ms | 800ms–1800ms | &gt; 1800ms |
| **FCP** (First Contentful Paint) | ≤ 1.8s | 1.8s–3.0s | &gt; 3.0s |

## LCP — Largest Contentful Paint

A maior imagem ou bloco de texto visível na primeira dobra.

### Otimizações

- **`<Image priority />`** na imagem do Hero — desabilita lazy loading.
- **`fetchPriority="high"`** quando imagem é o LCP.
- **Pré-conexão** a CDNs/fontes via `<link rel="preconnect">`.
- **Avoid render-blocking resources** — JS de terceiros vai com `next/script strategy="lazyOnload"` ou `"afterInteractive"`.
- **Cache HTTP** agressivo em `_next/static/*`.

## CLS — Cumulative Layout Shift

Saltos visuais durante o carregamento.

### Causas comuns

- Imagens sem `width`/`height` definidos.
- Fontes que mudam métricas após carregar (FOUT/FOIT).
- Embeds (vídeo, iframe) sem container reservado.
- Anúncios injetados acima do conteúdo.
- Conteúdo dinâmico empurrando layout (banners de cookie).

### Soluções

- `<Image width height />` ou `fill` com container dimensionado.
- Use `next/font` (zero CLS por padrão) ou `font-display: swap` + `size-adjust`.
- Reserve espaço para embeds com `aspect-ratio` ou container fixo.
- Banners overlay (não empurrando layout).

## INP — Interaction to Next Paint

Latência total da maior interação (clique, tap, key).

### Otimizações

- **Code split**: dynamic imports para componentes pesados.
- **Server Components** sempre que possível — zero JS no cliente.
- **Debounce** inputs custosos (search, autocomplete).
- **`requestIdleCallback`** para trabalho não crítico.
- **Web Workers** para CPU-bound tasks (parse, encrypt).

## Imagens

```tsx
import Image from "next/image";

// Above-the-fold (Hero)
<Image src="/hero.jpg" alt="..." width={1200} height={630} priority fetchPriority="high" />

// Below-the-fold
<Image src="/feature.jpg" alt="..." width={600} height={400} loading="lazy" />

// Responsivo
<Image
  src="/banner.jpg"
  alt="..."
  width={1600}
  height={900}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
/>
```

- Sempre AVIF/WebP (configurado em `next.config.ts`).
- Comprima antes de subir (Squoosh, ImageOptim).
- Logos pequenas → SVG inline.
- Ícones decorativos → SVG sprite ou inline.

## Fontes

- Use **`next/font/google`** ou self-hosted via `next/font/local`.
- `display: "swap"` para evitar texto invisível.
- Subsetting: carregue só `latin` em pt-BR.
- Pré-conexão se servir de CDN externa (já feito em `app/layout.tsx`).

## Scripts de terceiros

```tsx
import Script from "next/script";

<Script src="https://example.com/analytics.js" strategy="afterInteractive" />
<Script src="https://example.com/chat.js" strategy="lazyOnload" />
```

Estratégias:
- `beforeInteractive` — bloqueia hidratação (use só para JSON-LD ou polyfills críticos)
- `afterInteractive` — depois da hidratação (analytics, tag manager)
- `lazyOnload` — quando o browser estiver idle (chat widgets, heatmaps)
- `worker` (experimental) — em web worker via Partytown

## Caching e ISR

- **Static generation** por padrão em rotas sem dados dinâmicos.
- **`revalidate`** para ISR:
  ```ts
  export const revalidate = 3600; // 1h
  ```
- **`fetch(..., { next: { revalidate: 60 } })`** para revalidação por requisição.
- **Headers HTTP**: `Cache-Control: public, max-age=31536000, immutable` para `_next/static/*` (já default no Next).

## Bundle size

Verifique com:
```bash
npm run build
```

Vai imprimir tamanho de cada rota. Mantenha:
- **First Load JS** ≤ 150 KB por rota
- **Shared chunks** ≤ 100 KB

Para investigar:
```bash
ANALYZE=true npm run build
```
(requer `@next/bundle-analyzer`)

## Compressão

- Brotli (preferido) ou gzip — habilite no proxy reverso (nginx, CDN).
- Next.js já comprime resposta com `compress: true` (default em `next.config.ts`).

## Medição contínua

- **Lighthouse CI** — gate em PR (mínimo: Performance ≥ 90, A11y ≥ 95).
- **Web Vitals JS** — coleta no campo:
  ```ts
  import { onCLS, onINP, onLCP } from "web-vitals";
  onCLS(console.log); onINP(console.log); onLCP(console.log);
  ```
- **Vercel Analytics / GA4** — agregue dados reais de usuários.

## Anti-padrões

❌ Carregar bibliotecas inteiras (`import _ from "lodash"`) — use `lodash-es` ou import específico.
❌ Importar `moment` (300 KB) — use `date-fns` ou `Intl.DateTimeFormat`.
❌ Múltiplas fontes web (limite a 2 famílias e 4 pesos).
❌ Imagens 4K em mobile — sirva responsivo com `sizes`.
❌ Bloquear renderização com CSS de terceiros — defer/preload.
