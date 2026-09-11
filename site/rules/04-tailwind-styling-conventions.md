# Convenções de Estilo com TailwindCSS

## Filosofia

- **Tailwind para tudo.** Evite CSS custom até comprovar que utility classes não resolvem.
- **Tokens via `tailwind.config.ts`**, não valores arbitrários.
- **Mobile-first.** Comece sem prefixo (mobile), adicione `sm:`, `md:`, `lg:`, `xl:` para escalar.

## Hierarquia de decisão

1. **Existe utility?** → use (`p-4`, `text-sm`, `bg-brand-600`).
2. **Existe token customizado?** → use (`bg-brand-500`, `font-display`).
3. **Repete em 3+ lugares?** → vire um componente em `components/ui/`.
4. **Padrão CSS legítimo (mask, grid template names)?** → use `@layer components` em `globals.css`.
5. **Último recurso** → classes arbitrárias `[mask:...]` ou estilo inline.

## Tokens de design (definidos em `tailwind.config.ts`)

| Token | Uso |
|---|---|
| `brand-{50..950}` | Cor primária da marca |
| `font-sans` | Texto corrido (Inter) |
| `font-display` | Headings grandes |
| `container` | Centralização com padding responsivo |
| `bg-grid-pattern` | Background decorativo |
| `bg-radial-fade` | Halo radial |
| `animate-fade-up`, `animate-fade-in`, `animate-blob` | Animações de entrada |

## Container

Use a classe utilitária `.container-section` (definida em `globals.css`) para agrupar conteúdo com padding e centralização consistentes:

```tsx
<section className="py-20">
  <div className="container-section">
    {/* conteúdo */}
  </div>
</section>
```

Ou use o componente `<Container>` de `components/ui/Container.tsx`.

## Ordem das classes (recomendada)

Para legibilidade, agrupe na ordem:

1. **Layout/posição**: `flex`, `grid`, `relative`, `absolute`, `inset-*`
2. **Box model**: `w-*`, `h-*`, `p-*`, `m-*`, `gap-*`
3. **Tipografia**: `text-*`, `font-*`, `leading-*`, `tracking-*`
4. **Cor/background**: `bg-*`, `text-{color}`, `border-*`
5. **Bordas/radius/shadow**: `rounded-*`, `border`, `shadow-*`
6. **Estados/transições**: `hover:*`, `focus:*`, `transition-*`, `animate-*`
7. **Responsivo**: `sm:*`, `md:*`, `lg:*` (no final de cada cluster)

Considere instalar [`prettier-plugin-tailwindcss`](https://github.com/tailwindlabs/prettier-plugin-tailwindcss) para ordenação automática.

## Dark mode

Configurado com `darkMode: "class"`. Para suportar tema claro:

```tsx
<div className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
```

O projeto atualmente é **dark-only** — paleta otimizada para fundo escuro. Para abrir suporte completo a `light`, audite contraste em todos os componentes.

## Animações

Definidas em `tailwind.config.ts > extend.animation`. Para novas:

```ts
keyframes: {
  meuEfeito: { "0%": {...}, "100%": {...} },
},
animation: {
  "meu-efeito": "meuEfeito 0.5s ease-out",
},
```

**Sempre** respeite `prefers-reduced-motion` — já tratado globalmente em `globals.css`.

## Quando criar utility custom

Em `globals.css > @layer utilities`:

```css
@layer utilities {
  .text-balance { text-wrap: balance; }
}
```

Use para CSS que ainda não tem utility no Tailwind padrão.

## Quando criar component class

Em `globals.css > @layer components`:

```css
@layer components {
  .btn-primary { @apply bg-brand-600 text-white px-4 py-2 rounded; }
}
```

**Evite** `@apply` excessivo. Prefira componente React com props sobre component class.

## Anti-padrões

❌ `style={{ color: "red" }}` (use Tailwind ou variável CSS)
❌ Valores arbitrários repetidos (`text-[14px]` 5x → adicione token ou use `text-sm`)
❌ CSS modules misturado com Tailwind (escolha um)
❌ Sobrescrever Tailwind com `!important` (refatore o componente)
❌ Classes condicionais com template strings sem helper:
   ```tsx
   className={`${active && "bg-blue-500"} ${disabled && "opacity-50"}`}  // ❌
   className={cn("base", active && "bg-blue-500", disabled && "opacity-50")}  // ✅
   ```
