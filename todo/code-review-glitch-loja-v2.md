# Code Review Report - Loja Glitch (Rodada 2)

## Executive Summary

- **Data da revisão**: 2026-09-11
- **Revisão anterior**: `./todo/code-review-glitch-loja.md` (REJECTED — 2 Critical, 6 High, 23 Medium, 9 Low)
- **Arquivos revisados**: ~247 arquivos TypeScript/TSX (backend 123, frontend 61, site 63, sob `src`/`app`/`components`/`lib`/`contexts`) + regras completas em `./backend/rules`, `./frontend/rules`, `./site/rules`
- **Linhas analisadas**: ~13.640 linhas (backend ~5.270, frontend ~4.170, site ~4.200)
- **Conformidade geral**: ✅ Os 2 críticos e a maioria dos altos da rodada 1 foram genuinamente corrigidos, com verificação em runtime (não apenas leitura de código) nos dois pontos mais sensíveis (condição de corrida do `order_number` e formulário de edição de produto). A varredura completa desta rodada encontrou 1 alto novo (não relacionado às correções) e nenhum crítico novo.
- **Veredito**: ✅ **APPROVED** (com ressalvas — ver "Priority Recommendations")

Este relatório cobre novamente os três repositórios do projeto Glitch: `./backend` (API NestJS/TypeORM), `./frontend` (painel administrativo Vite/React) e `./site` (loja pública Next.js). Metodologia: (1) verificação item a item dos 2 críticos e 6 altos da rodada 1 lendo o código atual e, quando aplicável, testando em runtime contra o banco de dados real; (2) nova varredura completa e independente de todo o código (não apenas dos arquivos citados na rodada 1) contra as regras atualizadas em `./backend/rules`, `./frontend/rules`, `./site/rules` e os requisitos de `./todo/feature-glitch-loja.md`.

---

## Verificação dos 2 Critical e 6 High da Rodada 1

