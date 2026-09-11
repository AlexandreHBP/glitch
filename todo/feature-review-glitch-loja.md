# Feature Review Report - Glitch (Loja Online)

## Executive Summary

- **Review date**: 2026-09-11
- **Reviewed task**: `./todo/feature-glitch-loja.md`
- **Reviewed architecture**: `./todo/architecture-glitch-loja.md` (incluindo o ADR "dois frontends")
- **Escopo revisado**: `./backend` (NestJS/API), `./frontend` (Vite/React, painel admin), `./site` (Next.js, loja pública)
- **Implemented files**: 114 arquivos `.ts` no backend + módulos completos de admin (`frontend/src/pages/admin`) + storefront completo (`site/app`, `site/components`)
- **Completeness**: ⚠️
- **Verdict**: **INCOMPLETE — REVIEW NEEDED** (não há requisito funcional ausente; há 1 gap crítico de integração que quebra um critério de aceite explícito do RF01, e 1 gap de arquitetura de severidade alta)

Ambiente verificado via `devmode health`: `backend` (porta 3000) e `site` (porta 3001) reportados "running/healthy". `frontend` (painel admin, porta 5173) aparece "stopped" no devmode (bug de tracking de processo já sinalizado), mas respondeu normalmente via `curl` (HTTP 200) durante esta revisão. `postgres` aparece "stopped" no devmode, mas o backend conecta nele normalmente (testado com queries diretas via `pg` client) — também parece ser o mesmo bug de tracking, não um problema real de infraestrutura.

---

## Task Requirements

### Requisitos Funcionais Esperados (RF01–RF13, ver `./todo/feature-glitch-loja.md`)

1. **RF01** — Catálogo de produtos com fotos, preços e variações (tamanho/cor), com estoque por variação. *Must Have, Fase 1.*
2. **RF02** — Conta de cliente obrigatória para compra, com histórico de pedidos após login. *Must Have, Fase 2.*
3. **RF03** — Pedido registrado automaticamente pelo sistema, sem anotação manual. *Must Have, Fase 2.*
4. **RF04** — Controle de estoque por variação, bloqueando venda sem estoque, debitando automaticamente. *Must Have, Fase 2.*
5. **RF05** — Pagamento combinado fora do site (sem cobrança online). *Must Have, Fase 2.*
6. **RF06** — Cliente acompanha status do pedido. *Should Have, Fase 3.*
7. **RF07** — Painel administrativo de produtos (CRUD, com fotos e estoque). *Must Have, Fase 1.*
8. **RF08** — Painel de pedidos para o administrador. *Must Have, Fase 2.*
9. **RF09** — Efeito visual glitch no logo, títulos e interações (hover/touch). *Should Have, Fase 4.*
10. **RF10** — Player de música com playlist do admin, sem autoplay (RN04). *Should Have, Fase 4.*
11. **RF11** — Ovelha negra animada no rodapé, em loop, em todas as páginas. *Could Have, Fase 4.*
12. **RF12** — Efeito parallax ao rolar. *Could Have, Fase 4.*
13. **RF13** — Responsividade total (celular/tablet/desktop), incluindo os efeitos. *Must Have.*

### Arquivos Esperados (conforme `./todo/architecture-glitch-loja.md`)

1. `backend/src/modules/catalog/*` — CRUD de produtos, variações, categorias, imagens
2. `backend/src/modules/orders/*` — pedidos, transação com lock, histórico de status
3. `backend/src/modules/inventory/*` — débito/restauração de estoque
4. `backend/src/modules/auth/*` — login/registro/JWT/roles
5. `backend/src/modules/playlist/*` — CRUD de faixas
6. `backend/src/modules/uploads/*` — upload de imagem/áudio
7. `frontend/src/pages/admin/*` — Products, ProductForm, Orders, OrderDetail, Playlist, Login
8. `site/app/*` — Home, Produtos, ProdutoDetalhe, Entrar, Cadastro, Carrinho, Checkout, MinhaConta, PedidoConfirmado

---

## Implemented Files

