# Boas Práticas de SEO

> SEO neste projeto é configurado via `lib/seo.ts` + Next Metadata API. Não duplique tags manualmente.

## Checklist obrigatório por página

Toda nova página deve ter:

- [ ] `export const metadata` (ou `generateMetadata`) usando `buildMetadata()`
- [ ] `title` único e descritivo (50–60 caracteres ideais)
- [ ] `description` de 140–160 caracteres
- [ ] `path` correto (alimenta canonical, OG URL e alternates)
- [ ] Imagem OG personalizada quando relevante (1200×630, &lt;200 KB)
- [ ] Apenas **um** `<h1>` por página, dentro de `<main>`
- [ ] Hierarquia de headings sem pular níveis (h1 → h2 → h3)

## O que `buildMetadata()` cobre

- `<title>` e `<meta name="description">`
- `<link rel="canonical">`
- `<meta name="robots">` com diretivas Google-bot completas
- OpenGraph (`og:title`, `og:description`, `og:image`, `og:url`, `og:locale`, `og:type`)
- Twitter Cards (`summary_large_image`)
- Ícones (`favicon`, `apple-touch-icon`, manifest)
- Verificação Google Search Console (via env `GOOGLE_SITE_VERIFICATION`)
- `metadataBase` (resolve URLs relativas em absolutas)

## Dados estruturados (JSON-LD)

Implementados em `lib/seo.ts`:
- `buildOrganizationJsonLd()` — info da empresa
- `buildWebsiteJsonLd()` — habilita sitelinks search box

Injetados no `<head>` via `next/script` com `strategy="beforeInteractive"`.

### Quando adicionar JSON-LD por página

| Tipo de página | Schema recomendado |
|---|---|
| Artigo de blog | `Article` ou `BlogPosting` |
| Produto | `Product` |
| FAQ | `FAQPage` |
| Vídeo | `VideoObject` |
| Receita | `Recipe` |
| Evento | `Event` |
| Breadcrumb | `BreadcrumbList` (em qualquer página interna) |

Valide com [Rich Results Test](https://search.google.com/test/rich-results).

## sitemap.xml e robots.txt

- `app/sitemap.ts` gera `/sitemap.xml` dinâmico — adicione novas rotas no array `routes`.
- `app/robots.ts` gera `/robots.txt` — bloqueia `/api/`, `/_next/`, `/admin/`.

Ao adicionar rotas privadas, **bloqueie em robots.ts** e use `noIndex: true` no `buildMetadata()`.

## URLs canônicas e duplicação

- Defina **uma** URL canônica via env `NEXT_PUBLIC_SITE_URL` (sem barra final).
- Configure redirect 301 de `www` → apex (ou vice-versa) na infra.
- Force HTTPS em produção (header HSTS).
- Use `path` consistente em `buildMetadata()` para evitar canonicals divergentes.

## Conteúdo

- **H1 deve responder à busca** que traz o usuário.
- **Primeiros 100 caracteres do `<main>`** devem conter as palavras-chave principais.
- **Imagens** sempre com `alt` descritivo (não decorativas: descreva; decorativas: `alt=""`).
- **Internal linking**: links contextuais entre páginas relacionadas.
- **Anchor text** descritivo — evite "clique aqui".

## Performance é SEO

Core Web Vitals afetam ranking direto desde 2021. Veja `06-performance-e-core-web-vitals.md`.

## i18n e hreflang

Quando adicionar idiomas, popular `alternates.languages` em `buildMetadata()`:

```ts
alternates: {
  canonical: url,
  languages: {
    "pt-BR": `${siteConfig.url}/pt${path}`,
    "en-US": `${siteConfig.url}/en${path}`,
    "x-default": `${siteConfig.url}${path}`,
  },
},
```

## Ferramentas de validação

- [Google Search Console](https://search.google.com/search-console) — registre o domínio.
- [PageSpeed Insights](https://pagespeed.web.dev/) — Core Web Vitals.
- [Rich Results Test](https://search.google.com/test/rich-results) — JSON-LD.
- [Schema Markup Validator](https://validator.schema.org/) — schema.org.
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly).

## Anti-padrões

❌ Duplicar `<title>` ou `<meta>` no JSX (use `metadata`).
❌ Usar imagens grandes no OG (limite 200 KB, prefira WebP).
❌ Múltiplos `<h1>` por página.
❌ `noindex` em produção sem motivo (verifique `robots` antes de cada deploy).
❌ Texto importante dentro de imagens (Google não lê).
❌ Conteúdo gerado só no client — Googlebot indexa, mas com latência.
