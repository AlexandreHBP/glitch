# Regras do Next.js App Router

## Server Components por padrão

Todo arquivo em `app/` e `components/` é **server component** a menos que comece com `"use client"`. Isso é deliberado:

- **Server**: zero JS no cliente, fetch direto no servidor, acesso a env vars privadas.
- **Client**: interatividade (estado, efeitos, handlers, hooks de browser).

### Quando usar `"use client"`

Use **apenas** quando o componente tem:
- `useState`, `useReducer`, `useEffect`, `useRef`
- Event handlers (`onClick`, `onSubmit`, `onChange`...)
- APIs de browser (`window`, `document`, `localStorage`)
- Bibliotecas que dependem de browser (Framer Motion, etc.)

### Padrão recomendado: client leaf, server pai

```tsx
// app/page.tsx (server)
import { ContactForm } from "@/components/sections/ContactForm";

export default function Page() {
  return (
    <main>
      <h1>Contato</h1>            {/* server */}
      <ContactForm />              {/* client (folha) */}
    </main>
  );
}
```

Mantenha o componente client o **menor possível**. Não eleve a árvore inteira só porque um botão precisa de `onClick`.

## Metadata API

**Toda** `page.tsx` exporta `metadata`:

```tsx
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Preços",
  description: "Planos e preços transparentes.",
  path: "/precos",
});
```

Nunca defina `<title>` ou `<meta>` manualmente em JSX — sempre via `metadata` ou `generateMetadata()` para rotas dinâmicas.

### `generateMetadata` para rotas dinâmicas

```tsx
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const post = await fetchPost(params.slug);
  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${params.slug}`,
    image: post.coverImage,
  });
}
```

## Viewport API (separado de metadata)

A partir do Next 14, `viewport` e `themeColor` são exportados separadamente:

```tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [...],
};
```

Já feito em `app/layout.tsx` — basta replicar se criar layouts aninhados.

## Route Handlers (`app/api/`)

```ts
// app/api/contact/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  // valide com zod, processe, salve...
  return NextResponse.json({ ok: true });
}
```

- Use `NextResponse` para respostas tipadas.
- **Sempre** valide o body com schema (zod, valibot).
- Nunca confie em headers do client para auth — use sessão/JWT.

## Loading e Error UI

Em cada rota não-trivial, considere:

- `loading.tsx` — Suspense fallback durante streaming
- `error.tsx` — boundary de erro local
- `not-found.tsx` — quando `notFound()` for chamado

Já temos `app/error.tsx` e `app/not-found.tsx` globais.

## `Link` vs `<a>`

- **Navegação interna** → `<Link href="/...">` (prefetch automático)
- **Âncora interna na mesma página** → `<a href="#secao">`
- **Link externo** → `<a href="https://..." rel="noopener noreferrer" target="_blank">`

## `Image` em vez de `<img>`

```tsx
import Image from "next/image";

<Image
  src="/hero.png"
  alt="Descrição clara"
  width={1200}
  height={630}
  priority   // só na imagem above-the-fold
/>
```

Sem `width`/`height` ou `fill`, o build falha. Imagens externas precisam ser permitidas em `next.config.ts > images.remotePatterns`.

## Fontes

Use `next/font` para fontes auto-hospedadas com zero CLS:

```tsx
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-sans" });
```

Atualmente carregamos Inter via `<link>` no `<head>` para simplicidade — migre para `next/font` se Lighthouse acusar CLS de fonte.
