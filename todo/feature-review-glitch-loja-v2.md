# Feature Review Report - Glitch (Loja Online) — Rodada 2

## Executive Summary

- **Review date**: 2026-09-11
- **Reviewed task**: `./todo/feature-glitch-loja.md`
- **Reviewed architecture**: `./todo/architecture-glitch-loja.md`
- **Referência histórica**: `./todo/feature-review-glitch-loja.md` (rodada 1 — veredito INCOMPLETE)
- **Escopo revisado**: `./backend` (NestJS/API), `./frontend` (Vite/React, painel admin), `./site` (Next.js, loja pública)
- **Completeness**: ✅
- **Verdict**: **COMPLETE**

Os dois gaps da rodada 1 (🔴 crítico: foto de produto não vinculava; 🟡 alto: `GET /admin/products/:id` ausente) foram corrigidos e **verificados ao vivo com dados novos** criados durante esta revisão (não apenas leitura de código): um produto de teste foi criado via API com uma foto real enviada por upload, e a foto apareceu corretamente em `GET /api/v1/products`, `GET /api/v1/products/:slug`, no HTML server-renderizado de `/produtos` e `/produtos/:slug` do site Next.js, e passou pelo otimizador de imagem (`/_next/image`) com sucesso (HTTP 200, `image/jpeg`). No banco, `product_images` saiu de 0 linhas (rodada 1) para 2 linhas reais (rodada 2, incluindo o produto de teste desta revisão, que foi inativado ao final do teste por já ter pedido associado).

Todos os RF01–RF13 foram reavaliados do zero, incluindo testes ao vivo de fluxos que não fazem parte diretamente dos dois gaps corrigidos (registro de cliente, login, criação de pedido com débito de estoque, erro 409 por estoque insuficiente, mudança de status com histórico, exclusão/inativação de produto), para cobrir o risco de regressão apontado — o time mexeu em `auth` (login, registro, DTOs), `orders` (controllers e `CreateOrderUseCase`), `uploads` (controller e service) e `main.ts` (ordem do Helmet) além do fix pontual de `catalog`. Nenhuma regressão funcional foi encontrada. A suíte de testes automatizados cresceu de 13 para **33 testes, todos passando**.

Ambiente verificado via `devmode health`: `backend` (3000) e `site` (3001) aparecem "running/healthy". `frontend` (5173) e `postgres` (5432) aparecem **"stopped"** no devmode — confirmado novamente, como na rodada 1, que é o mesmo bug de tracking: `curl` retornou HTTP 200 em `frontend:5173`, e o `backend` lê/escreve no Postgres normalmente durante todos os testes ao vivo desta revisão.

**Nota de ambiente**: a ferramenta de browser Playwright não conseguiu alcançar `localhost` (nenhuma porta, nem 3000, nem 3001, nem 5173) a partir do sandbox usado nesta revisão (`net::ERR_CONNECTION_REFUSED` mesmo para a home page) — limitação de rede do ambiente de teste, não da aplicação (confirmado porque `curl` no mesmo host alcança todas as portas normalmente). Por isso a verificação "ao vivo" desta rodada foi feita via chamadas HTTP reais (`curl`) criando dados genuinamente novos (conta de cliente, produto com foto, pedido), leitura do HTML server-renderizado retornado pelo Next.js, e queries diretas ao Postgres — equivalente em rigor a uma verificação por navegador para os pontos que importavam (persistência do vínculo produto↔foto e do vínculo pedido↔estoque↔histórico).

---

## Task Requirements

### Requisitos Funcionais Esperados (RF01–RF13, ver `./todo/feature-glitch-loja.md`)

1. **RF01** — Catálogo de produtos com fotos, preços e variações (tamanho/cor), com estoque por variação.
2. **RF02** — Conta de cliente obrigatória para compra, com histórico de pedidos após login.
3. **RF03** — Pedido registrado automaticamente pelo sistema, sem anotação manual.
4. **RF04** — Controle de estoque por variação, bloqueando venda sem estoque, debitando automaticamente.
5. **RF05** — Pagamento combinado fora do site (sem cobrança online).
6. **RF06** — Cliente acompanha status do pedido.
7. **RF07** — Painel administrativo de produtos (CRUD, com fotos e estoque).
8. **RF08** — Painel de pedidos para o administrador.
9. **RF09** — Efeito visual glitch no logo, títulos e interações (hover/touch).
10. **RF10** — Player de música com playlist do admin, sem autoplay (RN04).
11. **RF11** — Ovelha negra animada no rodapé, em loop, em todas as páginas.
12. **RF12** — Efeito parallax ao rolar.
13. **RF13** — Responsividade total (celular/tablet/desktop), incluindo os efeitos.

