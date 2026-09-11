# Code Review Report - Loja Glitch

## Executive Summary

- **Data da revisão**: 2026-09-11
- **Arquivos revisados**: ~145 arquivos (backend NestJS/TypeORM, frontend Vite/React admin, site Next.js público)
- **Linhas analisadas**: ~12.700 linhas (backend ~4.450, frontend ~4.070, site ~4.200)
- **Conformidade geral**: ⚠️ Parcial — arquitetura e regras de negócio críticas (dinheiro, estoque, autenticação) estão majoritariamente sólidas, mas há dois riscos críticos confirmados (vazamento de segredo e uso de horário local do servidor em lógica de negócio) e múltiplos problemas de qualidade que precisam de correção antes de produção.
- **Veredito**: ❌ **REJECTED**

Este relatório cobre os três repositórios do projeto Glitch: `./backend` (API NestJS/TypeORM), `./frontend` (painel administrativo Vite/React) e `./site` (loja pública Next.js), avaliados contra as regras em `./backend/rules`, `./frontend/rules` e `./site/rules`, e contra os requisitos funcionais em `./todo/feature-glitch-loja.md`.

---

## Verificação dos pontos de atenção reportados pelos desenvolvedores

| Ponto | Veredito |
|---|---|
| `ColumnNumericTransformer` em todas as colunas monetárias | ✅ **Confirmado correto.** Todas as colunas `numeric` do schema (`products.base_price`, `product_variants.price_override`, `orders.total`, `order_items.unit_price`, `order_items.subtotal`) usam o transformer. Não há `SUM()`/`getRawMany()` monetário que escape do transformer (o único `getRawMany`/SQL cru encontrado é um `COUNT(*)::int` em `delete-product.usecase.ts`, não monetário). Teste unitário em `create-order.usecase.spec.ts:122` verifica explicitamente que `89.9 * 2 = 179.8` e não `"89.989.9"`. |
| `CreateOrderUseCase`: lock pessimista via `innerJoinAndSelect` + `setLock('pessimistic_write')` em vez de `LEFT JOIN` | ✅ **Confirmado correto e justificado.** Em `backend/src/modules/orders/use-cases/create-order.usecase.ts:47-52`, o `INNER JOIN` com `product` é necessário porque o PostgreSQL recusa `FOR UPDATE` do lado nullable de um `LEFT JOIN` (erro `FOR UPDATE cannot be applied to the nullable side of an outer join`). A trava é feita em uma única query (`WHERE variant.id IN (:...ids)`) dentro da transação, o que serializa corretamente decrementos concorrentes de estoque sob `READ COMMITTED` (isolamento padrão do Postgres) — a segunda transação bloqueia até a primeira commitar e então lê o `stockQuantity` já atualizado. Isso previne overselling. Observação não-bloqueante: o lock também trava a linha de `product` (efeito colateral do `INNER JOIN` com `FOR UPDATE` sem `OF <tabela>`), o que é aceitável mas aumenta o escopo do lock; e a ordem dos IDs no `IN (...)` vem da ordem de inserção do carrinho do cliente, o que teoricamente poderia causar deadlock em pedidos concorrentes com itens sobrepostos em ordem invertida — risco baixo na prática (o Postgres normaliza a ordem de varredura via índice), mas recomenda-se ordenar `variantIds` antes do lock como prática defensiva. |
| DTOs de pedido nunca aceitam preço do cliente | ✅ **Confirmado.** `create-order-item.dto.ts` e `create-order.dto.ts` não têm nenhum campo de preço; o comentário no topo do arquivo (`create-order-item.dto.ts:1-5`) documenta explicitamente essa regra. O preço é sempre lido do banco em `create-order.usecase.ts:88` (`variant.priceOverride ?? variant.product.basePrice`). |
| `dangerouslySetInnerHTML` em conteúdo de produto | ✅ **Confirmado ausente.** Busca em todo `./site` e `./frontend` encontra apenas 2 usos, ambos em `site/app/layout.tsx:52,58`, injetando JSON-LD estático (`Organization`/`WebSite`) gerado a partir de `site-config.ts`, nunca de dado vindo de API/usuário. A descrição do produto em `site/app/produtos/[slug]/page.tsx` é renderizada como texto puro (comentário no topo do arquivo documenta a decisão). Seguro. |
| Proxy "inerte" em `frontend/vite.config.ts` | ✅ **Não é código morto.** O proxy (`/api`, `/uploads` → `localhost:3000`) só é exercitado se `VITE_API_URL` virar um caminho relativo; em uso normal (`VITE_API_URL` absoluto, conforme `.env.example`) ele nunca é acionado pelo axios, que já usa uma `baseURL` absoluta. O comentário em `vite.config.ts:21-24` documenta claramente o propósito (viabilizar teste atrás de um ingress/reverse proxy). Não há confusão nem risco — é uma configuração legítima e documentada. |
| `VITE_API_URL` incluindo `/api/v1` no `baseURL` | ⚠️ **Violação real da regra, risco prático baixo — ver Achado Médio #1.** A regra `frontend/rules/how-to-consume-api-frontend.md` marca isso como "🚨 CRITICAL" e exige que a versão fique em cada chamada de serviço, nunca no `baseURL`/env var, justamente para permitir migração gradual endpoint a endpoint quando surgir uma v2. O projeto viola isso conscientemente (comentário em `frontend/src/services/api.ts:4-6` reconhece a decisão). Como o painel é uma aplicação única, pequena, com um único backend consumidor, o risco imediato é baixo — mas é uma divergência documentada da regra que deveria ser corrigida se o backend vier a introduzir `/v2/`. Classificado como 🟠 MEDIUM, não crítico. |

---

## Arquivos Revisados (amostra representativa)

**Backend** (112 arquivos `.ts`, ~4.450 linhas):
1. `backend/src/main.ts` - bootstrap, CORS, versionamento, ValidationPipe, sanity check do JWT_SECRET
2. `backend/src/modules/orders/use-cases/create-order.usecase.ts` - use-case crítico (lock pessimista, cálculo de total)
3. `backend/src/modules/orders/use-cases/create-order.usecase.spec.ts` - testes do use-case crítico
4. `backend/src/modules/catalog/entities/*.entity.ts`, `orders/entities/*.entity.ts` - entidades TypeORM e uso do `ColumnNumericTransformer`
5. `backend/src/modules/catalog/dto/*.dto.ts`, `orders/dto/*.dto.ts` - validação com class-validator
6. `backend/src/modules/catalog/*.controller.ts`, `orders/*.controller.ts`, `auth/auth.controller.ts`, `playlist/*.controller.ts`, `uploads/uploads.controller.ts` - todos os 8 controllers do sistema
7. `backend/src/database/migrations/*.ts` - as 3 migrations do schema
8. `backend/src/common/**` - guards, decorators, transformer numérico
9. `backend/.gitignore`, `backend/.env` - configuração de segredos