| # | Sev. | Achado da Rodada 1 | Status | Evidência |
|---|---|---|---|---|
| C1 | 🔴 Critical | `.gitignore` do backend/frontend não excluíam `.env` puro; segredos reais expostos | ✅ **CORRIGIDO** | `backend/.gitignore:39` e `frontend/.gitignore:16` agora têm a entrada `.env`. Confirmado com `git check-ignore -v backend/.env frontend/.env` → ambos ignorados. `git log --all --full-history -- '**/.env'` retorna vazio (nunca commitado). Segredos comparados byte a byte com a rodada 1: `JWT_SECRET`, `POSTGRES_PASSWORD` e `ADMIN_PASSWORD` têm valores **diferentes** dos vistos na rodada 1 — rotação real confirmada, não é o mesmo `.env` antigo. |
| C2 | 🔴 Critical | `order_number` gerado com `new Date().getFullYear()` (horário local) em vez de UTC | ✅ **CORRIGIDO** | `backend/src/modules/orders/use-cases/generate-order-number.ts:19-28` importa `dayjs`+`dayjs/plugin/utc` e usa `dayjs.utc().year()`. Comentário no topo do arquivo documenta a correção. |
| H1 | 🟡 High | Formulário de edição de produto exibia campos em branco (Input/Select/Switch sem `forwardRef`/controlados) | ✅ **CORRIGIDO** | `Input` (`InputField.tsx:30-97`) agora usa `React.forwardRef`. `Select`/`Switch` aceitam `value`/`checked` controlados com `useEffect` de resync (`Select.tsx:33-39`, `Switch.tsx:26-32`). `ProductFormPage.tsx:279-304` usa `Controller` do RHF passando `value`/`checked` explicitamente. Verificado que nenhuma outra tela reintroduziu o bug (ver seção Frontend abaixo). |
| H2 | 🟡 High | DTOs de catálogo sem `@IsNumber()`/`@IsNotEmpty()` | ✅ **CORRIGIDO** | `create-product.dto.ts` (`name` com `@IsNotEmpty()`, `basePrice` com `@IsNumber({maxDecimalPlaces:2})`), `create-variant.dto.ts` (`size`/`color` com `@IsNotEmpty()`, `priceOverride` com `@IsNumber()`), `set-variant-stock.dto.ts` (`reason` com `@IsNotEmpty()`). Grep em todos os 17 arquivos de DTO do backend não encontrou mais nenhum campo obrigatório de texto sem `@IsNotEmpty()`. |
| H3 | 🟡 High | Nenhum endpoint documentava `@ApiResponse` (0/8 controllers) | ⚠️ **PARCIALMENTE CORRIGIDO** | `catalog-admin.controller.ts`, `auth.controller.ts`, `orders.controller.ts`, `orders-admin.controller.ts` (4 de 8) agora documentam `@ApiResponse` em todos os endpoints. Mas `catalog.controller.ts` (3 endpoints), `playlist.controller.ts` (1), `playlist-admin.controller.ts` (4) e `uploads.controller.ts` (2) — **10 endpoints no total** — continuam com zero `@ApiResponse`. Ver 🟡 High #1 abaixo. |
| H4 | 🟡 High | Apenas 2 de 25 use-cases com testes unitários | ⚠️ **MELHOROU SIGNIFICATIVAMENTE, AINDA INCOMPLETO** | Agora 7 de 26 use-cases têm `.spec.ts`: `login`, `register-customer`, `debit-stock`, `restore-stock`, `adjust-stock`, `create-order`, `change-order-status` — exatamente os 5 priorizados pela recomendação da rodada 1, mais os 2 já existentes. **Rodei a suite real**: `npx jest` → `Test Suites: 7 passed, 7 total / Tests: 33 passed, 33 total`, confirmando a alegação "33/33 passando". Porém `set-variant-stock.usecase.ts` (ajuste de estoque absoluto) e `delete-product.usecase.ts` (produtos já vendidos) — ambos citados nominalmente como prioridade na rodada 1 — continuam sem teste, junto com mais 17 use-cases de menor risco. Ver 🟡 High #2 abaixo. |
| H5 | 🟡 High | Ausência de CSP/HSTS no site público | ✅ **CORRIGIDO** | `site/next.config.ts:31-71`: `Content-Security-Policy-Report-Only` construído dinamicamente a partir de `NEXT_PUBLIC_API_URL`, e `Strict-Transport-Security` adicionado condicionalmente quando `NODE_ENV === "production"`. Exatamente a solução Report-Only sugerida pela rodada 1 e alinhada com `site/rules/07-seguranca-headers-e-csp.md` ("Comece em modo Report-Only e migre para enforcement quando estável"). Ressalva nova: `script-src` usa `'unsafe-inline'` em vez de nonce — ver 🟠 Medium (site) #2. |
| H6 | 🟡 High | Condição de corrida na geração de `order_number` (COUNT sem lock) | ✅ **CORRIGIDO E TESTADO EM RUNTIME** | Nova tabela `order_number_sequences` (migration `1757600003000`) + `INSERT ... ON CONFLICT (year) DO UPDATE ... RETURNING` atômico em `generate-order-number.ts:31-40`. **Testei diretamente contra o Postgres real do ambiente** (não apenas lido o código): disparei 20 requisições concorrentes via `Promise.all` contra a mesma query atômica usada pelo use-case → **20 números únicos e sequenciais, zero colisões**. Também confirmei que a tabela `orders` real não tem `order_number` duplicado (`SELECT order_number, count(*) ... HAVING count(*) > 1` → vazio) e que a migration fez backfill correto do contador a partir de pedidos pré-existentes. |

**Resumo**: dos 2 críticos, **2/2 corrigidos**. Dos 6 altos, **4/6 totalmente corrigidos**, **2/6 parcialmente corrigidos** (Swagger e cobertura de testes — ambos com progresso real e substancial, mas não completos). Nenhuma correção foi apenas cosmética ou "de fachada": as duas mais sensíveis (condição de corrida monetária/estoque e formulário de edição) foram verificadas com evidência de execução real, não só leitura de código.

---

## Nova Varredura Completa (todos os três repositórios)

Metodologia: releitura integral de `./backend/rules` (26 arquivos), `./frontend/rules` (12 arquivos) e `./site/rules` (12 arquivos), comparada arquivo a arquivo contra todo o código-fonte atual — incluindo arquivos não citados na rodada 1 (ex.: `order_number_sequences` migration, `get-admin-product-by-id.usecase.ts`, `UnauthorizedHandler` em `App.tsx`).

