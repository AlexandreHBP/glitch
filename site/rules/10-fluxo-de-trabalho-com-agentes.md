# Fluxo de Trabalho com Agentes IA

> Este documento orienta agentes IA (Claude, Cursor, Copilot, Aider, etc.) que vão contribuir com este projeto. Humanos podem ler para entender o que esperar de assistência IA aqui.

## Antes de qualquer mudança, leia

1. `00-leia-me-primeiro.md` — visão geral
2. `01-arquitetura-do-projeto.md` — onde colocar o quê
3. A regra específica do tema (SEO, Tailwind, A11y...)

Não comece a editar sem entender qual regra rege a área.

## Princípios para agentes

### 1. Server-first

Quando criar componentes, **não adicione `"use client"` por hábito**. Avalie:
- Há `useState`/`useEffect`/handler? → client.
- É renderização pura com props? → server.

### 2. Reuse antes de criar

Antes de escrever um componente novo, verifique:
- Existe em `components/ui/`?
- Existe em `components/sections/`?
- Pode ser adaptado com prop `variant`?

Antes de instalar dependência, verifique:
- O Tailwind/Next/React já resolve?
- A função fica em `lib/`?

### 3. SEO é obrigatório

Toda nova página exporta `metadata` via `buildMetadata()`. Sem exceção.

### 4. Não modifique configs sem necessidade

`next.config.ts`, `tailwind.config.ts`, `tsconfig.json` são fundações. Modifique apenas para:
- Adicionar token de design (cor, animação)
- Adicionar header de segurança
- Habilitar feature do framework com justificativa

### 5. Conteúdo em pt-BR

Strings de UI em português brasileiro. Nomes de identificadores em inglês (convenção JS).

### 6. Não introduzir abstrações prematuras

Não crie:
- `useAuth` se só uma página tem auth.
- `BaseLayout` se só `app/layout.tsx` existe.
- Helpers especulativos.

Espere o terceiro caso para abstrair.

## Checklist antes de "concluir" uma tarefa

- [ ] Lint passa (`npm run lint`)
- [ ] Typecheck passa (`npm run typecheck`)
- [ ] Build passa (`npm run build`)
- [ ] Lighthouse local rodou e Performance/A11y/SEO ≥ 90
- [ ] Testei em Chrome **e** Firefox (DevTools mobile + desktop)
- [ ] Naveguei só com teclado — toda funcionalidade alcançável
- [ ] Componentes novos seguem padrões de `08-componentes-e-design-system.md`
- [ ] Páginas novas têm `metadata` e estão no `app/sitemap.ts`

## O que NÃO fazer

❌ **Não use `any`.** Tipar é gratuito.
❌ **Não escreva CSS custom** quando Tailwind resolve.
❌ **Não use `<div onClick>` em vez de `<button>`.**
❌ **Não importe libs gigantes** (moment, lodash inteiro).
❌ **Não edite `next-env.d.ts`** (gerado pelo Next).
❌ **Não commite `.env*`.**
❌ **Não crie comentários óbvios** explicando o que o código faz.
❌ **Não duplique strings de marca** — use `siteConfig`.
❌ **Não crie `AGENTS.md`.** Documentação de regras vai aqui em `rules/` com nome kebab-case descritivo.
❌ **Não desabilite ESLint inline** (`// eslint-disable`) sem comentário justificando.

## Como reportar conclusão

Quando finalizar uma tarefa, comunique:

1. **O que foi feito** (1-2 frases factuais)
2. **Arquivos alterados/criados** (lista)
3. **Como testar** (comando + URL/passo)
4. **Riscos ou decisões** que merecem revisão humana

Evite:
- Resumos longos do que o código faz (o reviewer lê o diff)
- "Tudo funcionando" sem evidência
- Marketing das próprias mudanças

## Quando pedir clarificação

Pergunte ao humano antes de:
- Adicionar dependência nova com peso significativo.
- Mudar visual identitário (cores, fontes, tom).
- Refatorar arquivos fora do escopo da tarefa.
- Tomar decisões arquiteturais novas (rotas, integrações, auth).

Não pergunte para:
- Detalhes de implementação previstos por estas regras.
- Padrões já estabelecidos no código.