**Frontend** (~90 arquivos `.ts`/`.tsx`, ~4.070 linhas):
1. `frontend/vite.config.ts` - proxy de desenvolvimento
2. `frontend/src/services/api.ts` - instância axios central, interceptors
3. `frontend/src/services/*.ts` - camada de serviços (produtos, pedidos, categorias, playlist, upload)
4. `frontend/src/pages/admin/ProductFormPage.tsx` - formulário de criação/edição de produto (RF07)
5. `frontend/src/components/form/input/InputField.tsx`, `form/Select.tsx`, `form/switch/Switch.tsx` - componentes de formulário reutilizáveis
6. `frontend/src/components/guards/AdminRoute.tsx` - proteção de rotas
7. `frontend/src/context/AuthContext.tsx` - sessão do admin

**Site** (~45 arquivos `.ts`/`.tsx`, ~4.200 linhas):
1. `site/next.config.ts` - headers de segurança, `remotePatterns`
2. `site/app/layout.tsx` - JSON-LD, analytics
3. `site/contexts/MusicPlayerContext.tsx`, `components/glitch/MusicPlayer.tsx` - player (RN04, não-autoplay)
4. `site/contexts/AuthContext.tsx`, `site/lib/api/client.ts` - sessão do cliente, token JWT
5. `site/app/produtos/[slug]/page.tsx` - detalhe do produto
6. `site/lib/seo.ts`, `site/lib/site-config.ts` - SEO e configuração da marca
7. `site/components/catalog/*`, `components/checkout/CheckoutView.tsx` - fluxo de compra

---

## Found Violations

### 🔴 Critical (2 found)

#### 1. `.gitignore` do backend e do frontend não excluem `.env` puro — segredos reais a um `git add` de serem commitados
- **Arquivo**: `backend/.gitignore` (linhas 38-42) e `frontend/.gitignore` (linhas `*.local`)
- **Regra violada**: `backend/rules/how-to-setup-backend.md` (linhas 343-345 e checklist "Add .env to .gitignore to prevent commit" / "Never commit .env files to version control") e `frontend/rules/how-to-setup-frontend.md` (linhas 420-422 e checklist "`.env` added to `.gitignore`"). Ambas as regras mostram explicitamente que o `.gitignore` deve conter a entrada `.env` (não apenas `.env.local`/`.env.*.local`).
- **Problema**: `backend/.gitignore` só ignora `.env.development.local`, `.env.test.local`, `.env.production.local` e `.env.local` — **não ignora o arquivo `.env` puro**. O mesmo vale para `frontend/.gitignore` (`*.local` não cobre `.env`). Isso foi confirmado com `git check-ignore -v backend/.env frontend/.env site/.env`: apenas `site/.env` é ignorado (via `.env*` em `site/.gitignore`); `backend/.env` e `frontend/.env` **não são ignorados**. Neste momento, `backend/.env` contém em texto puro um `JWT_SECRET` real de produção-like (string hex de 96 caracteres) e `ADMIN_PASSWORD=GlitchAdmin@2026!`. Como todo o diretório `backend/` está atualmente untracked (`git status` mostra `?? backend/`), um simples `git add -A` ou `git add backend/` (fluxo comum de commit) commitaria esse segredo permanentemente no histórico do repositório.
- **Impacto**: Vazamento de segredo de autenticação (JWT_SECRET) e da senha do único usuário administrador do sistema. Uma vez commitado, a rotação exige não só trocar o segredo como também reescrever o histórico do git (ou aceitar que o segredo antigo ficou exposto). Isso é exatamente o cenário que a regra do próprio projeto foi escrita para prevenir ("Problem: .env file accidentally committed to git").
- **Solução**:
  ```gitignore
  # backend/.gitignore e frontend/.gitignore — adicionar:
  .env
  .env.local
  .env.*.local
  ```
  Adicionalmente, como `backend/.env` e `frontend/.env` já existem como arquivos untracked com conteúdo sensível, rodar `git rm --cached` não é necessário (nunca foram commitados), mas é recomendável **trocar o `JWT_SECRET` e a `ADMIN_PASSWORD` antes de qualquer deploy**, já que estiveram em texto puro no ambiente de desenvolvimento compartilhado.

#### 2. Geração do `order_number` usa horário local do servidor (`new Date()`) em vez de UTC
- **Arquivo**: `backend/src/modules/orders/use-cases/generate-order-number.ts:11` — `const year = new Date().getFullYear();`
- **Regra violada**: `backend/rules/how-to-handle-dates-backend-frontend.md` — "Never use `new Date()` for business logic... Backend must use `dayjs.utc()`". Enquadra-se literalmente no critério 🔴 CRITICAL definido para esta revisão: *"Dates without UTC"*.
- **Problema**: O ano usado no prefixo legível do pedido (`GLT-<ano>-0001`, gerado em `create-order.usecase.ts:68` dentro da mesma transação que persiste `created_at` como `timestamptz` em UTC) é calculado a partir do fuso horário local do processo Node, não de UTC. Perto da virada do ano, se o servidor rodar em um fuso horário diferente de UTC (ex.: `America/Sao_Paulo`, UTC-3), o `order_number` gerado pode divergir do ano real em UTC do `created_at` persistido — ex.: um pedido criado em `2027-01-01T01:30:00-03:00` (ainda `2026-12-31T04:30:00Z` em UTC) geraria `GLT-2027-...` enquanto o `created_at` real registra 2026. Isso quebra a garantia de que o número do pedido é consistente com a data real de criação, algo que tanto o admin quanto o cliente usam para conversar sobre o pedido.
- **Solução**:
  ```typescript
  import dayjs from 'dayjs';
  import utc from 'dayjs/plugin/utc';
  dayjs.extend(utc);

  const year = dayjs.utc().year();
  ```

---

### 🟡 High (6 found)