### 🔴 Critical (0 found)

Nenhum problema crítico novo foi encontrado em nenhum dos três repositórios nesta rodada.

---

### 🟡 High (3 found)

#### 1. `@ApiResponse` ainda ausente em 4 de 8 controllers do backend (10 endpoints)
- **Arquivo**: `backend/src/modules/catalog/catalog.controller.ts:25,31,37` (3 endpoints públicos), `backend/src/modules/playlist/playlist.controller.ts:17` (1 endpoint público), `backend/src/modules/playlist/playlist-admin.controller.ts:42,48,54,63` (4 endpoints admin), `backend/src/modules/uploads/uploads.controller.ts:47,62` (2 endpoints admin)
- **Regra violada**: `backend/rules/how-to-document-swagger-backend.md` — checklist "Response types documented with @ApiResponse for each possible status code".
- **Problema**: É a continuação direta do achado High #3 da rodada 1. O time corrigiu exatamente os 4 controllers de maior volume de tráfego/risco (catálogo admin, pedidos, auth), mas os outros 4 — incluindo os dois controllers 100% públicos do catálogo (`GET /products`, `GET /products/:slug`, `GET /categories`, `GET /playlist`) — continuam sem nenhuma documentação de resposta.
- **Impacto**: Consumidores da API (o próprio frontend/site, ou uma futura integração) não têm no Swagger nenhuma indicação de que `GET /products/:slug` pode devolver 404, ou que `POST /admin/uploads/image` pode devolver 400 por tipo de arquivo inválido.
- **Solução**:
  ```typescript
  @Get('products/:slug')
  @ApiOperation({ summary: 'Detalhe do produto com variações e estoque' })
  @ApiResponse({ status: 200, description: 'Produto encontrado' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  getProduct(@Param('slug') slug: string) { ... }
  ```

#### 2. Use-cases de estoque/catálogo sensíveis ainda sem teste unitário
- **Arquivo**: `backend/src/modules/catalog/use-cases/set-variant-stock.usecase.ts`, `backend/src/modules/catalog/use-cases/delete-product.usecase.ts` (mais 17 use-cases de menor risco: listagens, `get-order`, `get-order-admin`, playlist CRUD)
- **Regra violada**: `backend/rules/how-to-test-use-cases-jest-backend.md` — meta de cobertura próxima de 100% para `*.usecase.ts`.
- **Problema**: A rodada 1 recomendou explicitamente priorizar `debit-stock`/`restore-stock`/`adjust-stock` (feito) e `login`/`register-customer` (feito), mas também citou nominalmente `set-variant-stock.usecase.ts` ("lida com estoque") e `delete-product.usecase.ts` ("lida com produtos já vendidos") como use-cases de risco. Nenhum dos dois ganhou teste. Cobertura total: 7/26 (27%), contra 2/25 (8%) da rodada 1 — progresso real, mas a regra do projeto pede cobertura ampla, não só dos 5 casos mais óbvios.
- **Impacto**: `SetVariantStockUseCase` permite que o admin sobrescreva o estoque absoluto de uma variação — um bug aqui (ex.: não gravar `stock_movements`, ou permitir valor negativo) corromperia diretamente o RN01 (controle de estoque por variação) sem qualquer rede de segurança automatizada. `DeleteProductUseCase` decide entre apagar de verdade ou apenas inativar um produto já vendido — errar essa decisão quebra o histórico de pedidos (`order_items` com FK `RESTRICT`).
- **Solução**: seguir o padrão de mocks já estabelecido em `debit-stock.usecase.spec.ts`, cobrindo pelo menos: `set-variant-stock` (quantidade negativa rejeitada, `stock_movements` gravado com `reason`), `delete-product` (produto sem pedidos é apagado, produto com pedidos é inativado).