**Backend** (`/workspace/backend/src`, 114 arquivos `.ts`):
1. `modules/auth/*` — login, registro, `/me`, JWT, throttler (5/min) em login/registro ✅
2. `modules/catalog/*` (controllers públicos + admin, entidades Product/ProductVariant/ProductImage/Category, use-cases) ⚠️ (ver incompatibilidade crítica)
3. `modules/inventory/*` — debit-stock, restore-stock, adjust-stock ✅
4. `modules/orders/*` (controllers cliente + admin, CreateOrderUseCase transacional com lock pessimista, ChangeOrderStatusUseCase com máquina de estados, OrderStatusHistory) ✅
5. `modules/playlist/*` (controller público + admin, CRUD completo) ✅
6. `modules/uploads/*` — upload de imagem (webp) e áudio, sem persistência de vínculo ⚠️
7. `database/migrations/*` — 3 migrations cobrindo catalog, orders, playlist; tabelas `product_images`, `order_status_history`, `playlist_tracks` todas existem no schema ✅
8. Testes unitários: `create-order.usecase.spec.ts`, `change-order-status.usecase.spec.ts` (13 testes, todos passando) ✅

**Frontend admin** (`/workspace/frontend/src`):
1. `App.tsx` — todas as 7 rotas exigidas registradas (`/login`, `/produtos`, `/produtos/novo`, `/produtos/:id/editar`, `/pedidos`, `/pedidos/:id`, `/playlist`) ✅
2. `pages/admin/ProductFormPage.tsx` — formulário de criação/edição ⚠️ (ver incompatibilidades)
3. `pages/admin/OrdersPage.tsx` / `OrderDetailPage.tsx` — lista e detalhe reais via API, com mudança de status ✅
4. `pages/admin/PlaylistPage.tsx` — CRUD completo com upload de áudio vinculado corretamente ✅
5. `components/guards/AdminRoute.tsx` — proteção de rota por role ✅
6. Confirmado: zero vestígios de glitch/parallax/ovelha/player no painel (design "sóbrio" conforme ADR) ✅

**Site público** (`/workspace/site`):
1. `app/*` — todas as 10 rotas exigidas existem e renderizam conteúdo real ✅
2. `components/catalog/*` — grade responsiva, seleção de variação, `StockBadge` por variação ✅
3. `components/checkout/CheckoutView.tsx` — gate de autenticação preservando carrinho, sem campos de pagamento, aviso textual de RN03 ✅
4. `components/account/OrderStatusTimeline.tsx` — linha do tempo de status ✅
5. `components/glitch/{GlitchText,BlackSheep,ParallaxSection,MusicPlayer}.tsx` + `contexts/MusicPlayerContext.tsx` — todos implementados e verificados linha a linha ✅

---

## Found Incompatibilities

### 🔴 Critical (1 found)

#### 1. Upload de imagem de produto nunca é vinculado ao produto (quebra RF01)
- **Requisito esperado**: RF01 — "Dado um cliente acessando o site, quando ele navega pelo catálogo, então vê os produtos disponíveis **com fotos**, preços e variações." A arquitetura também define explicitamente `product_images` como tabela obrigatória da Fase 1 e `POST /api/v1/admin/uploads/image` como parte do fluxo de cadastro de produto.
- **Situação atual**: O upload de imagem funciona isoladamente (`POST /api/v1/admin/uploads/image` salva o arquivo, converte para webp e retorna `{ url }`), mas **nenhum código do backend grava uma linha em `product_images`**. Confirmado por três evidências independentes:
  - `grep -rn "ProductImage"` no backend não retorna nenhum use-case, controller ou repositório que faça `save`/`create` de `ProductImage` — apenas a definição da entidade e a relação de leitura em `Product.images`.
  - `CreateProductDto`/`UpdateProductDto` não têm campo de imagens; `CreateProductUseCase`/`UpdateProductUseCase` nunca tocam `ProductImage`.
  - **Teste ao vivo via API** (`GET /api/v1/products`): os dois produtos reais cadastrados no ambiente retornam `"images":[]`.
  - **Teste direto no banco**: tabela `product_images` existe com schema correto (`product_id`, `url`, `is_cover`, `position`), mas `SELECT count(*) FROM product_images` = **0**, apesar de existirem 2 produtos e 3 variações cadastradas.
  - No frontend admin (`ProductFormPage.tsx`), a URL retornada pelo upload fica apenas em estado local do componente (`uploadedPhotos`) e nunca é incluída no payload de criação/atualização do produto — o próprio código tem um comentário do desenvolvedor confirmando a lacuna, e a UI exibe um aviso ao admin: *"O envio de fotos abaixo já funciona, mas a exibição delas junto ao produto ainda depende de uma atualização futura do sistema."*
  - No site público, `ProductGallery.tsx` degrada graciosamente para "Sem fotos disponíveis" em vez de quebrar — mas isso significa que, hoje, **nenhum produto do catálogo real exibe foto**.