### Correções específicas pedidas para esta rodada (conforme relatório da rodada 1)

1. Persistência do vínculo `ProductImage` ↔ `Product` (endpoint/campo `images` em `CreateProductDto`/`UpdateProductDto`, e o frontend enviando as URLs coletadas em `uploadedPhotos`).
2. `GET /api/v1/admin/products/:id`, substituindo o fallback de `?page=1&limit=100` em `ProductFormPage.tsx`.

---

## Implemented Files (mudanças relevantes desta rodada, além do já existente na rodada 1)

**Backend**:
1. `backend/src/modules/catalog/dto/product-image.dto.ts` (novo) — DTO `{ url, isCover?, position? }` ✅
2. `backend/src/modules/catalog/dto/create-product.dto.ts` — campo `images?: ProductImageDto[]` adicionado ✅
3. `backend/src/modules/catalog/dto/update-product.dto.ts` — herda `images?` de `CreateProductDto` via `PartialType` ✅
4. `backend/src/modules/catalog/use-cases/create-product.usecase.ts` — persiste `ProductImage[]` na mesma transação do produto ✅
5. `backend/src/modules/catalog/use-cases/update-product.usecase.ts` — estratégia "substituir tudo" quando `images` vem no payload (delete + insert), preserva fotos existentes quando `images` é `undefined` ✅
6. `backend/src/modules/catalog/use-cases/get-admin-product-by-id.usecase.ts` (novo) — `GET /admin/products/:id` com relations `variants`, `images`, `category` ✅
7. `backend/src/modules/catalog/catalog-admin.controller.ts` — rota `GET products/:id` registrada ✅
8. `backend/src/main.ts` — reordenação do Helmet antes de `useStaticAssets`, headers de segurança extras em `/uploads/*` ✅ (não é objeto desta rodada, mas não quebrou nada — testado)
9. `backend/src/modules/auth/*`, `backend/src/modules/orders/orders.controller.ts`, `orders-admin.controller.ts`, `create-order.usecase.ts`, `uploads/*` — tocados nesta rodada; testados ao vivo, sem regressão encontrada ✅

**Frontend admin**:
1. `frontend/src/pages/admin/ProductFormPage.tsx` — `images` incluído no payload de create/update (linhas ~150–172); fallback de 100 itens substituído por `useQuery` chamando `productService.getById(id)` (linhas ~99–103) ✅
2. `frontend/src/services/productService.ts` — método `getById` chamando `GET /admin/products/:id` ✅

---

## Verificação ao vivo (dados novos criados nesta revisão)

### 1. Upload + vínculo de foto ao produto (gap crítico da rodada 1)

```
POST /api/v1/auth/login (admin)                          → 200, accessToken
POST /api/v1/admin/uploads/image (PNG 64x64 de teste)     → 200 {"url":"/uploads/images/12be8974-....webp"}
POST /api/v1/admin/products
  { name: "Produto Teste Review V2", variants: [...],
    images: [{ url: "...webp", isCover: true, position: 0 }] }
                                                           → 201, produto criado com "images": [{...}] preenchido
GET /api/v1/products                                      → produto aparece na listagem pública COM a foto
GET /api/v1/products/produto-teste-review-v2              → detalhe também traz a foto
GET /uploads/images/12be8974-....webp                     → 200, content-type: image/webp
```

**No site público (Next.js, porta 3001), via HTML server-renderizado real** (não é só a API):