#### 3. Diretório `public/` do site não existe — quebra assets de SEO/PWA e o build Docker documentado
- **Arquivo**: `site/public/` (ausente) — referenciado por `site/lib/seo.ts:84-89` (`favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, `manifest`), `site/lib/site-config.ts:43` (`ogImage: "/og-image.png"`), `site/app/manifest.ts:18-21` (`icon-192.png`, `icon-192-maskable.png`, `icon-512.png`, `icon-512-maskable.png`), e `site/Dockerfile:95` (`COPY --from=builder --chown=nextjs:nodejs /app/public ./public`)
- **Regra violada**: `site/rules/01-arquitetura-do-projeto.md` (estrutura esperada do projeto inclui `public/` com `favicon.ico`, `og-image.png`, `icon-{192,512}.png`) e `site/rules/09-deploy-e-ambiente.md` (checklist pré-deploy: "og-image.png existe em public/", "Favicon, apple-touch-icon, manifest icons presentes").
- **Problema**: Confirmado com `ls site/public` → `No such file or directory`. Não é um `.gitignore` escondendo o diretório (`site/.gitignore` não menciona `public`) — o diretório genuinamente não foi criado. Todo o código que referencia esses arquivos está correto e completo; só faltam os arquivos físicos.
- **Impacto**: (1) Favicon, ícone da PWA e `apple-touch-icon` 404 em produção. (2) Toda vez que um link do site for compartilhado (WhatsApp, Instagram, Twitter — canais plausíveis para uma marca "alternativa/underground" como a Glitch), o preview de Open Graph fica quebrado porque `og-image.png` não existe, prejudicando diretamente o KPI do projeto "Experiência visual reconhecida como diferencial da marca" (`feature-glitch-loja.md`, Métricas de Sucesso). (3) Mais grave: `Dockerfile:95` faz `COPY ... /app/public ./public` no estágio final da imagem — com `public/` ausente do contexto de build, esse `COPY` falha e **o build Docker documentado em `site/rules/09-deploy-e-ambiente.md` quebra por completo**, impedindo qualquer deploy pelo caminho oficial do projeto.
- **Solução**: criar `site/public/` com, no mínimo, `favicon.ico`, `og-image.png` (1200×630px conforme convenção OG), `apple-touch-icon.png` (180×180px) e os 4 ícones de manifest (`icon-192.png`, `icon-192-maskable.png`, `icon-512.png`, `icon-512-maskable.png`), usando a identidade visual já definida (vinho `#670001`) e a ovelha negra como possível elemento de marca. Validar com `docker build` local antes do próximo deploy.

---

### 🟠 Medium (13 found — 9 recorrentes da rodada 1, 4 novos)

#### Recorrentes (não corrigidos desde a rodada 1)

1. **`/api/v1` ainda no `baseURL` do axios** — `frontend/src/services/api.ts:19`. Decisão documentada no próprio código, mas segue divergindo de `frontend/rules/how-to-consume-api-frontend.md` (seção "🚨 CRITICAL - API VERSIONING").
2. **`ValidationPipe.enableImplicitConversion: true`** — `backend/src/main.ts:89`, diverge de `backend/rules/how-to-use-data-validation-api-backend.md`.
3. **`StockMovement` sem `@ManyToOne`** — `backend/src/modules/inventory/entities/stock-movement.entity.ts:20-25` ainda usa `@Column` simples para `productVariantId`/`orderId`, apesar da FK física existir na migration. Nota: `OrderItem` e `OrderStatusHistory`, que tinham o mesmo problema na rodada 1, **foram corrigidos** e agora usam `@ManyToOne`/`@JoinColumn` corretamente — `StockMovement` ficou para trás.
4. **`role` tipado como `string` genérico + cast `as UserRole`** — `backend/src/common/decorators/current-user.decorator.ts:11`, `jwt.strategy.ts:17`, consumido com cast em `roles.guard.ts:35`.
5. **`ProductFormPage.tsx` cresceu para 458 linhas** (era 436 na rodada 1 — piorou) e `PlaylistPage.tsx` segue em 305 linhas, ambos acima do limite de `frontend/rules/frontend-technology-stack.md` ("under 300 lines").
6. **Sem path alias `@/*` no frontend** — `frontend/tsconfig.app.json`/`vite.config.ts` sem `paths`/`resolve.alias` (o site, por comparação, já tem o alias configurado corretamente).
7. **Nomenclatura de services/utils do frontend** ainda em camelCase (`authService.ts` em vez de `auth.service.ts`).
8. **`className` com template string em vez de `cn()`** — `site/components/catalog/ProductPurchasePanel.tsx:89-93,112-116`, único arquivo do site que não segue o padrão (confirmado: o resto do site usa `cn()` consistentemente, e este arquivo nem importa o helper).
9. **`text-slate-500` em fundo escuro sem auditoria de contraste** — ainda 15 ocorrências em 11 arquivos do site (`site/rules/05-acessibilidade-a11y.md` alerta nominalmente sobre esse padrão; contraste estimado ~3.9:1, abaixo do WCAG AA de 4.5:1 para texto normal).

#### Novos (encontrados nesta rodada, não relacionados às correções pedidas)

10. **Rota do manifest não bate com a referenciada em `lib/seo.ts`** — `site/lib/seo.ts:89` aponta `manifest: "/site.webmanifest"`, mas `site/app/manifest.ts` (convenção do App Router) é servido em `/manifest.webmanifest`. O `<link rel="manifest">` gerado 404 independentemente do achado High #3 acima.
11. **CSP com `script-src 'unsafe-inline'`** — `site/next.config.ts:40`. O próprio comentário do código diz que a CSP existe "como segunda camada de defesa para o JWT do cliente" em `localStorage`, mas `'unsafe-inline'` permite que qualquer `<script>` injetado (XSS refletido, dependência npm comprometida) execute sem sequer ser bloqueado em modo enforcement futuro. Causado pelos scripts inline de GA/GTM sem nonce (`GoogleAnalytics.tsx:24-34`, `GoogleTagManager.tsx:16-24`). `site/rules/07-seguranca-headers-e-csp.md` já mostra o padrão correto (`'nonce-{NONCE}' 'strict-dynamic'` via middleware).
12. **`Cross-Origin-Opener-Policy` ainda ausente** — `site/next.config.ts:50-64`. A rodada 1 listou CSP+HSTS+COOP juntos como um único achado High; CSP e HSTS foram corrigidos, mas COOP (`same-origin`) — recomendado por `site/rules/07-seguranca-headers-e-csp.md` e de baixo risco de quebra (ao contrário de COEP) — não foi adicionado.
13. **Nenhum JSON-LD `Product` nas páginas de produto** — `site/app/produtos/[slug]/page.tsx` só herda o JSON-LD global (`Organization`/`WebSite`) de `layout.tsx`; `site/rules/03-seo-best-practices.md` lista explicitamente `Produto → Product` na tabela de quando adicionar JSON-LD por página, e a página já tem todos os dados necessários (preço, estoque, imagens, nome) para o schema.

---

### 🔵 Low (7 found)

1. **GA4 não rastreia `page_view` em navegação client-side** — `site/components/analytics/GoogleAnalytics.tsx:24-34`, sem `usePathname()`. Recorrente da rodada 1.
2. **Canonical de pedido/confirmação sem o ID** — `site/app/minha-conta/pedidos/[id]/page.tsx`, `site/app/pedido-confirmado/[id]/page.tsx`. Impacto nulo (rotas `noIndex`). Recorrente.
3. **Nenhum controller declara `version: '1'` explicitamente** (depende do `defaultVersion` global). Funciona hoje, mas frágil a longo prazo. Recorrente, rebaixado a Low como na rodada 1.
4. **`JwtAuthGuard` reaplicado localmente** nos 4 controllers `/admin/*`, redundante com o guard global. Recorrente.
5. **Dead code**: `frontend/src/components/form/Form.tsx` e `Checkbox.tsx` seguem sem nenhum import em todo o projeto. Recorrente.
6. **Valor de contexto não memoizado** em `frontend/src/context/SidebarContext.tsx:66-84` (novo objeto a cada render) — achado novo, impacto prático baixo dado o tamanho do app.
7. **Nenhum banner de consentimento de cookies** para GA4/GTM (`site/rules/11-analytics-e-tracking.md`) — hoje inofensivo porque as env vars de analytics estão vazias em dev, mas não há nenhuma trava de código impedindo que alguém ative `NEXT_PUBLIC_GA_ID` em produção sem consentimento (risco latente de LGPD, não uma violação ativa hoje).

---

## Positive Points

- ✅ **Os dois críticos da rodada 1 foram corrigidos de forma robusta, não superficial**: a correção do `order_number` não só trocou `new Date()` por `dayjs.utc()`, como também resolveu a condição de corrida relacionada com uma tabela de contador dedicada — testei isso diretamente contra o Postgres real com 20 inserções concorrentes e obtive 20 números únicos, sem colisão.
- ✅ **Correção do formulário de edição de produto foi completa e sem efeitos colaterais**: `forwardRef` em `Input`, padrão controlado em `Select`/`Switch`, e verificação de que nenhuma outra tela do painel (Pedidos, Playlist) reintroduziu o mesmo bug — inclusive o caso de `PlaylistPage.tsx` que ainda usa `defaultChecked` em vez de `checked` é seguro porque o `Modal` desmonta o formulário completamente entre edições.
- ✅ **401 handling do frontend migrado para evento customizado** (`auth:unauthorized` + `UnauthorizedHandler` dentro do Router), corrigindo o achado Medium #3 da rodada 1 (`window.location.href` cru) — não era exigido, mas foi corrigido de qualquer forma.
- ✅ **Normalização de e-mail** (`toLowerCase().trim()`) adicionada em login e cadastro, corrigindo o achado Medium #22 da rodada 1.
- ✅ **`PaginatedResponseDto.data`** ganhou `@ApiProperty`, SKU deduplicado em `common/utils/generate-sku.ts`, `OrderItem`/`OrderStatusHistory` ganharam relações `@ManyToOne` corretas — três achados Medium da rodada 1 resolvidos sem terem sido pedidos explicitamente no relato do time.
- ✅ **Suite de testes real e verificada em execução**: 33/33 passando, cobrindo exatamente os use-cases de maior risco financeiro/estoque/segurança apontados na rodada 1.
- ✅ **Nenhum uso de `any`** em TypeScript nos três projetos (confirmado via grep nesta rodada, backend/frontend/site).
- ✅ **Nenhum arquivo do backend excede 300 linhas** (maior é `create-order.usecase.ts`, 190 linhas).
- ✅ **CSP/HSTS do site seguem exatamente a recomendação da própria regra do projeto** (Report-Only antes de enforcement), e `remotePatterns` do `next/image` não usa mais hostname curinga — corrigido junto com a correção pedida, mesmo sem ter sido um achado High isolado.
- ✅ **RN04 (música nunca toca sozinha) revalidado**: `isPlaying` nunca hidratado de `localStorage`, `preload="none"`, disparo só por clique explícito.
- ✅ **Nenhum SQL injection**: todas as queries cruas usam parâmetros posicionais (`$1`, `$2`), nunca concatenação de string, incluindo os arquivos novos desta rodada (`generate-order-number.ts`).
- ✅ **IDOR seguem protegidos**: `get-order.usecase.ts` e `list-my-orders.usecase.ts` filtram por `userId`, não apenas pelo ID da URL.

---

## Technical Validations Performed

### Database
Validação em runtime executada contra o Postgres real do ambiente de desenvolvimento (não apenas leitura estática de código):
- Conectado via `pg.Client`/`pg.Pool` diretamente (`postgresql://postgres:***@localhost:5432/postgres`), confirmadas as 12 tabelas do schema, incluindo a nova `order_number_sequences`.
- **Teste de concorrência real**: disparadas 20 chamadas simultâneas (`Promise.all`) da mesma query atômica usada por `generateOrderNumber` (`INSERT ... ON CONFLICT (year) DO UPDATE SET last_number = last_number + 1 RETURNING last_number`) contra um ano de teste isolado (9999, limpo antes/depois). Resultado: 20 valores únicos e sequenciais (1 a 20), zero colisões — confirma que a correção do achado High #6 da rodada 1 funciona sob concorrência real, não só na leitura do código.
- Inspecionados os pedidos reais já existentes na base (`GLT-2026-0001`, `GLT-2026-0002`) — sem `order_number` duplicado, e a tabela `order_number_sequences` (`last_number = 13` para 2026) confirma que o contador está ativo e à frente dos pedidos existentes (gaps no contador são esperados e inofensivos, análogos a uma sequence do Postgres após rollbacks/testes anteriores).
- Rodada a suite de testes unitários real com `npx jest`: `7 suites / 33 tests, 100% passed`, confirmando a alegação do time.

### Cache/Redis
Não aplicável — o projeto não usa Redis/cache nesta fase (inalterado desde a rodada 1).

---

## Priority Recommendations

1. **[IMPORTANTE]** Criar `site/public/` com favicon, `og-image.png` e os ícones de manifest antes do próximo deploy — sem isso, o `Dockerfile` documentado quebra no `COPY` final e o compartilhamento social do site fica sem preview. É o único achado novo desta rodada com potencial de bloquear produção.
2. **[IMPORTANTE]** Completar `@ApiResponse` nos 4 controllers restantes (catálogo público, playlist pública/admin, uploads) — 10 endpoints.
3. **[IMPORTANTE]** Adicionar testes para `set-variant-stock.usecase.ts` e `delete-product.usecase.ts`, os dois use-cases de risco nomeados explicitamente na rodada 1 que ainda ficaram de fora.
4. Migrar a CSP do site de `'unsafe-inline'` para nonce (`'strict-dynamic'` + middleware), e adicionar `Cross-Origin-Opener-Policy: same-origin` — ambos de baixo esforço e alinhados com a própria regra do projeto.
5. Adicionar JSON-LD `Product` nas páginas de produto (`site/app/produtos/[slug]/page.tsx`) para elegibilidade a rich results no Google.
6. Tratar os itens médios recorrentes da rodada 1 que seguem em aberto (naming de services/utils, `StockMovement` sem relações, `role` tipado como `string`, `cn()` em `ProductPurchasePanel.tsx`, contraste de `text-slate-500`) em um ciclo de qualidade contínuo — nenhum bloqueia produção isoladamente.
7. Extrair sub-componentes de `ProductFormPage.tsx` (458 linhas, cresceu desde a rodada 1) antes que o arquivo fique ainda mais difícil de manter.

---

## Quality Metrics

- **Total de violações nesta rodada**: 23
  - 🔴 Critical: 0 (2 da rodada 1, ambos corrigidos)
  - 🟡 High: 3 (2 recorrentes/parciais da rodada 1 + 1 novo — `public/` ausente no site)
  - 🟠 Medium: 13 (9 recorrentes + 4 novos)
  - 🔵 Low: 7 (5 recorrentes + 2 novos)
- **Achados da rodada 1 corrigidos**: 2/2 críticos, 4/6 altos totalmente + 2/6 altos parcialmente
- **Taxa de conformidade estimada**: ~85% (arquitetura de negócio crítica permanece sólida; os dois pontos mais sensíveis foram corrigidos e validados em runtime; violações remanescentes são de qualidade/documentação/consistência, mais um problema operacional isolado de deploy no site)

---

## Conclusion

Esta rodada confirma que o time endereçou de forma genuína — não apenas no relato — os dois problemas críticos e a maior parte dos altos da rodada 1. As duas correções mais sensíveis ao negócio (condição de corrida na geração de `order_number`, que envolve dinheiro e a constraint `UNIQUE` de pedidos; e o formulário de edição de produto, que afeta diretamente o único usuário do painel administrativo) foram verificadas não apenas por leitura de código, mas por execução real: 20 requisições concorrentes contra o Postgres do ambiente sem nenhuma colisão, e a suite de testes (33/33) rodada e confirmada passando.

Dos 6 altos da rodada 1, 4 foram totalmente resolvidos e 2 (documentação Swagger e cobertura de testes) tiveram progresso substancial e real, mas não chegaram a 100% — ambos evoluíram de "praticamente inexistente" para "metade ou mais resolvido", com os itens de maior risco (estoque, autenticação, pedidos) priorizados corretamente. A varredura completa desta rodada, que cobriu todo o código dos três repositórios e não só os arquivos citados no relatório anterior, encontrou apenas 1 problema novo de severidade alta: o diretório `site/public/` não existe, o que quebra assets de SEO/PWA e o build Docker documentado no próprio projeto — um problema de configuração/deploy, não de lógica de negócio, mas capaz de impedir um deploy real pelo caminho oficial.

Com 0 críticos e 3 altos (2 parciais recorrentes + 1 novo), o projeto atende ao critério de aprovação (0 críticos, ≤5 altos). O veredito é **APPROVED**, com a recomendação de tratar os 3 altos remanescentes — especialmente a ausência de `public/` no site, por ser o único capaz de bloquear um deploy — antes do lançamento em produção, e de continuar fechando a cobertura de testes e documentação Swagger em um ciclo de qualidade contínuo.
