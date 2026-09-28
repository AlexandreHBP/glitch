# Componentes e Design System

## Anatomia de um componente

```tsx
// components/ui/Card.tsx
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

type CardProps = {
  title: string;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<"article">, "title">;

export function Card({ title, children, className, ...rest }: CardProps) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.02] p-6",
        className
      )}
      {...rest}
    >
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="mt-3 text-sm text-slate-400">{children}</div>
    </article>
  );
}
```

### Padrões obrigatórios

1. **Named exports**, não default. Facilita refactor e auto-import.
2. **Props tipadas explicitamente** com `type` (preferido) ou `interface`.
3. **Spread `...rest`** para permitir extensão sem quebrar a API.
4. **`className` mergeável** via helper `cn()` — nunca sobrescreva, sempre combine.
5. **Polimorfismo via `as` prop** quando o mesmo visual aparecer em vários elementos (exemplo: `<Container as="section">`).

## Hierarquia: ui → layout → sections

| Camada | Exemplos | Reusabilidade |
|---|---|---|
| `ui/` | `Button`, `Container`, `Section`, `Card`, `Input` | Alta — primitivos sem contexto |
| `layout/` | `Header`, `Footer`, `Sidebar` | Média — usado em layouts root |
| `sections/` | `Hero`, `Features`, `CTA`, `FAQ` | Baixa — específicos da LP |

Componentes de `sections/` **podem importar** de `ui/` e `layout/`. O inverso é proibido.

## Composição vs configuração

Prefira **composição** (children) sobre props complexas:

```tsx
// ❌ Configuração — props infláveis
<Card title="X" subtitle="Y" icon="Z" footer={...} actions={...} />

// ✅ Composição — flexível
<Card>
  <Card.Header>
    <Card.Icon>Z</Card.Icon>
    <Card.Title>X</Card.Title>
    <Card.Subtitle>Y</Card.Subtitle>
  </Card.Header>
  <Card.Body>...</Card.Body>
  <Card.Footer>...</Card.Footer>
</Card>
```

## Quando criar um componente novo

Crie quando:
- Mesmo padrão visual aparece **3 ou mais vezes**.
- Há lógica de comportamento que merece encapsulamento (form field com erro, modal).
- Você quer testar isoladamente.

**Não** crie quando:
- É uma única ocorrência sem reuso previsto.
- Apenas para abstrair JSX trivial (uma `<div>` com 2 classes não merece componente).

## Variantes

Use union de strings + lookup map (padrão atual em `Button`):

```tsx
type Variant = "primary" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary: "...",
  secondary: "...",
  ghost: "...",
};

className={cn(base, variants[variant])}
```

Para muitas variantes (5+), considere [`class-variance-authority`](https://cva.style/) ou [`tailwind-variants`](https://www.tailwind-variants.org/).

## Forwarding refs

Quando o componente precisa expor o ref do elemento DOM:

```tsx
import { forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...rest }, ref) => (
    <input ref={ref} className={cn("...", className)} {...rest} />
  )
);
Input.displayName = "Input";
```

## Imagens em componentes

Sempre `next/image` com `alt` significativo. Para SVGs decorativos:

```tsx
<svg aria-hidden="true" className="..." />
```

Para SVGs com semântica:

```tsx
<svg role="img" aria-label="Logo da empresa">...</svg>
```

## Server vs Client component

Veja `02-nextjs-app-router-rules.md`. Regra rápida:
- Server por padrão.
- Marque `"use client"` apenas se usar hooks, state, refs ou event handlers.

## Testes (quando aplicável)

- **Visuais**: Storybook ou Ladle.
- **Unitários**: Vitest + Testing Library.
- **A11y**: `@axe-core/react` em modo dev.
- **E2E**: Playwright para fluxos críticos da LP (form submit, navegação).

## Anti-padrões

❌ Componente mega-genérico que aceita 30 props (`<UniversalCard>`).
❌ Lógica de fetch dentro de um componente UI (mantenha presentational/container split).
❌ Estado global para coisas locais (use `useState`).
❌ `any` em props — sempre tipar.
❌ Inline styles que poderiam ser Tailwind.
❌ Componentes em `app/` em vez de `components/` (exceto `loading.tsx`, `error.tsx`, `not-found.tsx` que são convenções do framework).