#### 1. Formulário de edição de produto provavelmente exibe campos em branco ao editar (RF07 comprometido)
- **Arquivo**: `frontend/src/components/form/input/InputField.tsx:21-63`, `frontend/src/components/form/Select.tsx:16-24`, `frontend/src/components/form/switch/Switch.tsx:11-18`, usados em `frontend/src/pages/admin/ProductFormPage.tsx:135-139, 238, 258-267, 270-283, 286-298`
- **Regra violada**: `frontend/rules/how-to-create-common-components-frontend.md` — checklist do "Form Input Component": *"Uses forwardRef for form library compatibility"*; exemplo do "Select Dropdown Component" modela um componente totalmente controlado (`value`/`onChange`), não com estado interno desincronizado de `defaultValue`.
- **Problema**: `Input` é um `FC` simples, **não usa `React.forwardRef`** e não declara `ref` em `InputProps`. Ele é usado via `{...register("name")}` (React Hook Form) em `ProductFormPage.tsx:238` e outros campos — `register()` retorna `{ name, onChange, onBlur, ref }`, e como `Input` não repassa `ref` ao `<input>` real, o React nem anexa a referência (aviso "Function components cannot be given refs"). `Select` (`defaultValue`) e `Switch` (`defaultChecked`) guardam o valor em `useState` inicializado uma única vez, sem `useEffect` para ressincronizar quando a prop muda depois da montagem. Como o produto é carregado de forma assíncrona e só então `reset(toFormValues(product))` é chamado (`ProductFormPage.tsx:135-139`), o estado interno do RHF é atualizado corretamente, mas **a UI dos campos de texto/número não é atualizada visualmente** (sem `ref` funcional, RHF não consegue escrever o novo valor no DOM) e os campos `Select`/`Switch` continuam mostrando o placeholder/estado inicial em vez do valor real do produto (categoria, "Publicado").
- **Impacto**: Compromete diretamente RF07 ("Administrador consegue cadastrar, editar e remover produtos pelo painel administrativo" — Must Have, Fase 1) para o fluxo de **edição**. Como o público-alvo do painel é um administrador não-técnico operando sozinho, um formulário de edição que parece vazio é gravíssimo — ele pode achar que os dados sumiram, re-digitar tudo, ou submeter sem perceber que o campo tem um valor "invisível" mantido pelo RHF.
- **Solução**:
  ```tsx
  // InputField.tsx
  import { forwardRef } from "react";
  const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
    { type = "text", ...props }, ref
  ) {
    return <input ref={ref} type={type} {...props} className={inputClasses} />;
  });
  export default Input;
  ```
  Para `Select`/`Switch`, tornar totalmente controlados (receber `value`/`checked` como prop em vez de `defaultValue`/`defaultChecked` + estado interno), como já é o padrão documentado na regra.

#### 2. Colunas monetárias nos DTOs de catálogo não usam `@IsNumber()`
- **Arquivo**: `backend/src/modules/catalog/dto/create-product.dto.ts:29-30` (`basePrice`) e `backend/src/modules/catalog/dto/create-variant.dto.ts` (`priceOverride`)
- **Regra violada**: `backend/rules/how-to-use-data-validation-api-backend.md` (uso de decorators de tipo explícitos do class-validator em todo campo de DTO) e `backend/rules/typescript-patterns-standards.md` (tipagem explícita).
- **Problema**: `basePrice: number` tem apenas `@Min(0)`, sem `@IsNumber()`; o mesmo para `priceOverride?: number` em `CreateVariantDto`. Comparando com `common/dto/pagination-query.dto.ts:13-16`, que corretamente usa `@Type(() => Number)` + `@IsInt()` para `page`/`limit`, fica evidente que o padrão é conhecido no projeto mas não foi aplicado aos campos de preço — justamente os campos mais sensíveis do sistema, dado o próprio comentário do `ColumnNumericTransformer` sobre "o bug número um deste modelo de dados". Mitigante: como `@Min` do class-validator checa `typeof value === 'number'`, um payload não-numérico (string não convertível, array, objeto) ainda falha a validação — mas isso é incidental, não meta explícita do decorator, e a falta de `@IsNumber()` deixa a Swagger/OpenAPI e o contrato do DTO menos explícitos.
- **Solução**:
  ```typescript
  @ApiProperty({ example: 89.9 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  basePrice: number;
  ```

#### 3. Nenhum endpoint documenta `@ApiResponse` — Swagger incompleto em toda a API
- **Arquivo**: todos os 8 controllers (`backend/src/modules/**/*.controller.ts`) — confirmado via `grep -rn "ApiResponse" backend/src` retornando zero ocorrências no projeto inteiro.
- **Regra violada**: `backend/rules/how-to-document-swagger-backend.md` — checklist: *"Response types documented with @ApiResponse"*; Best Practices: *"Document all possible response codes (200, 201, 400, 401, 404, 500)"*.
- **Problema**: Todos os endpoints têm `@ApiTags`/`@ApiOperation`/`@ApiBearerAuth` (quando aplicável), mas nenhum documenta os códigos de resposta possíveis (200/201 de sucesso, 400 de validação, 401/403 de autenticação/autorização, 404 de não encontrado, 409 do `ConflictException` em `CreateOrderUseCase`). Isso é uma lacuna sistemática, não pontual.
- **Solução**: Adicionar `@ApiResponse` nos pontos relevantes, por exemplo:
  ```typescript
  @Post('orders')
  @ApiOperation({ summary: 'Cria um pedido (debita estoque, exige login)' })
  @ApiResponse({ status: 201, description: 'Pedido criado com sucesso' })
  @ApiResponse({ status: 409, description: 'Um ou mais itens estão indisponíveis' })
  createOrder(...) { ... }
  ```

#### 4. Apenas 2 de 25 use-cases têm testes unitários
- **Arquivo**: `backend/src/modules/orders/use-cases/*.spec.ts` (apenas `create-order.usecase.spec.ts` e `change-order-status.usecase.spec.ts` existem)
- **Regra violada**: `backend/rules/how-to-test-use-cases-jest-backend.md` — a regra existe especificamente para padronizar testes unitários de use-cases (`collectCoverageFrom: ['**/*.usecase.ts']`).
- **Problema**: Use-cases com lógica de negócio sensível não têm nenhum teste: `set-variant-stock.usecase.ts`, `delete-product.usecase.ts` (lida com produtos já vendidos), `debit-stock.usecase.ts`/`restore-stock.usecase.ts`/`adjust-stock.usecase.ts` (afetam diretamente a integridade do estoque, RN01/RF04), `login.usecase.ts`/`register-customer.usecase.ts` (autenticação/bcrypt), `change-order-status` transitions em `order-status-transitions.ts`. Apenas o use-case mais crítico (criação de pedido) e a troca de status têm cobertura.
- **Solução**: Priorizar testes para `debit-stock`/`restore-stock`/`adjust-stock` (risco de estoque incorreto) e `register-customer`/`login` (risco de segurança), seguindo o padrão de mocks já estabelecido em `create-order.usecase.spec.ts`.

