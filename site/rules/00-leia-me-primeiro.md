# Regras do Projeto — Leia-me Primeiro

> Este diretório (`rules/`) contém as regras e boas práticas que **devem** ser seguidas ao trabalhar neste projeto. É a fonte canônica da verdade para agentes (humanos e IA) entenderem como contribuir sem violar decisões arquiteturais.

## Por que `rules/` existe

Este projeto é um **esqueleto profissional de landing page** em Next.js + React + TailwindCSS. Cada arquivo aqui codifica uma decisão deliberada sobre SEO, performance, acessibilidade, segurança ou estrutura — decisões que **não devem ser desfeitas** sem leitura prévia da regra correspondente.

## Como navegar

Os arquivos estão prefixados numericamente para sugerir ordem de leitura:

| Arquivo | O que cobre |
|---|---|
| `00-leia-me-primeiro.md` | Este documento — orientação geral |
| `01-arquitetura-do-projeto.md` | Estrutura de pastas, App Router, organização |
| `02-nextjs-app-router-rules.md` | Server vs Client Components, metadata, rotas |
| `03-seo-best-practices.md` | Metadata, OpenGraph, JSON-LD, sitemap, robots |
| `04-tailwind-styling-conventions.md` | Tokens, design system, evitar CSS custom |
| `05-acessibilidade-a11y.md` | WCAG, semântica, foco, leitores de tela |
| `06-performance-e-core-web-vitals.md` | LCP, CLS, INP, fonts, imagens, scripts |
| `07-seguranca-headers-e-csp.md` | Cabeçalhos HTTP, sanitização, segredos |
| `08-componentes-e-design-system.md` | Convenções de componentes, props, composição |
| `09-deploy-e-ambiente.md` | Variáveis, host 0.0.0.0, Docker, observabilidade |
| `10-fluxo-de-trabalho-com-agentes.md` | Como agentes IA devem operar neste repositório |
| `11-analytics-e-tracking.md` | GA4, GTM, consentimento LGPD/GDPR, eventos |

## Princípios fundamentais

1. **Server-first, client quando necessário.** Componentes são server components por padrão. Adicione `"use client"` apenas quando há estado, efeito ou handler.
2. **Acessibilidade não é opcional.** Toda nova seção precisa de marcação semântica, contraste suficiente e suporte a teclado.
3. **SEO em cada página.** Toda `page.tsx` deve exportar `metadata` via `buildMetadata()` de `lib/seo.ts`.
4. **Sem dependências desnecessárias.** Antes de instalar uma lib, verifique se Next/Tailwind/React já resolvem o problema.
5. **Conteúdo em pt-BR por padrão.** Strings de UI em português brasileiro. Internacionalização vem em `i18n` quando necessário.

## Quando criar uma nova regra

Adicione um novo arquivo em `rules/` quando:

- Uma decisão arquitetural for tomada e precisa sobreviver à rotatividade de pessoas/agentes.
- Um padrão for repetido em 3+ lugares e precisar ser documentado.
- Um erro recorrente puder ser prevenido por uma regra explícita.

**Não** adicione regras para:
- Detalhes triviais de sintaxe que o linter já cobre.
- Preferências pessoais sem justificativa técnica.
- Documentação de código (use comentários inline ou JSDoc no próprio código).
