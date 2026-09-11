# Arquitetura do Projeto

## Estrutura de pastas

```
site/
├── app/                     # Next.js App Router — rotas, layouts, pages
│   ├── layout.tsx           # Layout root (SEO, fontes, JSON-LD, skip-link)
│   ├── page.tsx             # Home (landing page)
│   ├── globals.css          # Tailwind + base styles globais
│   ├── error.tsx            # Boundary de erro global
│   ├── not-found.tsx        # 404 customizado
│   ├── sitemap.ts           # sitemap.xml dinâmico
│   ├── robots.ts            # robots.txt dinâmico
│   ├── manifest.ts          # PWA manifest
│   └── api/                 # Route handlers (server endpoints)
│
├── components/              # Componentes React reutilizáveis
│   ├── ui/                  # Primitivos (Button, Container, Section)
│   ├── layout/              # Header, Footer, navegação
│   └── sections/            # Seções da LP (Hero, Features, CTA, FAQ)
│
├── lib/                     # Lógica pura, helpers, config
│   ├── site-config.ts       # Single source of truth da marca
│   ├── seo.ts               # Builders de Metadata e JSON-LD
│   └── cn.ts                # Helper de classNames
│
├── public/                  # Assets estáticos servidos em /
│   ├── favicon.ico
│   ├── og-image.png         # 1200x630 — link previews
│   └── icon-{192,512}.png   # PWA icons
│
├── styles/                  # CSS adicional (raramente necessário)
│
├── rules/                   # Documentação de regras e boas práticas
│
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── postcss.config.mjs
```

## Princípios de organização

### 1. Separação por intenção, não por tipo

Componentes ficam em `components/` agrupados por **propósito** (`ui`, `layout`, `sections`), não por tipo técnico. Lógica de domínio fica em `lib/`. Rotas ficam em `app/`.

### 2. `lib/site-config.ts` é a única fonte da verdade da marca

Nome da empresa, URL canônica, redes sociais, contatos — tudo importado daqui. Nunca duplique strings de marca em componentes.

### 3. Componentes de seção são server por padrão

Seções da LP (`Hero`, `Features`, etc.) são server components. Elevamos para client (`"use client"`) **só** quando há interatividade (form, dropdown, etc.). Veja `02-nextjs-app-router-rules.md`.

### 4. Imports usam alias `@/`

`tsconfig.json` mapeia `@/*` para a raiz do projeto. Sempre use `@/components/ui/Button` em vez de paths relativos longos como `../../../components/ui/Button`.

### 5. Caminhos rasos, não profundos

Evite aninhar pastas além de 3 níveis dentro de `components/` ou `app/`. Se uma seção crescer demais, divida em componentes filhos no mesmo nível, não crie subpastas.

## Onde colocar cada coisa

| Vou criar... | Onde |
|---|---|
| Nova rota/página | `app/<rota>/page.tsx` |
| Nova seção da LP | `components/sections/MinhaNovaSecao.tsx` + import em `app/page.tsx` |
| Componente reutilizável de UI | `components/ui/MeuPrimitivo.tsx` |
| Helper puro (sem React) | `lib/meu-helper.ts` |
| Endpoint server | `app/api/<rota>/route.ts` |
| Config compartilhada | `lib/<assunto>-config.ts` |
| Asset (imagem, font) | `public/` |
| Regra/decisão arquitetural | `rules/<numero>-<tema>.md` |