#### 5. Ausência de CSP/HSTS/COOP no site público, combinada com JWT em `localStorage`
- **Arquivo**: `site/next.config.ts:21-34` (função `headers()`)
- **Regra violada**: `site/rules/07-seguranca-headers-e-csp.md` — tabela "Adicionar em produção" exige `Content-Security-Policy`, `Strict-Transport-Security` e `Cross-Origin-Opener-Policy`; checklist pré-deploy exige "CSP em modo enforcement" e "HSTS habilitado".
- **Problema**: `headers()` só retorna `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` e `X-DNS-Prefetch-Control`. Não há CSP (nem em modo Report-Only) nem HSTS em nenhum lugar do código. Isso é agravado pelo fato de o token JWT do cliente ficar em `localStorage` (`site/contexts/AuthContext.tsx:4-7`, `site/lib/api/client.ts:12`) — decisão consciente e parcialmente mitigada (o projeto não usa `dangerouslySetInnerHTML` em conteúdo dinâmico), mas essa mitigação não cobre scripts de terceiros futuros (tags adicionadas via GTM, uma dependência npm comprometida). Sem CSP, não há segunda camada de defesa para impedir exfiltração do token nesse cenário.
- **Solução**: Adicionar ao mínimo um CSP em modo Report-Only antes de produção:
  ```typescript
  { key: "Content-Security-Policy-Report-Only", value: "default-src 'self'; script-src 'self' https://www.googletagmanager.com; connect-src 'self' https://api.glitch.com.br; frame-ancestors 'none'; base-uri 'self'" }
  ```
  e HSTS condicionado a produção (`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`).

#### 6. Condição de corrida na geração de `order_number` pode derrubar um checkout concorrente com erro 500 cru
- **Arquivo**: `backend/src/modules/orders/use-cases/generate-order-number.ts:14-19`, chamado em `create-order.usecase.ts:68` dentro da mesma transação
- **Regra violada**: `backend/rules/scalable-implementation-pattern-backend.md` (atomicidade e tratamento padronizado de exceção em operações críticas multi-etapa); coerência com o próprio objetivo do lock pessimista já aplicado no mesmo use-case para evitar condições de corrida.
- **Problema**: `generateOrderNumber` faz um `COUNT(*)` (`order.order_number LIKE 'GLT-2026-%'`) **sem nenhum lock**, diferente da consulta de variações (que corretamente usa `setLock('pessimistic_write')`). Sob `READ COMMITTED` (isolamento padrão do Postgres), duas transações de checkout concorrentes podem executar esse `COUNT` ao mesmo tempo, ambas verem a mesma contagem (nenhuma commitou ainda) e tentarem inserir o **mesmo** `order_number` — coluna `UNIQUE` (`orders.order_number VARCHAR(20) NOT NULL UNIQUE`, migration `1757600001000`). A segunda transação falha com uma violação de constraint única não tratada (sem `try/catch` ao redor), surfaceando como erro 500 genérico ao cliente em vez de uma resposta limpa (ex.: 409 com retry).
- **Impacto**: Em um cenário de dois clientes finalizando pedidos no mesmo segundo (plausível mesmo com "dezenas a centenas" de usuários, especialmente perto de um lançamento/drop), um deles recebe um erro genérico e pode perder a compra por completo, mesmo tendo estoque disponível — o oposto do problema de overselling que o lock pessimista foi cuidadosamente desenhado para evitar.
- **Solução**: usar uma sequência do Postgres por ano, uma linha de contador com `SELECT ... FOR UPDATE`, ou capturar a violação de unicidade e tentar novamente com backoff dentro da transação:
  ```typescript
  // Opção simples: sequência dedicada
  const [{ nextval }] = await manager.query(
    `SELECT nextval('order_number_seq_' || $1) AS nextval`, [year],
  );
  ```

---

### 🟠 Medium (23 found)

#### 1. `VITE_API_URL` inclui `/api/v1` no `baseURL` em vez de por chamada
- **Arquivo**: `frontend/src/services/api.ts:14`, `frontend/.env:1`
- **Regra violada**: `frontend/rules/how-to-consume-api-frontend.md` (seção "🚨 CRITICAL - API VERSIONING")
- **Problema**: já detalhado na seção "Verificação dos pontos de atenção" acima. Decisão documentada e consciente, com risco prático baixo dado o tamanho do projeto, mas divergente da regra explícita do projeto.
- **Solução**: mover o prefixo de versão para cada método de serviço (`api.get('/v1/admin/products')`) e remover `/api/v1` do `baseURL`, mantendo apenas `/api`. Se a decisão de manter centralizado for reafirmada pelo time, documentar formalmente como exceção aceita no README do frontend.

#### 2. `ValidationPipe` com `enableImplicitConversion: true`, divergindo da regra
- **Arquivo**: `backend/src/main.ts:69-78`
- **Regra violada**: `backend/rules/how-to-use-data-validation-api-backend.md` — exemplo e checklist definem `enableImplicitConversion: false` ("Don't convert types implicitly").
- **Problema**: O projeto usa `true`, provavelmente para permitir que query params (ex.: `page`, `limit`) cheguem como string e sejam convertidos automaticamente. Isso funciona em conjunto com `@Type(() => Number)` explícito nos DTOs de paginação, então não é uma falha funcional, mas diverge do que a regra documenta como padrão do projeto.
- **Solução**: Manter como está se a equipe considerar necessário para os DTOs de query, mas documentar a exceção; alternativa mais aderente à regra seria manter `false` e confiar apenas em `@Type(() => Number)` (já presente nos DTOs de paginação).

#### 3. Interceptor de 401 faz redirect duro via `window.location.href`
- **Arquivo**: `frontend/src/services/api.ts:36-47`
- **Regra violada**: `frontend/rules/how-to-consume-api-frontend.md` — o exemplo de referência tem o comentário explícito *"Don't use window.location.href here"* / *"Allow component to handle redirection"*.
- **Problema**: O interceptor global faz `window.location.href = "/login"`, forçando reload completo da SPA e perda de estado do React Router, exatamente o cenário que a regra pede para evitar.
- **Solução**: Disparar um evento/callback que o `AuthContext` escute para navegar via `useNavigate()`/`<Navigate>`, preservando o histórico do SPA.

#### 4. Dois arquivos do frontend excedem 300 linhas
- **Arquivo**: `frontend/src/pages/admin/ProductFormPage.tsx` (436 linhas), `frontend/src/pages/admin/PlaylistPage.tsx` (305 linhas)
- **Regra violada**: `frontend/rules/frontend-technology-stack.md` — "Keep component files focused and under 300 lines."
- **Solução**: Extrair sub-formulários (ex.: seção de variações do produto) em componentes próprios.

#### 5. Sem alias de import (`@/*`) configurado no frontend
- **Arquivo**: `frontend/tsconfig.app.json`, `frontend/vite.config.ts` (ausência de `paths`/`resolve.alias`)
- **Regra violada**: `frontend/rules/how-to-setup-frontend.md` (Step 5 — Path Aliases), usado em todos os exemplos de `SUMMARY.md`, `how-to-create-common-components-frontend.md` etc.
- **Problema**: Todo import usa caminho relativo (ex.: `../../../` em `ProductFormPage.tsx`), tornando refactors mais frágeis.
- **Solução**: Configurar `@/*` → `src/*` em `tsconfig.app.json` e `vite.config.ts`.