```
curl http://localhost:3001/produtos
  → grep "Produto Teste Review V2"                        → encontrado
  → grep "12be8974-53a1-4c66-a6e7-f96c847e4d01"            → encontrado (5 ocorrências, cover + thumb)
  → _next/image?url=http%3A%2F%2Flocalhost%3A3000%2Fuploads%2Fimages%2F12be8974-...webp

curl http://localhost:3001/produtos/produto-teste-review-v2
  → grep "Produto Teste Review V2"                        → encontrado
  → grep "Sem fotos disponíveis" (fallback de ProductGallery.tsx) → NÃO encontrado (a foto renderizou, não caiu no fallback)

curl "http://localhost:3001/_next/image?url=...12be8974...webp&w=640&q=75"
  → HTTP 200, content-type: image/jpeg (otimizador do Next serviu a imagem de verdade)
```

**No banco** (antes/depois desta rodada, comparado com a rodada 1):

```sql
SELECT count(*) FROM product_images;
  Rodada 1: 0
  Rodada 2: 2   -- inclui o produto real "Camiseta Glitch Oversized" (já cadastrado
                --   pelo time) e o produto de teste criado nesta revisão
```

O produto de teste foi limpo ao final via `DELETE /admin/products/:id` — como já tinha um pedido associado (ver próxima seção), o sistema corretamente o **inativou** em vez de apagar (`{"hardDeleted": false}`, `active: false`), confirmando também a regra de negócio de `onDelete: RESTRICT` descrita na arquitetura.

**Conclusão**: o gap crítico da rodada 1 está **resolvido e confirmado ponta a ponta**, do upload até o HTML renderizado do site público, com dado genuinamente novo criado durante esta revisão (não reaproveitando os 2 produtos que já existiam).

### 2. `GET /admin/products/:id` (gap alto da rodada 1)

```
GET /api/v1/admin/products/<uuid válido> sem token         → 401
GET /api/v1/admin/products/<uuid válido> com token admin    → 200, produto com variants/images/category
GET /api/v1/admin/products/00000000-0000-0000-0000-000000000000 (inexistente) → 404 "Produto não encontrado"
```

`frontend/src/pages/admin/ProductFormPage.tsx` (lido linha a linha): o fallback de `?page=1&limit=100` **não existe mais**. Quando a edição é aberta sem vir da lista (refresh, link direto), o componente chama `productService.getById(id)`, que bate em `GET /admin/products/:id` — exatamente a correção recomendada na rodada 1.

**Conclusão**: gap de alta severidade **resolvido**.

### 3. Reavaliação completa de RF01–RF13 (checagem de regressão)

Como o time também alterou `auth`, `orders` e `uploads` nesta correção, os seguintes fluxos foram testados **ao vivo, do zero**, com dados novos:

| Fluxo testado | Resultado |
|---|---|
| `POST /auth/register` (nova conta) | 201, `accessToken` + `user` retornados |
| `POST /auth/login` (conta recém-criada) | 200, token válido |
| `POST /orders` (3 unidades, estoque 10→7) | 201, pedido criado, `orderNumber` gerado, estoque debitado corretamente (confirmado por nova consulta ao produto) |
| `POST /orders` com quantidade 15 (estoque 7 disponível) | **409** `"Estoque insuficiente (disponível: 7, pedido: 15)"` — RF04 confirmado |
| `POST /orders` com quantidade 999 | 400 (`Max(20)` do DTO) — validação de borda também funciona |
| `GET /orders` (cliente) | Pedido aparece no histórico da própria conta |
| `GET /orders/:id` com token de outro usuário | 404 (filtro por `userId`, não vaza existência) — RN02/segurança intacta |
| `GET /admin/orders` | Lista todos os pedidos, painel funcional — RF08 |
| `PATCH /admin/orders/:id/status` (→ `EM_PREPARO`) | 200, `order_status_history` ganhou nova entrada — RF06 |
| `GET /orders/:id` (cliente, após mudança de status) | `statusHistory` com as duas entradas (`AGUARDANDO_CONTATO` → `EM_PREPARO`) |
| `DELETE /admin/products/:id` (produto com pedido associado) | Inativação (soft), não apaga — RF07 + regra `RESTRICT` |
| `GET /categories` | 4 categorias reais |
| `GET /playlist` | Faixa cadastrada pelo admin aparece — RF10 |
| `grep -rn "autoplay\|autoPlay"` em `./site` | Só um comentário proibindo; nenhum uso real — RN04 confirmado de novo |
| Componentes `GlitchText.tsx`, `BlackSheep.tsx`, `ParallaxSection.tsx`, `MusicPlayer.tsx` | Presentes, sem timestamp de modificação nesta rodada (arquivos do `site/` não fizeram parte do diff da correção) — RF09/RF11/RF12 sem risco de regressão |
| `npx jest` (backend completo) | **33/33 testes passando** (13 na rodada 1 + novos testes de `auth` e `inventory` adicionados junto com a correção) |