- **Arquivo esperado**: um endpoint do tipo `POST /api/v1/admin/products/:id/images` (ou o `CreateProductDto`/`UpdateProductDto` aceitando um array de imagens que o use-case persista em `ProductImage`).
- **Impacto**: quebra literalmente o critério de aceite mais visível do requisito mais prioritário do projeto ("primeira etapa de entrega" = catálogo). Uma loja de roupas sem fotos não cumpre o objetivo de negócio (identidade visual, decisão de compra por variação visual).
- **Ação necessária**: implementar endpoint/campo que persista `ProductImage` vinculada ao produto (ex.: `POST /admin/products/:id/images` recebendo a URL já hospedada, ou aceitar `images: string[]`/`{url, isCover, position}[]` no `UpdateProductDto`), e então ajustar o frontend admin para enviar as URLs coletadas em `uploadedPhotos` nesse endpoint.
- **Bloqueador ou aceitável para 1ª entrega?** **Bloqueador.** Diferente do gap de `GET /admin/products/:id` (que tem um workaround funcional), este não tem contorno: é impossível hoje colocar qualquer foto em qualquer produto do catálogo por qualquer caminho da aplicação. Não deveria ser considerado pronto para lançar a Fase 1 ("catálogo online") sem isso.

---

### 🟡 High (1 found)

#### 1. Ausência de `GET /admin/products/:id` — painel de edição depende de fallback frágil
- **Requisito esperado**: a arquitetura (`./todo/architecture-glitch-loja.md`, tabela "API Endpoints", seção Admin) especifica explicitamente `GET /api/v1/admin/products/:id` como parte do CRUD de produtos da Fase 1.
- **Situação atual**: `catalog-admin.controller.ts` só tem `GET /admin/products` (lista), `POST`, `PUT /:id`, `DELETE /:id` e `PUT /variants/:id/stock` — não existe rota de detalhe por id. O frontend admin (`ProductFormPage.tsx`) contorna isso assim:
  - Se a edição foi aberta a partir da tela de lista (via `<Link state={{ product }}>`), usa o produto recebido via `location.state` do React Router.
  - Se a página for aberta diretamente por URL (refresh, link direto, aba nova), **não existe fetch por id** — o código busca `GET /admin/products?page=1&limit=100` (toda a lista, hardcoded a 100 itens) e procura o produto no array retornado no cliente.
- **Arquivo**: `backend/src/modules/catalog/catalog-admin.controller.ts` (endpoint ausente); `frontend/src/pages/admin/ProductFormPage.tsx` linhas ~96–108 (fallback).
- **Ação necessária**: implementar `GET /api/v1/admin/products/:id` no backend e trocar o fallback do frontend por uma chamada direta a esse endpoint.
- **Bloqueador ou aceitável para 1ª entrega?** **Aceitável, mas com ressalva.** O catálogo desta fase está dimensionado para 20–100 itens (conforme o próprio documento de requisitos), e o fallback hoje cobre exatamente esse intervalo (busca até 100 itens da página 1). Funciona para o volume inicial declarado, mas é uma implementação frágil que quebra silenciosamente ("produto não encontrado") assim que o catálogo crescer além de 100 itens ou além da primeira página — o que é plausível já na operação normal do negócio. Recomendo corrigir antes de considerar o RF07 "fechado", mas não é necessário bloquear o lançamento da Fase 1 por isso.

---

### 🟠 Medium (0 found)

Nenhuma incompatibilidade de severidade média identificada.

---

### 🔵 Low (1 found)

#### 1. Playlist não tem endpoint dedicado de reordenação (drag-and-drop)
- **Requisito esperado**: RF10 pede apenas que o admin "adicione uma música à playlist" e ela "passe a estar disponível no player" — não há critério de aceite exigindo reordenação.
- **Situação atual**: reordenar é possível apenas editando manualmente um campo numérico `position` no formulário de cada faixa (`PUT /admin/playlist/:id`); não há endpoint de lote nem UI de arrastar-e-soltar.
- **Arquivo**: `frontend/src/pages/admin/PlaylistPage.tsx`; `backend/src/modules/playlist/playlist-admin.controller.ts`.
- **Ação necessária**: nenhuma obrigatória — melhoria de usabilidade para versão futura.