#### 6. Nomenclatura de services/utils não segue kebab-case + sufixo documentado
- **Arquivo**: `frontend/src/services/authService.ts`, `categoryService.ts`, `orderService.ts`, `playlistService.ts`, `productService.ts`, `uploadService.ts`; `frontend/src/utils/format.ts`, `orderStatus.ts`
- **Regra violada**: `frontend/rules/frontend-technology-stack.md` — "Services use kebab-case with .service.ts suffix (auth.service.ts)", "Utility files use kebab-case (currency.utils.ts)".
- **Solução**: Renomear para `auth.service.ts`, `product.service.ts`, `format.utils.ts` etc. (mudança mecânica, baixo risco).

#### 7. Convenção de nomenclatura de Context/Provider não seguida
- **Arquivo**: `frontend/src/context/AuthContext.tsx`, `ThemeContext.tsx`, `SidebarContext.tsx` (pasta `context/`, não `contexts/`)
- **Regra violada**: `frontend/rules/react-component-naming-pattern-frontend.md` — convenção de arquivo `AuthProvider.tsx` com sufixo Provider e pasta `contexts/` (plural).
- **Solução**: Baixa prioridade — alinhar em um refactor futuro, sem urgência funcional.

#### 8. Upload de arquivos no admin sem validação de tamanho no cliente
- **Arquivo**: `frontend/src/pages/admin/ProductFormPage.tsx:178-192` (`handlePhotoUpload`), `PlaylistPage.tsx:110-124` (`handleAudioChange`)
- **Regra violada**: `frontend/rules/how-to-consume-api-frontend.md` — checklist "Multipart Form Data for File Upload": *"Client-side file size validation implemented before upload"*, *"Upload progress indicator shown"*.
- **Problema**: Só o `accept` do `<input>` restringe o tipo; tamanho e progresso não são tratados no cliente (o backend valida tamanho em `uploads.controller.ts`, então não há risco de segurança, apenas UX pior — erro só aparece depois do upload completo).
- **Solução**: Validar `file.size` antes de enviar e mostrar `onUploadProgress` do axios.

#### 9. Padrão de datas com `dayjs`/`DateDisplay` documentado não é usado
- **Arquivo**: `frontend/src/utils/format.ts:14-19` (usa `Intl.DateTimeFormat` + `new Date()` nativo)
- **Regra violada**: `frontend/rules/how-to-handle-dates-backend-frontend.md` — exige `dayjs` com plugins UTC/timezone e um componente `DateDisplay` reutilizável.
- **Problema**: Funcionalmente correto (a conversão para timezone local do navegador acontece implicitamente), mas diverge do padrão/stack documentado do projeto. `dayjs` não está nem nas dependências do `package.json`.
- **Solução**: Migrar para o padrão documentado se o time quiser manter consistência entre frontend e site (que também não usa `dayjs`, mas isso pode ser aceito como decisão de stack).

#### 10. Arquivos de template não usados (dead code)
- **Arquivo**: `frontend/src/components/form/Form.tsx`, `frontend/src/components/form/input/Checkbox.tsx`
- **Problema**: Sobras do template-base (TailAdmin) nunca importadas em lugar nenhum do projeto (confirmado via grep).
- **Solução**: Remover.

#### 11. `common/index.ts` (barrel file) ausente no frontend
- **Arquivo**: `frontend/src/components/common/` (sem `index.ts`)
- **Regra violada**: `frontend/rules/how-to-create-common-components-frontend.md` — checklist "Exported through common/index.ts barrel file".
- **Solução**: Criar barrel file re-exportando os componentes de `common/`.

#### 12. Uso de `className` com template string e ternário em vez de `cn()`
- **Arquivo**: `site/components/catalog/ProductPurchasePanel.tsx:89-93, 112-116`
- **Regra violada**: `site/rules/04-tailwind-styling-conventions.md` — anti-padrão explícito "classes condicionais com template strings sem helper" (deve usar `cn(...)`, como o resto do código do site já faz consistentemente).
- **Solução**:
  ```tsx
  className={cn(
    "min-w-11 rounded-md border px-3 py-2 text-sm font-medium transition",
    selectedSize === size
      ? "border-wine-bright bg-wine text-bone"
      : "border-white/10 bg-white/5 text-slate-200 hover:border-white/20",
  )}
  ```

#### 13. `text-slate-500` usado em fundo escuro sem verificação de contraste documentada
- **Arquivo**: 16 ocorrências em 11 arquivos do site (`Footer.tsx`, `OrderList.tsx`, `OrderStatusTimeline.tsx`, `LoginForm.tsx`, `RegisterForm.tsx`, `ProductFilters.tsx`, `ProductPurchasePanel.tsx`, `CartView.tsx`, `Hero.tsx`, `CTA.tsx`, `produtos/[slug]/page.tsx`)
- **Regra violada**: `site/rules/05-acessibilidade-a11y.md` — alerta nominal: *"Atenção a `text-slate-500` em fundo escuro — pode quebrar contraste."*
- **Solução**: Auditar cada uso com WebAIM Contrast Checker; trocar por `text-slate-400` onde reprovar o WCAG AA (4.5:1).

#### 14. `remotePatterns` do `next/image` com hostname curinga (`**`)
- **Arquivo**: `site/next.config.ts:16-19`
- **Problema**: `{ protocol: "https", hostname: "**", pathname: "/uploads/**" }` permite que o otimizador de imagem do Next faça proxy-fetch de qualquer host HTTPS. O próprio comentário no código já reconhece: *"Em produção, restrinja ao hostname real do backend"* — mas isso nunca foi aplicado.
- **Solução**: Restringir a `{ protocol: "https", hostname: "<host-real-do-backend>", pathname: "/uploads/**" }` antes do deploy de produção.

#### 15. Porta de dev/start do site diverge entre `package.json`, `Dockerfile` e a própria regra do projeto
- **Arquivo**: `site/package.json` (`next dev -H 0.0.0.0 -p 3001`) vs. `site/rules/09-deploy-e-ambiente.md` (documenta porta `8080`) vs. `site/Dockerfile` (`PORT=8080`, `EXPOSE 8080`)
- **Problema**: Não quebra hoje (o `Dockerfile` roda `node server.js` respeitando `PORT` via env, ignorando os scripts do `package.json`), mas é uma inconsistência de documentação/configuração que pode confundir o próximo desenvolvedor.
- **Solução**: Alinhar a regra `09-deploy-e-ambiente.md` com a porta real (3001) ou padronizar os scripts para 8080.