Nenhuma regressão funcional foi encontrada em nenhum dos RF01–RF13.

---

## Found Incompatibilities

### 🔴 Critical (0 found)

Nenhuma. O gap crítico da rodada 1 (foto de produto não vinculada) está resolvido e verificado ao vivo.

### 🟡 High (0 found)

Nenhuma. O gap alto da rodada 1 (`GET /admin/products/:id` ausente) está resolvido e verificado ao vivo.

### 🟠 Medium (0 found)

Nenhuma.

### 🔵 Low (1 found)

#### 1. Artefato de ponto flutuante no `total` retornado imediatamente por `POST /orders`
- **Situação encontrada**: a resposta imediata de `POST /api/v1/orders` (antes do primeiro round-trip ao banco) devolveu `"total": 389.70000000000005` em vez de `389.70`, para um pedido de 3× R$ 129,90. Causa: `create-order.usecase.ts` acumula `total += unitPrice * quantity` em JavaScript puro (`number`), sujeito a imprecisão de ponto flutuante, antes de gravar na coluna `numeric(10,2)`.
- **Por que não é crítico/alto**: a arquitetura já previa esse risco explicitamente ("`numeric` do TypeORM... é o bug número um deste modelo de dados") e a mitigação funciona onde importa — o valor **gravado no Postgres é `389.70` exato** (coluna `numeric(10,2)`, testado com query direta), e qualquer leitura subsequente (`GET /orders`, `GET /orders/:id`) já devolve `389.7` corretamente. No frontend (`site/lib/format.ts`), a exibição usa `Intl.NumberFormat('pt-BR', {style:'currency'})`, que arredonda para 2 casas na formatação — então o cliente nunca veria `R$ 389,70000000000005` na tela, nem na confirmação do pedido (que re-busca o pedido por `GET`, não reusa a resposta crua do `POST`).
- **Impacto real**: nenhum requisito funcional ou critério de aceite é violado — é uma imprecisão presente só no corpo bruto do JSON de resposta do `POST`, num campo calculado em memória antes do round-trip ao banco.
- **Ação sugerida (não bloqueadora)**: arredondar o `total` (e os `subtotal`s) para 2 casas decimais antes de montar a resposta do `POST /orders` (ex.: `Math.round(total * 100) / 100`), por consistência de contrato de API — mais um item de qualidade de código para a rodada de `code-review` do que uma incompatibilidade de requisito.

---

## Met Requirements

- ✅ **RF01** — catálogo lista produtos com foto, preço e variações; foto de produto novo/editado **confirmada ao vivo** aparecendo em `GET /products`, `GET /products/:slug` e no HTML renderizado do site público, incluindo o otimizador de imagem do Next.js. Seleção de variação mostra estoque específico.
- ✅ **RF02** — registro e login testados ao vivo com conta nova; `/me` e histórico de pedidos funcionam.
- ✅ **RF03** — `POST /orders` grava pedido real em transação, sem anotação manual; `orderNumber` gerado (`GLT-2026-0014` nesta revisão).
- ✅ **RF04** — estoque debitado corretamente (10→7 confirmado), 409 com item e motivo quando insuficiente, validação de borda (`Max(20)`) intacta.
- ✅ **RF05** — nenhuma alteração nos arquivos de checkout desta rodada; ausência de campos de pagamento reconfirmada por leitura de código (`CheckoutView.tsx` sem diff nesta correção).
- ✅ **RF06** — mudança de status via `PATCH /admin/orders/:id/status` gravou nova entrada em `order_status_history`, refletida no `GET /orders/:id` do cliente.
- ✅ **RF07** — CRUD completo confirmado ao vivo: criar (com foto), buscar por id, listar, e excluir (com inativação correta quando há pedido associado).
- ✅ **RF08** — `GET /admin/orders` lista todos os pedidos reais, incluindo o criado nesta revisão.
- ✅ **RF09** — `GlitchText.tsx` e `.glitch-hover` presentes, sem alteração nesta rodada (fora do escopo do diff).
- ✅ **RF10 e RN04** — playlist pública funcionando; `grep` por `autoPlay`/`autoplay` reconfirma zero uso real.
- ✅ **RF11** — `BlackSheep.tsx` presente, sem alteração nesta rodada.
- ✅ **RF12** — `ParallaxSection.tsx` presente, sem alteração nesta rodada.
- ✅ **RF13** — nenhuma mudança nesta rodada em arquivos de layout/breakpoints; responsividade já confirmada na rodada 1 permanece válida.
- ✅ Segurança básica reconfirmada: `GET /orders/:id` continua filtrando por `userId` (404 para não-dono), rotas `/admin/*` continuam exigindo token + role admin (401 sem token), `JWT_SECRET` continua sendo exigido para subir a aplicação.
- ✅ Testes automatizados: 33/33 passando (crescimento de 13 para 33 desde a rodada 1).