---

## Met Requirements

- ✅ **RF01 (parcial)** — catálogo lista produtos com preço e variações; seleção de variação mostra estoque específico daquela combinação tamanho/cor (`StockBadge` por variante, textos como "Esgotado nesta variação", "Últimas N unidades"). **Fotos não funcionam** (ver gap crítico).
- ✅ **RF02** — checkout redireciona para `/entrar?redirect=/checkout` preservando o carrinho em `localStorage`; login/registro devolvem o cliente ao checkout; `/minha-conta` exige autenticação e lista histórico de pedidos via `GET /orders`.
- ✅ **RF03** — `POST /orders` grava o pedido em transação real; nenhuma anotação manual envolvida; confirmado com pedidos reais no banco (`GLT-2026-0001`, `GLT-2026-0002`).
- ✅ **RF04** — estoque vive exclusivamente em `ProductVariant.stockQuantity` (nunca em `Product`), com `CHECK stock_quantity >= 0` no banco, lock pessimista na criação do pedido (evita venda dupla da última peça), débito automático dentro da mesma transação, e restauração de estoque automática ao cancelar (`ChangeOrderStatusUseCase` → `InventoryService.restoreStock`). Erro 409 com lista de itens indisponíveis confirmado no código e coberto por testes unitários.
- ✅ **RF05** — checkout não tem nenhum campo de pagamento; texto explícito exibido ao cliente ("O site não processa pagamento... a gente combina forma de pagamento e entrega diretamente com você") em três pontos da UI (produto, checkout, confirmação).
- ✅ **RF06** — `OrderStatusTimeline.tsx` renderiza a sequência de status com timestamps e notas, alimentada por `order_status_history` (tabela e entidade confirmadas no banco, com 4 registros reais de teste incluindo um ciclo completo até `CANCELADO`).
- ✅ **RF07 (com ressalva de alta severidade)** — CRUD de produto funciona (criar/editar/excluir/inativar), estoque por variação é ajustável e reflete via invalidação de cache (TanStack Query); edição por id tem fallback funcional mas frágil (ver 🟡 High).
- ✅ **RF08** — painel de pedidos lista todos os pedidos reais via `GET /admin/orders`, com detalhe, filtro por status e mudança de status restrita a transições válidas.
- ✅ **RF09** — `GlitchText` (logo/títulos, com cópias `aria-hidden` em ciano/magenta, texto real permanece legível e selecionável) e `.glitch-hover` (com fallback `:active` para touch) confirmados por leitura direta do código e do CSS.
- ✅ **RF10 e RN04** — verificado com rigor especial a pedido do revisor: `grep` por `autoplay`/`autoPlay` em todo o `site` retorna **zero** usos reais (só um comentário proibindo). Único `.play()` do código só é alcançável por clique do usuário (play/pause/selecionar faixa); `isPlaying` nasce sempre `false` e **nunca** é restaurado do `localStorage` (só faixa selecionada e volume são persistidos) — comentário do próprio código confirma a intenção: *"Hidrata SÓ faixa escolhida e volume — nunca 'estava tocando'."* `preload="none"`. **RN04 é respeitada de forma inequívoca.** A playlist cadastrada pelo admin é a mesma exibida no player do cliente: ambos consomem a mesma tabela `playlist_tracks` via `GET /api/v1/playlist` (testado ao vivo — a faixa "Noite Sem Luz" cadastrada aparece na API pública), e o fluxo de upload de áudio → cadastro de faixa funciona ponta a ponta (diferente do fluxo de imagem de produto).
- ✅ **RF11** — `BlackSheep.tsx` (SVG inline) renderizado dentro de `Footer.tsx`, montado globalmente em `app/layout.tsx` (presente em todas as páginas), com animação CSS `infinite`.
- ✅ **RF12** — `ParallaxSection.tsx` usa `IntersectionObserver` + `requestAnimationFrame` real (não é CSS estático disfarçado), autodesabilitado abaixo de 768px e sob `prefers-reduced-motion`.
- ✅ **RF13** — checagem pontual de `ProductCard`, `MusicPlayer`, `CheckoutView` e `Header` confirma breakpoints `sm:`/`md:`/`lg:` consistentes; player tem layout desktop (barra fixa) e mobile (botão flutuante + drawer) completamente distintos.
- ✅ Segurança básica: `GET /orders/:id` filtra por `userId` do token (cliente só vê o próprio pedido); `JwtAuthGuard` global com `@Public()` explícito; `RolesGuard` com `@Roles('admin')` em todos os controllers `/admin/*`; throttler 5/min em login e registro; app recusa subir sem `JWT_SECRET` válido.
- ✅ Testes unitários existentes (`CreateOrderUseCase`, `ChangeOrderStatusUseCase`) passam: 13/13.
- ✅ CORS configurado para liberar as origens dos dois frontends, conforme o ADR.