#### 16. URL hardcoded em `site-config.ts` diverge do campo dinâmico logo acima
- **Arquivo**: `site/lib/site-config.ts:29` (`authors: [{ name: "Glitch", url: "http://localhost:3001" }]`)
- **Regra violada**: `site/rules/01-arquitetura-do-projeto.md` — `site-config.ts` deve ser a única fonte de verdade da marca, sem strings duplicadas.
- **Problema**: Em produção, esse campo de metadata sempre reportará `localhost:3001`, independente de `NEXT_PUBLIC_SITE_URL`.
- **Solução**: Referenciar a mesma variável `url` já computada no arquivo, em vez de repetir a string.

#### 17. Nenhum campo obrigatório de texto usa `@IsNotEmpty()`
- **Arquivo**: `backend/src/modules/catalog/dto/create-product.dto.ts:16-20` (`name`), `create-variant.dto.ts:18-26` (`size`, `color`), `set-variant-stock.dto.ts:13-16` (`reason`) — confirmado via grep que `@IsNotEmpty` não é usado em nenhum DTO do projeto.
- **Regra violada**: `backend/rules/how-to-use-data-validation-api-backend.md` — checklist "`@IsNotEmpty` on required fields".
- **Problema**: `@IsString()` + `@MaxLength()` sozinhos permitem que `name: ""`, `size: ""` ou `reason: ""` passem na validação, criando produtos/variações/movimentos de estoque com campos obrigatórios vazios.
- **Solução**: Adicionar `@IsNotEmpty()` a todos os campos de texto obrigatórios.

#### 18. `role` tipado como `string` genérico no payload JWT, forçando type assertion insegura no guard
- **Arquivo**: `backend/src/common/decorators/current-user.decorator.ts:8-12` (`AuthenticatedUser.role: string`), `backend/src/modules/auth/strategies/jwt.strategy.ts:14-18` (`JwtPayload.role: string`), consumido em `backend/src/common/guards/roles.guard.ts:35` (`requiredRoles.includes(user.role as UserRole)`)
- **Regra violada**: `backend/rules/typescript-patterns-standards.md` — preferir union types a `string` genérico para valores limitados; evitar type assertions que mascaram incompatibilidade de tipos.
- **Problema**: Tipar `role` como `string` no limite do JWT obriga `RolesGuard` a fazer `as UserRole`, exatamente o tipo de asserção que a regra pede para evitar. Tipar como `UserRole` de ponta a ponta remove a necessidade do cast.
- **Adicionalmente**: `backend/src/modules/users/entities/user.entity.ts:31` armazena `role` como `varchar(20)` em vez de um `enum` nativo do Postgres (`backend/rules/how-to-create-typeorm-entity-backend.md` recomenda tipo `enum` para conjuntos de valores fixos como papéis de usuário) — sem essa restrição de schema, um SQL bruto ou bug de migration futuro poderia inserir qualquer string de até 20 caracteres nesse campo sensível à segurança.

#### 19. `StockMovement` não declara as relações `@ManyToOne` que a migration já cria como FK
- **Arquivo**: `backend/src/modules/inventory/entities/stock-movement.entity.ts:20-25` (`productVariantId`, `orderId` são `@Column` simples, sem relação) vs. `backend/src/database/migrations/1757600001000-CreateOrdersTables.ts:71-77` (cria `fk_stock_movements_variant`, `fk_stock_movements_order`)
- **Regra violada**: `backend/rules/how-to-create-typeorm-entity-backend.md` — relacionamentos devem usar `@ManyToOne` + `@JoinColumn` explícito.
- **Problema**: Não é possível usar `relations: ['productVariant']`/`['order']` a partir de `StockMovement` sem joins manuais; os metadados da entidade divergem do schema físico.

#### 20. Colunas de FK em `order_item`/`order_status_history` sem `@Index` na entidade, apesar do índice físico existir
- **Arquivo**: `backend/src/modules/orders/entities/order-item.entity.ts:27,34` (`orderId`, `productVariantId`), `order-status-history.entity.ts:21` (`orderId`) — sem `@Index`, enquanto a migration cria `idx_order_items_order_id`, `idx_order_items_variant_id`, `idx_order_status_history_order_id`.
- **Regra violada**: `backend/rules/how-to-create-typeorm-entity-backend.md` — "Always index foreign keys for join performance."
- **Problema**: Inconsistência interna — `order.entity.ts:27-28` declara corretamente `@Index(...)` para os próprios índices, tornando a omissão nas entidades filhas uma lacuna clara, não uma escolha deliberada.

#### 21. Lógica de geração de SKU duplicada entre dois use-cases
- **Arquivo**: `backend/src/modules/catalog/use-cases/create-product.usecase.ts:69-72` e `update-product.usecase.ts:90-93` — método privado idêntico byte a byte.
- **Problema**: Regra de negócio de geração de SKU precisaria mudar em dois lugares. Já existe precedente de helper compartilhado no projeto (`backend/src/common/utils/slugify.ts`).
- **Solução**: Extrair para `common/utils/generate-sku.ts`.

#### 22. E-mail de login/cadastro não é normalizado (case-sensitive)
- **Arquivo**: `backend/src/modules/auth/use-cases/register-customer.usecase.ts:29-31`, `login.usecase.ts:25` — `findOne({ where: { email } })` sem `.toLowerCase()`/`.trim()`.
- **Problema**: `users.email` é `varchar` `UNIQUE` case-sensitive; `"User@Example.com"` e `"user@example.com"` são tratados como contas distintas, permitindo cadastro duplicado e login inconsistente dependendo da capitalização digitada.
- **Solução**: Normalizar (`email.toLowerCase().trim()`) antes de toda consulta/gravação de e-mail.

#### 23. `PaginatedResponseDto.data` sem `@ApiProperty()`
- **Arquivo**: `backend/src/common/dto/paginated-response.dto.ts:6-7` — `total`/`page`/etc. têm `@ApiProperty()`, mas `data: T[]` não.
- **Regra violada**: `backend/rules/how-to-document-swagger-backend.md` — "@ApiProperty on every DTO field".
- **Problema**: Todo endpoint de listagem (`GET /products`, `GET /admin/orders` etc.) retorna esse envelope sem schema Swagger para o array principal de dados.

---

### 🔵 Low (9 found)

#### 1. `export default` em vez de named exports (frontend)
- **Arquivo**: `Button.tsx`, `Alert.tsx`, `Badge.tsx`, `InputField.tsx`, `TextArea.tsx`, `Select.tsx`, `Switch.tsx`, `Checkbox.tsx`, `Form.tsx`, `PageMeta.tsx`, `PageBreadCrumb.tsx`, entre outros.
- **Regra violada**: `frontend/rules/react-component-naming-pattern-frontend.md` — boa prática (não item obrigatório de checklist) de usar named exports.

