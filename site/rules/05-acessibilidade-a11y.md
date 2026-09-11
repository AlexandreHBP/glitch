# Acessibilidade (WCAG 2.2 AA)

> Acessibilidade não é "extra" — é parte do contrato com o usuário e requisito legal em vários países (Brasil: LBI 13.146/2015).

## Checklist por componente novo

- [ ] Marcação semântica correta (`<button>` não é `<div onClick>`)
- [ ] `aria-label` em ícones sem texto visível
- [ ] Contraste mínimo 4.5:1 para texto normal, 3:1 para texto grande
- [ ] Foco visível e não removido (`outline` ou `ring`)
- [ ] Operável por teclado (Tab, Enter, Esc, setas quando aplicável)
- [ ] Estados anunciados (`aria-expanded`, `aria-selected`, `aria-disabled`)
- [ ] Imagens com `alt` (descritivas) ou `alt=""` (decorativas)
- [ ] Links externos com `rel="noopener noreferrer"` e indicação visual
- [ ] Forms com `<label>` associado a cada `<input>`

## Marcação semântica

Use o elemento HTML correto:

| Em vez de | Use |
|---|---|
| `<div onClick>` | `<button>` ou `<a>` |
| `<div className="title">` | `<h1>` a `<h6>` |
| `<div role="list">` | `<ul>` ou `<ol>` |
| `<span className="link">` | `<a href>` |
| `<div className="form">` | `<form>` |

## Hierarquia de headings

- **Um único `<h1>` por página**, dentro de `<main>`.
- Não pule níveis (`h1` → `h3` ❌).
- Hierarquia reflete estrutura visual e lógica do conteúdo.

## Foco visível

Configurado globalmente em `globals.css`:

```css
:focus-visible {
  @apply outline-none ring-2 ring-brand-400 ring-offset-2 ring-offset-slate-950;
}
```

**Nunca remova `outline`** sem fornecer alternativa visual equivalente.

## Skip link

Já implementado em `app/layout.tsx`. Primeiro elemento focável da página, leva o usuário direto ao `<main id="main">`.

## ARIA — quando usar

> "A primeira regra do ARIA: não use ARIA."

Antes de adicionar `role="..."` ou `aria-*`, pergunte: **existe um elemento HTML nativo que faz isso?**

ARIA é **necessário** para:
- Componentes complexos sem equivalente nativo (combobox, tabs, dialog modal)
- Estados dinâmicos (`aria-expanded`, `aria-busy`, `aria-live`)
- Rotular regiões/landmarks (`aria-labelledby` em `<section>`, `<nav>`)

ARIA é **errado** quando:
- Usado em elementos nativos que já têm a semântica (`<button role="button">` ❌)
- `role="presentation"` em conteúdo significativo
- `aria-label` traduzindo texto já visível (cria duplicação para leitores de tela)

## Formulários

```tsx
<form>
  <label htmlFor="email">Seu e-mail</label>
  <input
    id="email"
    name="email"
    type="email"
    required
    autoComplete="email"
    aria-describedby="email-help"
  />
  <p id="email-help" className="text-sm text-slate-400">
    Não enviaremos spam.
  </p>
</form>
```

- Cada input tem `<label htmlFor>` associado.
- Use `autoComplete` para password managers e UX mobile.
- Erros com `aria-invalid="true"` e mensagem associada via `aria-describedby`.

## Contraste

Verifique com [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/):

- **Texto normal**: 4.5:1
- **Texto grande** (≥18.66px ou ≥14px bold): 3:1
- **Componentes UI/ícones**: 3:1

Atenção a `text-slate-500` em fundo escuro — pode quebrar contraste.

## Movimento

Respeite `prefers-reduced-motion` — já configurado globalmente em `globals.css`. Animações automáticas, parallax e auto-play de vídeo devem desabilitar com a media query.

## Imagens

```tsx
<Image src="/hero.png" alt="Time celebrando lançamento do produto" ... />  // ✅ descritiva
<Image src="/separator.png" alt="" ... />                                   // ✅ decorativa
<Image src="/logo.png" alt="logo logo logo" ... />                         // ❌ ruim
```

## Links externos

```tsx
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
  Documentação
  <span className="sr-only">(abre em nova aba)</span>
</a>
```

## Leitores de tela — utilities Tailwind

- `sr-only` — esconde visualmente mas mantém para screen readers.
- `not-sr-only` — reverte (usado em skip-link no foco).
- `aria-hidden="true"` — esconde de screen readers (use em ícones decorativos).

## Testes manuais mínimos

1. **Navegue só com Tab.** Toda funcionalidade alcançável? Foco sempre visível?
2. **Esc fecha overlays?**
3. **VoiceOver (Mac) / NVDA (Win) / TalkBack (Android)** — leia uma página inteira.
4. **Zoom 200%** — layout quebra? Texto trunca?
5. **Reduzir movimento ligado** — animações desabilitam?

## Ferramentas

- [axe DevTools](https://www.deque.com/axe/devtools/) — extensão Chrome/Firefox.
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) — aba A11y.
- [WAVE](https://wave.webaim.org/) — auditor visual.
- [Polypane](https://polypane.app/) — browser dev com viewports a11y.