---

## Technical Validations Performed

### Database (queries diretas via cliente `pg`, usando as credenciais do `.env` do backend)

```sql
-- Tabelas existentes
SELECT table_name FROM information_schema.tables WHERE table_schema='public';
→ categories, migrations, order_items, order_status_history, orders,
  playlist_tracks, product_images, product_variants, products, stock_movements, users

-- Confirma o gap crítico
SELECT column_name, data_type FROM information_schema.columns WHERE table_name='product_images';
→ id, product_id, url, is_cover, position, created_at, updated_at   -- schema correto

SELECT count(*) FROM product_images;   → 0
SELECT count(*) FROM products;         → 2
SELECT count(*) FROM product_variants; → 3
-- Ou seja: produtos e variações reais existem, mas nenhuma imagem foi persistida.

-- Confirma fluxo de pedidos/estoque/status funcionando de ponta a ponta
SELECT id, order_number, status FROM orders;
→ GLT-2026-0001 (CANCELADO), GLT-2026-0002 (AGUARDANDO_CONTATO)

SELECT * FROM order_status_history;
→ 4 registros reais, incluindo ciclo completo AGUARDANDO_CONTATO → EM_PREPARO → CANCELADO
  para o pedido GLT-2026-0001, confirmando que a máquina de estados e o histórico funcionam.

SELECT id, email, role FROM users;
→ 1 admin + 3 clientes de teste, confirmando fluxo de registro/login funcionando.
```

### API (chamadas HTTP reais contra o backend em execução, porta 3000)

- `GET /api/v1/products` → 200, retorna os 2 produtos reais com `"images":[]` (confirma o gap crítico em nível de contrato de API, não só de banco).
- `GET /api/v1/playlist` → 200, retorna a faixa "Noite Sem Luz" cadastrada pelo admin (confirma que a playlist do admin chega ao cliente).
- `GET /api/v1/categories` → 200, 3 categorias reais.
- `GET /api/v1/admin/products` sem token → 401 (confirma proteção de rota admin).

### Testes automatizados

- `npx jest src/modules/orders/use-cases` → **13/13 testes passando** (`create-order.usecase.spec.ts`, `change-order-status.usecase.spec.ts`), cobrindo estoque insuficiente, produto inativo e transições de status inválidas.

### Ambiente (`devmode health`)

```
SERVICE   PROCESS  PHASE    HEALTH CHECK          RESULT
postgres  stopped  —        tcp://localhost:5432  process not running   ← tracking bug (backend conecta normalmente)
backend   running  running  tcp://localhost:3000  healthy
frontend  stopped  stopped  tcp://localhost:5173  process not running   ← tracking bug confirmado
site      running  running  tcp://localhost:3001  healthy
```
Confirmado via `curl`: os três serviços (`backend:3000`, `frontend:5173`, `site:3001`) respondem HTTP 200 normalmente, apesar do status incorreto reportado pelo `devmode` para `frontend` e `postgres`.

---

## Priority Recommendations