---

## Technical Validations Performed

### Database (queries diretas via cliente `pg`, usando as credenciais do `.env` do backend)

```sql
SELECT count(*) FROM product_images;   → 2   (era 0 na rodada 1)
SELECT count(*) FROM products;         → 3   (era 2 na rodada 1; +1 criado nesta revisão, depois inativado)
SELECT count(*) FROM orders;           → 3   (era 2 na rodada 1; +1 criado nesta revisão)

SELECT order_number, total, pg_typeof(total) FROM orders WHERE order_number='GLT-2026-0014';
  → { total: '389.70', pg_typeof: 'numeric' }   -- confirma que o valor gravado é exato,
                                                    apesar do artefato de float na resposta do POST
```

### API (chamadas HTTP reais contra o backend em execução, porta 3000, com dados novos criados nesta revisão)

- Fluxo completo: login admin → upload de imagem → criação de produto com `images` → aparece em `GET /products` e `GET /products/:slug` com a foto.
- Fluxo completo: registro de cliente → login → criação de pedido → débito de estoque → 409 por estoque insuficiente → mudança de status pelo admin → histórico refletido para o cliente → exclusão do produto (inativação por já ter pedido).
- `GET /admin/products/:id`: 401 sem token, 200 com token válido, 404 para id inexistente.

### Site público (Next.js, porta 3001) — HTML server-renderizado real

- `curl http://localhost:3001/produtos` e `.../produtos/produto-teste-review-v2` confirmaram a presença do produto de teste e da referência de imagem no HTML gerado pelo servidor (não é uma checagem só de API).
- `curl http://localhost:3001/_next/image?url=...` confirmou que o otimizador de imagem do Next serve o arquivo de verdade (200, `image/jpeg`).

### Testes automatizados

- `npx jest` (suíte completa do backend) → **33/33 testes passando**, 7 suítes (`create-order`, `change-order-status`, `debit-stock`, `restore-stock`, `adjust-stock`, `login`, `register-customer`).

### Ambiente (`devmode health`)

```
SERVICE   PROCESS  PHASE    HEALTH CHECK          RESULT
postgres  stopped  —        tcp://localhost:5432  process not running   ← bug de tracking (reconfirmado)
backend   running  running  tcp://localhost:3000  healthy
frontend  stopped  stopped  tcp://localhost:5173  process not running   ← bug de tracking (reconfirmado)
site      running  running  tcp://localhost:3001  healthy
```
Confirmado via `curl`: os três serviços (`backend:3000`, `frontend:5173`, `site:3001`) respondem HTTP 200, e o backend leu/escreveu no Postgres durante todos os testes ao vivo desta revisão — o status "stopped" de `postgres` e `frontend` é o mesmo falso-negativo já documentado na rodada 1.

**Limitação de ambiente registrada**: a ferramenta de browser (Playwright MCP) não conseguiu abrir nenhuma porta local (`localhost:3000/3001/5173`) neste sandbox (`net::ERR_CONNECTION_REFUSED`), incluindo a home page. Não é um problema da aplicação (`curl` no mesmo host acessa todas as portas normalmente) — é isolamento de rede do ambiente de execução desta revisão. A verificação "ao vivo" foi feita por chamadas HTTP diretas criando dados novos e inspecionando o HTML retornado pelo servidor, o que cobre o mesmo risco (garantir que o dado chega renderizado, não só que a API responde).