#### 2. Inconsistência de casing entre nome de arquivo e componente
- **Arquivo**: `frontend/src/components/common/PageBreadCrumb.tsx` (arquivo com "C" maiúsculo) exporta `PageBreadcrumb` (com "c" minúsculo).

#### 3. GA4 não rastreia `page_view` em navegação client-side (site)
- **Arquivo**: `site/components/analytics/GoogleAnalytics.tsx:24-34`
- **Problema**: `gtag('config', ...)` roda uma vez no load inicial; sem hook em `usePathname()`, navegações via `next/link` no funil de compra (catálogo → produto → carrinho → checkout) não geram novos `page_view`.

#### 4. Canonical do detalhe de pedido não inclui o ID (site)
- **Arquivo**: `site/app/minha-conta/pedidos/[id]/page.tsx:5-10`
- **Problema**: Path fixo `/minha-conta/pedidos` para todo pedido; impacto nulo hoje porque a rota é `noIndex: true` e bloqueada em `robots.ts`, mas é uma inconsistência do `buildMetadata()`.

#### 5. Ausência de `loading.tsx` em rotas com fetch server-side (site)
- **Arquivo**: `site/app/produtos/page.tsx`, `site/app/produtos/[slug]/page.tsx`
- **Problema**: Item recomendado ("considere"), não obrigatório, pela regra `02-nextjs-app-router-rules.md`. Sem skeleton, a navegação pode parecer travada em conexões lentas.

#### 6. `CreateOrderUseCase` não ordena os IDs de variação antes do lock (observação defensiva)
- **Arquivo**: `backend/src/modules/orders/use-cases/create-order.usecase.ts:40-52`
- **Problema**: Não é uma violação de regra nem um bug confirmado — a implementação do lock está correta (ver seção de verificação acima) — mas ordenar `variantIds` (ex.: `.sort()`) antes do `WHERE ... IN` reduziria ainda mais o já baixo risco teórico de deadlock em pedidos concorrentes com itens sobrepostos em ordem diferente.

#### 7. Nenhum controller declara `version: '1'` explicitamente — depende só do `defaultVersion` global
- **Arquivo**: todos os 8 controllers (ex.: `backend/src/modules/orders/orders.controller.ts:29` usa `@Controller()`, sem `{ path: 'orders', version: '1' }`)
- **Regra violada**: `backend/rules/how-to-version-api-backend.md` — "All controllers have explicit version decorators."
- **Avaliação**: Funcionalmente **não é um bug** — `main.ts:67` configura `app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })`, então todas as rotas já resolvem corretamente para `/api/v1/...` hoje (comportamento documentado e suportado pelo próprio NestJS). É, no entanto, uma dependência implícita e frágil: se algum dia um controller `version: '2'` for adicionado ou o `defaultVersion` mudar, toda rota sem decorator explícito muda de URL silenciosamente, sem nenhum sinal no código do controller. Rebaixado de "crítico" (como uma das análises de apoio sugeriu) para 🔵 LOW porque o comportamento em produção está correto hoje — mas vale corrigir por robustez futura.
- **Solução**: `@Controller({ path: 'orders', version: '1' })` em todos os 8 controllers.

#### 8. Guard JWT aplicado duas vezes nas rotas admin
- **Arquivo**: `backend/src/modules/orders/orders-admin.controller.ts:30-31`, `playlist/playlist-admin.controller.ts:31-32`, `catalog/catalog-admin.controller.ts:36-37`, `uploads/uploads.controller.ts:41-42` — cada um repete `@UseGuards(JwtAuthGuard, RolesGuard)`.
- **Problema**: `JwtAuthGuard` já está registrado globalmente via `APP_GUARD` em `app.module.ts`, então reaplicá-lo localmente executa a validação do JWT duas vezes por requisição admin. Duplicação inofensiva, mas desnecessária — poderia virar um decorator composto `@AdminOnly()` aplicando só `RolesGuard` + `@Roles(...)`.

#### 9. Entidades não estendem `SuperEntity` (decisão arquitetural aparentemente deliberada, não um defeito)
- **Arquivo**: `backend/src/database/entities/super.entity.ts` existe mas não é usado por nenhuma das 10 entidades do projeto.
- **Observação**: `backend/rules/how-to-create-typeorm-entity-backend.md` apresenta `SuperEntity` como obrigatório, mas `SuperEntity.id` é `@PrimaryGeneratedColumn()` (inteiro auto-incremento), enquanto **todas** as entidades do projeto usam `@PrimaryGeneratedColumn('uuid')` — uma escolha consistente e razoável para uma API pública de e-commerce (evita enumeração de IDs de produtos/pedidos). Adotar `SuperEntity` como está quebraria esse design. Listado apenas como FYI de divergência de regra documentada, não como problema a corrigir.

---

## Positive Points

- ✅ **Uso disciplinado do `ColumnNumericTransformer`** em 100% das colunas monetárias, com teste unitário dedicado provando que a soma numérica funciona (`179.8`, não `"89.989.9"`).
- ✅ **Lock pessimista correto e bem fundamentado** em `CreateOrderUseCase`, com justificativa técnica precisa (INNER JOIN necessário para `FOR UPDATE` funcionar) e cobertura de teste simulando disputa concorrente pela última peça em estoque.
- ✅ **DTOs de pedido nunca aceitam preço do cliente** — reforçado por comentário explícito no código alertando sobre o risco.
- ✅ **Guard JWT global "secure by default"**: todas as rotas exigem autenticação a menos que explicitamente marcadas com `@Public()`, reduzindo o risco de esquecer de proteger um endpoint novo.
- ✅ **Proteção contra IDOR em pedidos**: `GetOrderUseCase` filtra por `{ id: orderId, userId }`, nunca confiando apenas no ID da URL — com comentário explícito no código sobre esse ser "o furo de autorização mais comum em loja".
- ✅ **`main.ts` recusa subir a aplicação com `JWT_SECRET` fraco ou de exemplo** (`assertJwtSecretIsSafe`), CORS restrito a origens configuráveis, Helmet ativo, rate limit específico (5/min) em login/registro contra força bruta.
- ✅ **Upload de arquivos seguro**: whitelist de mime-type, limite de tamanho, nome de arquivo gerado pelo servidor (nunca o do usuário).
- ✅ **Nenhum uso de `dangerouslySetInnerHTML` em conteúdo vindo de API/usuário**, em todo o projeto (frontend e site).
- ✅ **RN04 (música nunca toca sozinha) implementado com rigor**: `isPlaying` nunca é hidratado do `localStorage`, `preload="none"`, reprodução só dispara por clique explícito — verificado diretamente no código, não apenas no comentário.
- ✅ **Server/Client Components do site bem segregados** (`"use client"` só nas folhas interativas), `generateMetadata` dinâmico correto no detalhe do produto, `prefers-reduced-motion` tratado tanto via CSS global quanto via hook dedicado para o efeito parallax.
- ✅ **Nenhum uso de `any`** em TypeScript em nenhum dos três projetos (backend, frontend, site) — confirmado via grep.
- ✅ **Nenhum arquivo do backend excede 300 linhas** (maior é `create-order.usecase.ts` com 186 linhas).
- ✅ **Migrations consistentes com as entidades**, com `down()` reversível em todas, FKs com `ON DELETE RESTRICT` corretamente aplicadas onde há histórico de vendas a preservar (`order_items.product_variant_id`).
- ✅ **Carrinho/checkout do site nunca envia preço ao backend**, apenas `productVariantId` + `quantity`, com tratamento gracioso de conflito 409 item a item.
- ✅ **Analytics (GA/GTM) corretamente condicionados a env vars**, zero overhead em dev quando não configurados.