1. **[URGENTE]** Implementar a persistência do vínculo `ProductImage` ↔ `Product` (endpoint novo, ex. `POST /admin/products/:id/images`, ou campo `images` no `UpdateProductDto`) e ajustar `ProductFormPage.tsx` para enviar as URLs já coletadas em `uploadedPhotos`. Sem isso, o catálogo da Fase 1 — a entrega mais prioritária do projeto — vai ao ar sem nenhuma foto de produto, o que contradiz o próprio objetivo de negócio (identidade visual forte).
2. **[IMPORTANTE]** Implementar `GET /api/v1/admin/products/:id` e trocar o fallback de 100 itens em `ProductFormPage.tsx` por uma chamada direta. Não bloqueia a Fase 1 (catálogo cabe em 100 itens hoje), mas é dívida técnica que vai quebrar silenciosamente assim que o catálogo crescer.
3. **[MENOR]** Considerar endpoint de reordenação em lote para a playlist, se a operação manual do campo `position` se mostrar incômoda para o admin leigo (Alexandre) na prática.
4. Nenhuma ação necessária para RF02–RF06, RF08–RF13 — todos verificados como implementados e funcionais, com RN04 (música não inicia sozinha) especialmente auditado e confirmado sem ressalvas.

---

## Completeness Checklist

- [x] Todos os endpoints mencionados na arquitetura foram implementados — **exceto** `GET /admin/products/:id` e o vínculo de `POST /admin/uploads/image` com `ProductImage`
- [x] Todas as validações especificadas estão presentes (DTOs com `class-validator`, `whitelist`/`forbidNonWhitelisted`, validação de transições de status)
- [x] Todos os campos obrigatórios estão implementados (nome, preço, estoque por variação) — **exceto** foto, que não persiste vínculo
- [x] Integrações de banco funcionando (schema, transações, locks, testados com dados reais)
- [x] Componentes de frontend implementados (admin e loja pública, todas as rotas exigidas)
- [x] Testes mencionados no plano foram criados (Jest para `CreateOrderUseCase` e `ChangeOrderStatusUseCase`, 13/13 passando)

---

## Completeness Metrics

- **Total de requisitos (RF01–RF13)**: 13
  - Implementados por completo: 11 (RF02, RF03, RF04, RF05, RF06, RF08, RF09, RF10, RF11, RF12, RF13)
  - Parcialmente implementados: 2 (RF01 — fotos não persistem; RF07 — edição por id via fallback frágil)
  - Não implementados: 0
- **Taxa de completude**: ≈ 92% (11 completos + 2 parciais ponderados como ~50% cada ≈ 12/13)
- **Arquivos esperados (grandes blocos de arquitetura)**: 8 blocos de módulo/rota
- **Arquivos criados**: todos os 8 blocos existem e têm código funcional

---

## Conclusion

A implementação da Loja Glitch está **funcionalmente muito completa** para o escopo revisado: os três serviços (`backend`, `frontend` admin, `site` público) rodam, se comunicam pela API real, e a grande maioria dos RF01–RF13 foi verificada em código e, quando aplicável, testada com dados reais no banco — incluindo os itens mais sensíveis do negócio (transação de pedido com lock pessimista, débito e restauração de estoque, histórico de status, e a regra RN04 de que a música nunca inicia sozinha, que foi auditada linha a linha e confirmada sem nenhuma ressalva).

Os dois gaps já sinalizados pelos próprios desenvolvedores se confirmaram reais, com evidência direta em banco de dados e em chamadas de API ao vivo:

1. **Bloqueador para a Fase 1**: o upload de foto de produto funciona isoladamente, mas nunca é vinculado ao produto — hoje é literalmente impossível colocar uma foto em qualquer produto do catálogo por qualquer caminho da aplicação (`product_images` tem 0 linhas apesar de produtos e variações reais existirem). Isso quebra um critério de aceite explícito do RF01, que é a entrega "essencial" e prioritária do projeto. **Recomendo não considerar a Fase 1 pronta para lançamento até esse vínculo existir.**
2. **Aceitável para a Fase 1, mas pendente**: a ausência de `GET /admin/products/:id` foi contornada por um fallback que busca até 100 produtos e filtra no cliente — funciona para o volume declarado no documento de requisitos (20 a 100 itens), mas é frágil e deve ser corrigido antes que o catálogo cresça.

Nenhum outro requisito funcional ficou incompleto. O terceiro ponto pedido para verificação especial — o player de música — passou em todos os testes: nunca inicia sozinho (nem por `autoPlay`, nem por estado persistido, nem por qualquer chamada automática de `.play()`) e a playlist cadastrada pelo admin de fato aparece para o cliente, com o fluxo de upload de áudio funcionando ponta a ponta (ao contrário do fluxo de imagem de produto).