---

## Priority Recommendations

1. **[MENOR, não bloqueador]** Arredondar `total`/`subtotal` para 2 casas decimais na resposta de `POST /orders` (ex.: `Math.round(valor * 100) / 100`), para eliminar o artefato de ponto flutuante no corpo bruto da resposta — hoje é só um detalhe de contrato de API, sem impacto no dado persistido ou na experiência do cliente, mas vale a pena higienizar antes de expor a API para integrações externas futuras.
2. Nenhuma ação obrigatória para RF01–RF13 — todos verificados e funcionais, sem regressões, nesta segunda rodada.
3. Considerar (fora do escopo desta feature) adicionar um teste automatizado de integração cobrindo o fluxo "criar produto com foto → aparece em GET /products", já que hoje essa cobertura existe apenas via verificação manual/ao vivo (unit tests atuais cobrem `orders`, `auth` e `inventory`, mas não `catalog`).

---

## Completeness Checklist

- [x] Todos os endpoints mencionados na arquitetura foram implementados, incluindo os dois que faltavam na rodada 1 (`GET /admin/products/:id` e o vínculo `POST/PUT .../products` ↔ `ProductImage`)
- [x] Todas as validações especificadas estão presentes
- [x] Todos os campos obrigatórios estão implementados, incluindo foto (agora persistida)
- [x] Integrações de banco funcionando (schema, transações, locks, testados com dados reais novos)
- [x] Componentes de frontend implementados (admin e loja pública, incluindo o fallback removido em `ProductFormPage.tsx`)
- [x] Testes mencionados no plano foram criados (33/33 passando, incluindo novos testes de `auth` e `inventory`)

---

## Completeness Metrics

- **Total de requisitos (RF01–RF13)**: 13
  - Implementados por completo: 13
  - Parcialmente implementados: 0
  - Não implementados: 0
- **Taxa de completude**: 100%
- **Gaps da rodada 1**: 2 (1 crítico, 1 alto) — ambos resolvidos e verificados ao vivo nesta rodada
- **Novos gaps encontrados nesta rodada**: 0 críticos, 0 altos, 0 médios, 1 baixo (não bloqueador)

---

## Conclusion

Os dois gaps que impediam a aprovação na rodada 1 foram corrigidos corretamente e **verificados ao vivo com dados genuinamente novos** criados durante esta revisão, não apenas por leitura de código:

1. **Vínculo de foto de produto** (`product_images`): confirmado ponta a ponta — upload → `CreateProductDto.images` → persistência transacional em `ProductImage` → `GET /products` / `GET /products/:slug` → HTML server-renderizado do site Next.js → otimizador de imagem do Next servindo o arquivo real. A tabela `product_images`, que tinha 0 linhas na rodada 1, agora tem linhas reais e a foto criada nesta revisão apareceu no catálogo público.
2. **`GET /admin/products/:id`**: endpoint implementado, protegido por auth, retornando 404 correto para id inexistente; o frontend não usa mais o fallback frágil de `?page=1&limit=100` — `ProductFormPage.tsx` agora chama esse endpoint diretamente.

A reavaliação completa de RF01–RF13, incluindo testes ao vivo de fluxos fora do escopo direto da correção (registro, login, criação de pedido, débito de estoque, erro de estoque insuficiente, mudança de status, exclusão de produto), não encontrou nenhuma regressão introduzida pelas alterações em `auth`, `orders`, `uploads` e `main.ts` que acompanharam a correção. A suíte de testes automatizados cresceu de 13 para 33 testes, todos passando.

O único ponto novo identificado — um artefato de ponto flutuante no campo `total` da resposta imediata de `POST /orders` — é cosmético (o valor persistido no banco e todas as leituras subsequentes estão corretos) e não compromete nenhum critério de aceite; foi registrado como recomendação de baixa prioridade, não como bloqueador.

**Veredito: ✅ COMPLETE.** A Loja Glitch está pronta, do ponto de vista de completude funcional, para a fase revisada (catálogo com fotos, contas, pedidos, estoque, painel administrativo completo, e identidade visual). Fica como recomendação não bloqueadora a limpeza do artefato de ponto flutuante na resposta de criação de pedido.