---

## Technical Validations Performed

### Database
Não foi executada validação via MCP Postgres nesta revisão (revisão estática de código). A verificação de tipos monetários e do transformer foi feita por leitura direta das entidades e das migrations, confirmando que os tipos `NUMERIC(10,2)` no SQL bruto das migrations (`1757600000000-CreateCatalogTables.ts`, `1757600001000-CreateOrdersTables.ts`) correspondem exatamente às colunas `type: 'numeric', precision: 10, scale: 2` das entidades TypeORM, todas com `transformer: new ColumnNumericTransformer()`.

### Cache/Redis
Não aplicável — o projeto não usa Redis/cache nesta fase (não há referência a `ioredis`/`cache-manager` no `package.json` do backend).

---

## Priority Recommendations

1. **[URGENTE]** Corrigir os `.gitignore` do backend e do frontend para incluir `.env` puro, e trocar o `JWT_SECRET`/`ADMIN_PASSWORD` atuais antes de qualquer deploy, já que estiveram em texto puro em um arquivo não protegido.
2. **[URGENTE]** Trocar `new Date().getFullYear()` por `dayjs.utc().year()` em `generate-order-number.ts`, e tratar a condição de corrida da geração de `order_number` (lock ou sequência dedicada) antes que dois checkouts simultâneos possam derrubar um pedido com erro 500.
3. **[URGENTE]** Corrigir `Input`/`Select`/`Switch` do painel admin para funcionarem corretamente com React Hook Form (`forwardRef` + componentes controlados), validando manualmente que o fluxo de **edição** de produto (RF07) realmente popula os campos.
4. **[IMPORTANTE]** Adicionar `@ApiResponse` em todos os endpoints e `@IsNumber()`/`@IsNotEmpty()` nos campos de DTOs de catálogo que ainda não têm.
5. **[IMPORTANTE]** Ampliar cobertura de testes unitários para os use-cases de estoque (`debit-stock`, `restore-stock`, `adjust-stock`), playlist e autenticação (`login`, `register-customer`).
6. **[IMPORTANTE]** Adicionar CSP (ao menos Report-Only) e HSTS ao `site/next.config.ts` antes do lançamento em produção, dado o uso de JWT em `localStorage`.
7. Reavaliar a decisão de manter `/api/v1` no `baseURL` do frontend — aceitável para o estado atual do projeto, mas documentar formalmente a exceção ou migrar para o padrão da regra.
8. Normalizar e-mail (lowercase/trim) em login e cadastro para evitar contas duplicadas por capitalização.
9. Tratar os demais achados médios/baixos (nomenclatura, arquivos grandes, `remotePatterns` curinga, contraste de texto, relações/índices de entidade divergentes da migration) em um ciclo de qualidade antes do lançamento público.

---

## Quality Metrics

- **Total de violações**: 40
  - 🔴 Critical: 2
  - 🟡 High: 6
  - 🟠 Medium: 23
  - 🔵 Low: 9
- **Taxa de conformidade**: aproximadamente 65-70% (arquitetura de negócio crítica — dinheiro, estoque/overselling, autenticação, autoplay — está majoritariamente correta; as violações concentram-se em qualidade/consistência de código, lacunas de teste/documentação, e duas falhas pontuais porém genuínas: configuração de segredo e uso de horário local em lógica de negócio)
- **Arquivos com violações**: ~42 de ~145 arquivos revisados

---

## Conclusion

As preocupações específicas levantadas pelos próprios desenvolvedores foram todas verificadas e **confirmadas corretas**: o `ColumnNumericTransformer` está em todas as colunas monetárias, o lock pessimista em `CreateOrderUseCase` previne overselling de forma tecnicamente sólida e bem testada (com uma observação defensiva menor sobre ordenação de IDs), os DTOs de pedido nunca aceitam preço do cliente, não há `dangerouslySetInnerHTML` em conteúdo de produto, e o proxy do Vite não é código morto — é uma configuração condicional documentada.

A revisão ampla, no entanto, identificou **dois problemas críticos confirmados**: (1) o `.gitignore` do backend e do frontend não excluem `.env` puro, deixando segredos reais — `JWT_SECRET` e senha do admin — a um `git add` de serem commitados; e (2) a geração do `order_number` usa `new Date()` (horário local do servidor) em vez de UTC para calcular o ano do pedido, em um trecho de código adjacente exatamente à área que os desenvolvedores mais se preocuparam em proteger (a criação de pedidos) — e que, pela mesma falta de lock, tem uma condição de corrida real capaz de derrubar um checkout concorrente com erro 500 (listado como alta severidade).

Além disso, há **6 problemas de alta severidade** que vão de uma regressão funcional real no formulário de edição de produtos (comprometendo RF07, requisito Must-Have da Fase 1) a lacunas sistemáticas de documentação Swagger, validação de DTO e cobertura de testes, além de headers de segurança ausentes no site público.

Dado 2 violações críticas confirmadas e 6 de alta severidade, o veredito é **REJECTED**. Nenhum dos problemas é estrutural ou exige redesenho de arquitetura — a base (módulos, use-cases, entidades, guards, transações) está bem construída e segue os padrões do projeto na maior parte do código, e vários achados médios/baixos são, na prática, decisões deliberadas e razoáveis (UUIDs em vez de `SuperEntity`, enums como `varchar` documentados). Recomenda-se tratar os dois itens críticos, os 6 itens de alta severidade e revalidar antes de nova submissão para revisão, priorizando: rotação de segredos + correção do `.gitignore`, a geração de `order_number` (UTC + condição de corrida), e o bug do formulário de edição de produto, que afeta diretamente o único usuário do painel administrativo.
