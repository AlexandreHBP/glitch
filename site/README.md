# site — Landing Page (Next.js + React + TailwindCSS)

Esqueleto profissional de landing page com SEO completo, acessibilidade,
performance otimizada e cabeçalhos de segurança configurados.

## Stack

- **Next.js 15** (App Router, Server Components)
- **React 19**
- **TypeScript** estrito
- **TailwindCSS 3** com tokens de marca

## Início rápido

```bash
cd site
cp .env.example .env.local      # ajuste as variáveis
npm install
npm run dev
```

Servidor sobe em **`http://0.0.0.0:3001`** — acessível de qualquer host na rede.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Dev server em `0.0.0.0:3001` |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção em `0.0.0.0:3001` |
| `npm run lint` | ESLint (next/core-web-vitals) |
| `npm run typecheck` | `tsc --noEmit` |

## Estrutura

```
site/
├── app/              # Rotas, layouts, pages (App Router)
├── components/       # ui/ + layout/ + sections/ + analytics/
├── lib/              # site-config, seo helpers, cn
├── public/           # assets estáticos
├── rules/            # ⭐ regras e boas práticas (LEIA antes de contribuir)
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## Regras e boas práticas

A pasta **`rules/`** contém a documentação canônica do projeto.
Comece por [`rules/00-leia-me-primeiro.md`](./rules/00-leia-me-primeiro.md).

Tópicos cobertos:
- Arquitetura, Next.js App Router, SEO, TailwindCSS
- Acessibilidade (WCAG 2.2 AA), Performance (Core Web Vitals)
- Segurança (headers, CSP), Componentes, Deploy
- Analytics (GA4, GTM) e fluxo com agentes IA

## Variáveis de ambiente

Veja `.env.example`. As principais:

- `NEXT_PUBLIC_SITE_URL` — URL canônica do site
- `NEXT_PUBLIC_SITE_NAME` — nome da marca
- `NEXT_PUBLIC_GA_ID` — Google Analytics 4 (opcional)
- `NEXT_PUBLIC_GTM_ID` — Google Tag Manager (opcional)
- `GOOGLE_SITE_VERIFICATION` — Search Console (opcional)

## SEO já configurado

- Metadata API (title, description, canonical, robots)
- OpenGraph e Twitter Cards
- JSON-LD: Organization + WebSite
- `sitemap.xml` e `robots.txt` dinâmicos
- Web App Manifest (PWA)
- Verificação Google Search Console

## Acessibilidade

- Skip link, foco visível, marcação semântica
- `prefers-reduced-motion` respeitado
- Contraste AA, hierarquia de headings correta

## Deploy

Funciona em qualquer host Node.js: Vercel, Netlify, AWS, GCP, Docker self-hosted.
Detalhes em [`rules/09-deploy-e-ambiente.md`](./rules/09-deploy-e-ambiente.md).
