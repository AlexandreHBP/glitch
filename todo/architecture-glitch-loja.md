# Architecture Document - Loja Online Glitch

## Overview

- **Feature**: Glitch - Loja Online (catálogo, pedidos, estoque, painel admin e identidade visual)
- **Scope**: Full-stack (backend + frontend + infraestrutura inicial)
- **Created**: 2026-09-11
- **Requirements file**: `./todo/feature-glitch-loja.md`
- **Estado do repositório**: projeto do zero — hoje existe apenas `hello.js`. Não há `package.json`, `backend/`, `frontend/` nem `CLAUDE.md`.

> **Resumo em uma frase:** um monólito modular NestJS + PostgreSQL servindo uma SPA React em um único container Docker, entregue em 4 fases, começando pelo catálogo e pelo painel de produtos.

---

## Project Rule References

### Situação atual: a pasta `./.rules/` NÃO existe

Verificado com `ls ./.rules/` → pasta ausente. Não há `SUMMARY.md` nem arquivos de padrão neste repositório.

Como este projeto ainda não tem regras escritas, as convenções que os agentes do projeto (`.claude/agents/`) já assumem como padrão da casa foram usadas como base normativa. Elas descrevem, de forma explícita, o stack e a estrutura esperados:

1. **Monorepo `backend/` + `frontend/`, com o backend servindo o frontend como estático**
   - Fonte: `.claude/agents/devops-specialist.md` (seções 3.1 Dockerfile e "static assets / SPA fallback")
   - Pontos-chave:
     - Build multi-stage Node 22 Alpine; `backend/dist` → `/app/dist`, `frontend/dist` → `/app/public`
     - Frontend compilado com `VITE_API_URL=/api` (caminho relativo, mesma origem)
     - Porta 5000 em produção, 3000 no backend em desenvolvimento
     - `postgresql-client` presente na imagem (usado para `pg_dump`/backup)
     - Container roda como usuário `nodejs` (UID 1001), nunca root
   - Como se aplica: a Loja Glitch é um único deploy. Sem nginx separado, sem CORS em produção, sem infraestrutura extra para o Alexandre manter.

2. **Backend NestJS + TypeORM + PostgreSQL, organizado por módulos e use-cases**
   - Fonte: `.claude/agents/developer-fullstack.md` (STEP 3.1, ordem de implementação) e `.claude/agents/devops-specialist.md` (migrations, `migration.sh`, `entrypoint.sh`)
   - Pontos-chave:
     - Ordem obrigatória: Entities → DTOs → Repository → Use Cases → Services → Controllers → Rotas → Testes
     - Validação de entrada com `class-validator` nos DTOs
     - Migrations versionadas, executadas pelo `entrypoint.sh` antes de subir a aplicação
     - Arquivos pequenos e focados (máx. 200–300 linhas), comentário multi-linha no topo explicando o propósito
   - Como se aplica: cada módulo desta loja (catálogo, pedidos, estoque, playlist) segue exatamente essa cadeia.

3. **Frontend React + TypeScript com camada de API isolada**
   - Fonte: `.claude/agents/developer-fullstack.md` (STEP 3.2) e `.claude/agents/devops-specialist.md` (build Vite)
   - Pontos-chave:
     - Ordem: Types → API Client → Components → Forms → Integração
     - Validação no cliente consistente com a do backend
     - UX/UI responsiva e acessível
   - Como se aplica: RF13 (responsividade total) é requisito de aceite, não polimento final.

4. **Qualidade visual e acessibilidade da interface**
   - Fonte: `.claude/skills/frontend-design/SKILL.md` e `.claude/skills/skill-especialista-em-design-e-uiux/SKILL.md`
   - Como se aplica: a Fase 4 (glitch, parallax, ovelha, player) precisa passar por essas skills antes de ser considerada pronta — efeito bonito que quebra leitura ou performance reprova no critério de aceite do próprio RF13.

### AÇÃO RECOMENDADA (dívida de processo, não de código)

Os agentes `developer-fullstack`, `code-reviewer`, `devops-specialist` e `security-review` **leem `./.rules/` como fonte da verdade**. Enquanto a pasta não existir, cada um vai improvisar convenções próprias e o código vai divergir entre fases.

Ao final da **Fase 1**, criar `./.rules/` com, no mínimo:

| Arquivo | Conteúdo mínimo |
|---------|-----------------|
| `SUMMARY.md` | Índice dos demais arquivos |
| `backend-technology-stack.md` | Versões de Node, NestJS, TypeORM, Postgres |
| `frontend-technology-stack.md` | React, Vite, Tailwind, TanStack Query, versões |
| `backend-module-folder-structure.md` | A estrutura definida na seção "Backend Structure" deste documento |
| `how-to-create-use-case-backend.md` | O padrão de use-case desta seção |
| `how-to-create-typeorm-entity-backend.md` | Convenções de entidade (uuid, snake_case, timestamptz, numeric) |
| `how-to-create-migration-backend.md` + `migration-commands-packagejson-backend.md` | Comandos de migration |
| `how-to-use-data-validation-api-backend.md` | Padrão de DTO + class-validator |
| `how-authentication-works.md` | JWT, guards, papéis |
| `how-to-consume-api-frontend.md` | axios + TanStack Query, interceptor de token |
| `glitch-visual-identity-frontend.md` | Tokens de tema, efeitos e regra de `prefers-reduced-motion` |

Este documento é a semente desses arquivos: o que está aqui pode ser recortado para lá.

---

## Stack Tecnológico Escolhido

### Decisão

| Camada | Escolha | Versão-alvo |
|--------|---------|-------------|
| Runtime | Node.js | 22 LTS (Alpine) |
| Backend | NestJS + TypeScript | 10.x |
| ORM | TypeORM | 0.3.x |
| Banco | PostgreSQL | 16 |
| Validação | class-validator + class-transformer | atual |
| Auth | @nestjs/jwt + passport-jwt + bcrypt | atual |
| Upload | Multer (`@nestjs/platform-express`) + sharp | atual |
| Docs API | @nestjs/swagger | atual |
| Frontend | React + TypeScript + Vite | React 18, Vite 5 |
| Rotas | React Router | 6.x |
| Estado servidor | TanStack Query | 5.x |
| HTTP | axios | 1.x |
| Estilo | Tailwind CSS | 3.x |
| Componentes | shadcn/ui (Radix por baixo) | atual |
| Ícones | lucide-react | atual |
| Formulários | react-hook-form + zod | atual |
| Testes | Jest (back) / Vitest (front) | atual |
| Empacotamento | Docker multi-stage (1 imagem) | Node 22 Alpine |

### Justificativa

**Por que NestJS + TypeORM + PostgreSQL**
- É o stack que os agentes deste projeto já esperam (`.claude/agents/*`): Dockerfile, `entrypoint.sh`, `migration.sh` e o fluxo de revisão foram escritos para ele. Escolher outra coisa significaria reescrever a automação do repositório antes de escrever a primeira linha da loja.
- Estoque por variação exige **transação com lock** (duas pessoas comprando a última peça P preta ao mesmo tempo). Isso pede banco relacional com ACID de verdade — Postgres resolve com `SELECT ... FOR UPDATE`; um banco de documentos exigiria gambiarra.
- Preço, pedido e estoque são dados fortemente relacionais e com integridade obrigatória (FK, `CHECK stock_quantity >= 0`).

**Por que React + Vite (SPA), e não Next.js**
- O padrão da casa é o backend servir `frontend/dist` como estático, em um container só — modelo que não comporta SSR sem mudar toda a infraestrutura.
- Um segundo runtime (Node do Next) significa mais uma peça para o Alexandre manter, sem ganho na Fase 1.
- **Contrapartida honesta (risco assumido):** SPA tem SEO fraco. Para uma loja, isso importa a médio prazo. Mitigações já previstas: `react-helmet-async` com título/descrição/Open Graph por produto, URLs semânticas (`/produto/:slug`), `sitemap.xml` e `robots.txt` gerados pelo backend. Se busca orgânica virar prioridade de negócio, a solução é pré-renderizar as páginas de produto (ex.: `vite-plugin-ssg` ou um serviço de prerender) — **sem** trocar o stack.

**Por que Tailwind + shadcn/ui**
- O requisito pede explicitamente "bibliotecas prontas de ícones e componentes visuais" (RF/Identidade Visual).
- shadcn/ui entrega o componente como **código no seu projeto**, não como dependência fechada: dá para distorcer o visual até a estética underground da marca sem brigar com o tema da biblioteca. Uma lib com tema rígido (ex.: MUI) seria o caminho mais curto para um site que parece "loja genérica", o oposto do objetivo do negócio.
- Tailwind facilita a responsividade (RF13) por breakpoints declarados na própria marcação.

**Por que TanStack Query**
- Some com a maior fonte de bug de loja: cache desatualizado. "Admin atualiza estoque → catálogo reflete imediatamente" (critério do RF07) sai de graça com invalidação de query.

**O que ficou deliberadamente de fora do MVP**
- Redis, RabbitMQ, Bull, microserviços, SSE/websocket: volume de dezenas a centenas de clientes não justifica. Adicionam operação sem resolver nenhum RF.
- Gateway de pagamento: explicitamente fora de escopo (RN03).
- E-mail transacional: não há RF pedindo. Fica como evolução pós-Fase 3 (avisar mudança de status).

---

## ADR — Atualização (2026-09-11): dois frontends em vez de uma SPA única

**Decisão do dono do negócio (Alexandre), que substitui a seção anterior "Por que React + Vite (SPA), e não Next.js" quanto à topologia de frontend (as justificativas de Tailwind/shadcn/TanStack Query continuam válidas, agora aplicadas a dois projetos):**

O projeto passa a ter **dois frontends distintos**, ambos consumindo a mesma API do `./backend`:

| Projeto | Papel | Stack | Público | Porta dev |
|---------|-------|-------|---------|-----------|
| `./frontend` | **Painel administrativo** — cadastro de produtos (RF07), visualização de pedidos (RF08), gestão da playlist (RF10 admin) | Vite + React + TS + Tailwind (base herdada do template TailAdmin: layout, sidebar, ícones) | Só o Alexandre (role `admin`) | 5173 |
| `./site` | **Loja pública** — catálogo com variações (RF01), conta de cliente e login (RF02), pedido (RF03), acompanhamento de status (RF06), identidade visual completa da marca Glitch (RF09–RF13) | Next.js (App Router) + React + Tailwind | Clientes finais | 3001 (dev) |

**Por que mudar:**
- **Resolve o risco de SEO fraco já registrado acima.** A justificativa original para SPA ("um único container, sem SSR") assumia loja e painel no mesmo app. Como o painel administrativo não precisa de SEO (é área logada, uso interno do Alexandre) e a loja pública precisa, separar os dois permite usar Next.js **só onde SEO importa**, sem herdar a complexidade de SSR no painel administrativo.
- **Separação de responsabilidade e de risco de UI.** O painel é "sóbrio, para leigo operar sozinho" (ver seção "Painel administrativo: sóbrio de propósito"); a loja é "identidade visual forte, glitch, parallax, ovelha, player". Manter os dois no mesmo SPA já exigia decisão consciente de "desligar efeitos no admin" — com dois projetos essa fronteira é física, não apenas de `AdminLayout` vs `StoreLayout`.
- **Reaproveitamento do trabalho já existente:** o `./frontend` já estava scaffoldado a partir do template TailAdmin (sidebar, sistema de ícones, componentes de formulário/tabela prontos) — ótimo ponto de partida para um painel administrativo, mas cheio de páginas genéricas de CRM/financeiro que não pertencem a esta loja. O `./site` já estava scaffoldado como landing page Next.js (SEO, sitemap, robots, analytics já configurados) — ótimo ponto de partida para a loja pública.

**Consequências:**
- `frontend/` mantém o layout/sidebar/ícones do TailAdmin como base visual, mas **todas as páginas/componentes sem relação com a loja são removidas** (CRM, invoices, chat, calendário, tarefas, suporte, etc.) — Fase 0.
- `site/` herda a estrutura de landing page (Hero, Features, SEO, sitemap, robots, analytics) e evolui para incluir catálogo, conta de cliente, checkout e status de pedido, com a identidade visual da marca (Fase 1 a Fase 4).
- Ambos os projetos têm sua própria pasta `rules/` (convenções já existentes de cada template) e continuam **só consumindo a API**, nunca acessando o banco diretamente.
- Não há mais um único `Dockerfile`/container servindo `frontend/dist` como estático do backend — agora são **três processos** (backend API, admin Vite, site Next.js), cada um com seu próprio build/deploy. Ajuste de infraestrutura (Docker/deploy) fica registrado aqui como pendência para o devops-specialist revisar depois da Fase 1.
- `devmode.json` passa a orquestrar quatro serviços: `postgres`, `backend`, `frontend` (painel admin, porta 5173) e `site` (loja pública, porta 3001 em dev).
- CORS no backend precisa liberar as origens dos dois frontends (`http://localhost:5173` e `http://localhost:3001` em dev).

---

## Modelagem de Dados

O modelo completo está no diagrama `.kdraw/mer-do-esquema-da-loja-glitch.json` (abre a partir do nó **PostgreSQL** no `ROOT.json`). Resumo e decisões:

### Tabelas

| Tabela | Papel | Fase |
|--------|-------|------|
| `users` | Cliente e admin na mesma tabela, separados por `role` | 1 (admin) / 2 (cliente) |
| `categories` | Agrupamento do catálogo | 1 |
| `products` | Produto "pai": nome, descrição, preço base, ativo | 1 |
| `product_images` | Fotos do produto, com capa e ordem | 1 |
| `product_variants` | **Tamanho + cor + estoque próprio** | 1 |
| `orders` | Pedido, status, total e dados de entrega | 2 |
| `order_items` | Itens com preço congelado no momento da compra | 2 |
| `stock_movements` | Auditoria de toda entrada/saída de estoque | 2 |
| `order_status_history` | Histórico de mudanças de status | 3 |
| `playlist_tracks` | Faixas do player | 4 |

### Decisões de modelagem (e o porquê)

1. **Estoque mora na variação, nunca no produto** (`product_variants.stock_quantity`) — é a tradução literal da RN01. `products` não tem coluna de estoque; se tiver, os dois vão divergir.
2. **Constraint única `(product_id, size, color)`** em `product_variants`, além do `sku` único: impede o admin de cadastrar "P / Preto" duas vezes e criar dois estoques paralelos da mesma peça.
3. **`CHECK (stock_quantity >= 0)`** no banco: última linha de defesa contra venda de estoque negativo, mesmo que um bug passe pela regra de negócio.
4. **Preço congelado em `order_items`** (`unit_price`, `product_name`, `variant_label`): se o admin mudar o preço amanhã, o pedido de ontem continua valendo o que valia. Sem isso, o histórico do cliente muda sozinho.
5. **Sem tabela de carrinho.** O carrinho vive no `localStorage` do navegador até o checkout. Menos tabela, menos limpeza de dados órfãos — e o backend **revalida tudo** (preço e estoque) no `POST /orders`, então o carrinho local nunca é fonte da verdade.
6. **Endereço de entrega como `jsonb` snapshot em `orders`**, não tabela `addresses`: a entrega é combinada fora do site e o endereço precisa ser o daquele pedido. Uma tabela de endereços editáveis reescreveria o histórico.
7. **`numeric(10,2)` para dinheiro**, nunca `float`. ⚠️ O TypeORM devolve `numeric` como **string**; usar um `ColumnNumericTransformer` nas entidades para receber `number` no TypeScript. Esquecer isso gera `"10.00" + "5.00" = "10.005.00"` no cálculo do total.
8. **`timestamptz` em todo timestamp**, com o servidor em UTC e formatação no frontend (`America/Sao_Paulo`).
9. **UUID como PK** em todas as tabelas: não expõe volume de vendas na URL (um `/pedido/7` conta quantos pedidos a loja já teve).
10. **`order_number` legível** (`GLT-2026-0001`, único) para o admin e o cliente conversarem sobre o pedido sem ler UUID.

### Enum de status do pedido

```
AGUARDANDO_CONTATO → EM_PREPARO → ENVIADO → ENTREGUE
        ↓                ↓            ↓
             CANCELADO (devolve estoque)
```

Guardado como `varchar(24)` com validação por enum TypeScript (não como `enum` nativo do Postgres: alterar enum nativo exige migration chata a cada novo status). Ciclo completo no diagrama `.kdraw/fluxo-de-status-do-pedido.json`.

---

## Technical Design

### Backend Structure

#### Estrutura de pastas

```
backend/
├── src/
│   ├── main.ts                       # bootstrap, prefixo /api/v1, Swagger, estáticos + SPA fallback
│   ├── app.module.ts
│   ├── common/
│   │   ├── decorators/               # @CurrentUser, @Roles, @Public
│   │   ├── guards/                   # JwtAuthGuard, RolesGuard
│   │   ├── filters/                  # HttpExceptionFilter
│   │   ├── interceptors/             # LoggingInterceptor
│   │   ├── transformers/             # ColumnNumericTransformer
│   │   └── dto/                      # PaginationQueryDto, PaginatedResponseDto
│   ├── database/
│   │   ├── data-source.ts            # DataSource do TypeORM (CLI de migration)
│   │   ├── migrations/
│   │   └── seeds/                    # seed-admin.ts, seed-categories.ts
│   └── modules/
│       ├── auth/
│       │   ├── dto/                  # login.dto.ts, register.dto.ts
│       │   ├── strategies/           # jwt.strategy.ts
│       │   ├── use-cases/            # login.usecase.ts, register-customer.usecase.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   └── auth.module.ts
│       ├── users/
│       │   ├── entities/user.entity.ts
│       │   ├── dto/
│       │   ├── use-cases/
│       │   ├── users.controller.ts
│       │   ├── users.service.ts
│       │   └── users.module.ts
│       ├── catalog/
│       │   ├── entities/             # product, product-variant, product-image, category
│       │   ├── dto/                  # create/update de produto, variação e categoria
│       │   ├── use-cases/
│       │   │   ├── list-public-products.usecase.ts
│       │   │   ├── get-product-by-slug.usecase.ts
│       │   │   ├── create-product.usecase.ts
│       │   │   ├── update-product.usecase.ts
│       │   │   ├── delete-product.usecase.ts
│       │   │   ├── upsert-variant.usecase.ts
│       │   │   └── set-variant-stock.usecase.ts
│       │   ├── catalog.controller.ts        # rotas públicas
│       │   ├── catalog-admin.controller.ts  # rotas /admin, com RolesGuard
│       │   ├── catalog.service.ts
│       │   └── catalog.module.ts
│       ├── inventory/
│       │   ├── entities/stock-movement.entity.ts
│       │   ├── use-cases/
│       │   │   ├── debit-stock.usecase.ts
│       │   │   ├── restore-stock.usecase.ts
│       │   │   └── adjust-stock.usecase.ts
│       │   ├── inventory.service.ts
│       │   └── inventory.module.ts
│       ├── orders/
│       │   ├── entities/             # order, order-item, order-status-history
│       │   ├── dto/                  # create-order.dto.ts, update-order-status.dto.ts
│       │   ├── use-cases/
│       │   │   ├── create-order.usecase.ts
│       │   │   ├── list-my-orders.usecase.ts
│       │   │   ├── get-order.usecase.ts
│       │   │   ├── list-all-orders.usecase.ts
│       │   │   └── change-order-status.usecase.ts
│       │   ├── orders.controller.ts
│       │   ├── orders-admin.controller.ts
│       │   ├── orders.service.ts
│       │   └── orders.module.ts
│       ├── playlist/
│       │   ├── entities/playlist-track.entity.ts
│       │   ├── dto/
│       │   ├── use-cases/
│       │   ├── playlist.controller.ts
│       │   ├── playlist-admin.controller.ts
│       │   └── playlist.module.ts
│       └── uploads/
│           ├── uploads.controller.ts
│           ├── uploads.service.ts     # Multer + sharp (resize/webp)
│           └── uploads.module.ts
├── test/
├── package.json
└── tsconfig.json
```

Composição dos módulos e suas dependências: `.kdraw/infra-do-backend-nestjs-da-loja.json`.

#### Entidade central — variação com estoque

```typescript
/**
 * Variação vendável de um produto (tamanho + cor).
 * É AQUI que o estoque vive — nunca em Product (RN01).
 */
@Entity('product_variants')
@Unique('uq_variant_product_size_color', ['productId', 'size', 'color'])
@Check('ck_variant_stock_non_negative', '"stock_quantity" >= 0')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'varchar', length: 60, unique: true })
  sku: string;

  @Column({ type: 'varchar', length: 20 })
  size: string;

  @Column({ type: 'varchar', length: 40 })
  color: string;

  /** Preço só desta variação; nulo = usa products.base_price */
  @Column({ name: 'price_override', type: 'numeric', precision: 10, scale: 2,
           nullable: true, transformer: new ColumnNumericTransformer() })
  priceOverride: number | null;

  @Column({ name: 'stock_quantity', type: 'int', default: 0 })
  stockQuantity: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
```

#### API Endpoints

**Públicos (sem token)**

| Método | Endpoint | Descrição | Request | Response | Fase |
|--------|----------|-----------|---------|----------|------|
| GET | `/api/v1/products` | Lista catálogo (paginado, filtro por categoria e busca) | query | `{ data, total, page }` | 1 |
| GET | `/api/v1/products/:slug` | Detalhe com variações e estoque | - | Produto + variações | 1 |
| GET | `/api/v1/categories` | Categorias ativas | - | Array | 1 |
| GET | `/api/v1/playlist` | Faixas ativas, ordenadas | - | Array | 4 |
| POST | `/api/v1/auth/register` | Cria conta de cliente | RegisterDto | `{ accessToken, user }` | 2 |
| POST | `/api/v1/auth/login` | Login | LoginDto | `{ accessToken, user }` | 2 |

**Cliente autenticado (JWT, `role=customer`)**

| Método | Endpoint | Descrição | Request | Response | Fase |
|--------|----------|-----------|---------|----------|------|
| GET | `/api/v1/me` | Dados da conta | - | User | 2 |
| POST | `/api/v1/orders` | Cria pedido (debita estoque) | CreateOrderDto | Pedido criado | 2 |
| GET | `/api/v1/orders` | Meus pedidos | - | Array | 2 |
| GET | `/api/v1/orders/:id` | Detalhe do meu pedido + histórico | - | Pedido | 3 |

**Admin (JWT, `role=admin`)**

| Método | Endpoint | Descrição | Request | Response | Fase |
|--------|----------|-----------|---------|----------|------|
| GET | `/api/v1/admin/products` | Lista tudo, inclusive inativos | query | Paginado | 1 |
| POST | `/api/v1/admin/products` | Cria produto (com variações) | CreateProductDto | Produto | 1 |
| PUT | `/api/v1/admin/products/:id` | Atualiza produto | UpdateProductDto | Produto | 1 |
| DELETE | `/api/v1/admin/products/:id` | Remove/inativa produto | - | `{ success }` | 1 |
| PUT | `/api/v1/admin/variants/:id/stock` | Ajusta estoque da variação | `{ quantity, reason }` | Variação | 1 |
| POST | `/api/v1/admin/uploads/image` | Envia foto (multipart) | file | `{ url }` | 1 |
| GET | `/api/v1/admin/orders` | Todos os pedidos (filtro por status) | query | Paginado | 2 |
| PATCH | `/api/v1/admin/orders/:id/status` | Muda status | `{ status, note }` | Pedido | 3 |
| GET/POST/PUT/DELETE | `/api/v1/admin/playlist[...]` | CRUD de faixas | TrackDto | Faixa | 4 |
| POST | `/api/v1/admin/uploads/audio` | Envia música (multipart) | file | `{ url }` | 4 |

**Convenção:** rotas administrativas ficam sob `/admin/*` e em **controller separado**, com `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('admin')` na classe inteira. Nunca misturar rota pública e rota admin no mesmo controller — é assim que um endpoint de admin acaba exposto sem querer.

#### DTO com validação

```typescript
// class-validator: a validação é declarada no DTO, nunca espalhada no controller
export class CreateOrderDto {
  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ArrayNotEmpty({ message: 'O pedido precisa ter pelo menos um item' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsEnum(DeliveryMethod, { message: 'Forma de entrega inválida' })
  deliveryMethod: DeliveryMethod;

  @ValidateIf((o) => o.deliveryMethod === DeliveryMethod.SHIPPING)
  @IsObject()
  @ValidateNested()
  @Type(() => DeliveryAddressDto)
  deliveryAddress?: DeliveryAddressDto;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  customerNotes?: string;
}

export class CreateOrderItemDto {
  @IsUUID()
  productVariantId: string;

  @IsInt()
  @Min(1)
  @Max(20)
  quantity: number;
}
```

⚠️ **O DTO do pedido NÃO aceita preço.** O cliente manda apenas variação e quantidade; o preço e o total são sempre lidos do banco dentro do use-case. Aceitar preço vindo do cliente é como aceitar que ele diga quanto vai pagar.

`main.ts` liga o `ValidationPipe` global:
```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,            // remove campos não declarados no DTO
  forbidNonWhitelisted: true, // e recusa a requisição se vierem
  transform: true,
}));
```

#### Use-case crítico — criação de pedido

Sequência completa em `.kdraw/sequencia-de-finalizacao-do-pedido.json`.

```typescript
/**
 * Cria o pedido, congela preços e debita estoque — tudo em UMA transação.
 * Se qualquer item faltar, nada é gravado e nenhum estoque é debitado.
 */
@Injectable()
export class CreateOrderUseCase {
  constructor(
    private readonly dataSource: DataSource,
    private readonly inventoryService: InventoryService,
  ) {}

  async execute(userId: string, dto: CreateOrderDto): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      // 1. Trava as variações do pedido (evita venda dupla da última peça)
      const variants = await manager.find(ProductVariant, {
        where: { id: In(dto.items.map((i) => i.productVariantId)) },
        relations: ['product'],
        lock: { mode: 'pessimistic_write' },
      });

      // 2. Valida existência, produto ativo e estoque suficiente
      //    -> erro 409 com a lista de itens indisponíveis (RF04)

      // 3. Calcula total com o preço DO BANCO (priceOverride ?? basePrice)

      // 4. Debita estoque + grava stock_movements (InventoryService, mesmo manager)

      // 5. Grava order + order_items com snapshot de nome, variação e preço

      // 6. Grava order_status_history com AGUARDANDO_CONTATO

      // 7. Retorna o pedido com order_number
    });
  }
}
```

Regras de ouro deste use-case:
- **Uma transação só.** Estoque e pedido nascem juntos ou não nascem.
- **Lock pessimista** nas variações, não lock otimista: o conflito é raro, mas o prejuízo (vender o que não existe) é alto e o custo do lock é irrelevante nesse volume.
- **Erro 409** com a lista de itens indisponíveis, para o frontend marcar exatamente o que falhou no carrinho.

---

### Frontend Structure

#### Estrutura de pastas

```
frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes/
│   │   ├── AppRouter.tsx
│   │   ├── ProtectedRoute.tsx        # exige login
│   │   └── AdminRoute.tsx            # exige role=admin
│   ├── layouts/
│   │   ├── StoreLayout.tsx           # header + footer (ovelha) + player
│   │   └── AdminLayout.tsx           # painel sóbrio, sem efeitos
│   ├── pages/
│   │   ├── store/                    # Home, Catalog, ProductDetail, Cart, Checkout
│   │   ├── account/                  # Login, Register, MyOrders, OrderDetail
│   │   └── admin/                    # Products, ProductForm, Orders, OrderDetail, Playlist
│   ├── components/
│   │   ├── ui/                       # shadcn/ui (button, dialog, input, ...)
│   │   ├── catalog/                  # ProductCard, VariantSelector, StockBadge
│   │   ├── cart/                      # CartDrawer, CartItemRow
│   │   └── common/                   # PageTitle, EmptyState, Pagination
│   ├── features/
│   │   └── glitch/                   # << toda a identidade visual (Fase 4)
│   │       ├── GlitchText.tsx
│   │       ├── GlitchImage.tsx
│   │       ├── ParallaxSection.tsx
│   │       ├── BlackSheep.tsx
│   │       ├── MusicPlayer.tsx
│   │       ├── MusicPlayerProvider.tsx
│   │       ├── useGlitchHover.ts
│   │       ├── useReducedMotion.ts
│   │       └── glitch.css
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── CartContext.tsx
│   ├── services/
│   │   ├── api.ts                    # instância axios + interceptors
│   │   ├── productService.ts
│   │   ├── orderService.ts
│   │   ├── authService.ts
│   │   └── playlistService.ts
│   ├── hooks/                        # useProducts, useMyOrders, useDebounce...
│   ├── types/                        # product.types.ts, order.types.ts...
│   └── styles/
│       ├── globals.css               # tokens CSS (--glitch-wine: #670001)
│       └── tailwind.config.ts
```

Mapa navegável do frontend: `.kdraw/infra-do-frontend-react-da-loja.json`.

#### Camada de API

```typescript
// services/api.ts — ponto único de chamada
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('glitch.token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('glitch.token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// services/productService.ts
export const productService = {
  list: (params: ListParams) => api.get<Paginated<Product>>('/v1/products', { params }),
  getBySlug: (slug: string) => api.get<Product>(`/v1/products/${slug}`),
  adminCreate: (data: CreateProductDto) => api.post<Product>('/v1/admin/products', data),
  adminUpdate: (id: string, data: UpdateProductDto) => api.put<Product>(`/v1/admin/products/${id}`, data),
  adminSetStock: (variantId: string, quantity: number, reason: string) =>
    api.put(`/v1/admin/variants/${variantId}/stock`, { quantity, reason }),
};
```

Consumo sempre via TanStack Query, com invalidação no que muda:
```typescript
const { mutate } = useMutation({
  mutationFn: productService.adminUpdate,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
});
```
É essa invalidação que cumpre literalmente o critério "a nova quantidade é refletida imediatamente no site" (RF07).

---

## Identidade Visual: como os efeitos são estruturados (Fase 4)

Visão dedicada: `.kdraw/infra-da-identidade-visual-glitch-no-frontend.json`.

**Princípio que rege a fase inteira:** todo efeito é **decoração sobre conteúdo que já funciona sem ele**. Desligando `features/glitch/` inteira, a loja continua vendendo. É isso que protege o requisito de performance e legibilidade citado nos riscos do documento de negócio.

### 1. Tokens de tema (base de tudo)

`styles/globals.css` — a cor da marca existe em **um** lugar:

```css
:root {
  --glitch-wine: #670001;         /* cor principal da marca */
  --glitch-wine-bright: #8f0102;  /* hover / destaque */
  --glitch-wine-deep: #3d0001;    /* fundos e sombras */
  --glitch-ink: #0b0b0c;          /* preto do site */
  --glitch-bone: #f2efe9;         /* texto claro */
  --glitch-cyan: #00e5ff;         /* canal RGB do efeito glitch */
  --glitch-magenta: #ff003c;      /* canal RGB do efeito glitch */
}
```

Exposto no `tailwind.config.ts` como `colors.wine`, `colors.ink`, etc. **Nenhum componente escreve `#670001` diretamente.**

⚠️ Contraste: `#670001` é escuro. Texto sobre ele deve ser `--glitch-bone` ou branco — cinza médio reprova em contraste no celular sob luz do dia.

### 2. `<GlitchText>` — logo e títulos (RF09)

- **CSS puro**, sem JS por frame: o texto é renderizado três vezes (o real + duas cópias via `::before`/`::after` com `content: attr(data-text)`), as cópias deslocadas em ciano e magenta, animadas com `clip-path` em `@keyframes`.
- O texto **real permanece intacto e selecionável** — as cópias são `aria-hidden`. Leitores de tela e Google leem o texto normal.
- Uso: `<GlitchText as="h1" intensity="strong">GLITCH</GlitchText>` no logo; `intensity="subtle"` nos títulos de seção.
- **Proibido** em texto corrido, descrição de produto, preço e qualquer coisa dentro do painel admin.

### 3. `useGlitchHover` — reação em botões e imagens (RF09)

- Classe utilitária `.glitch-hover` + hook para quem precisa disparar por estado.
- Desktop: `:hover`. Celular: `:active` dentro de `@media (hover: none)`, porque em touch não existe hover — atender o critério "ou tocando, no celular" depende exatamente disso.
- Duração curta (150–250ms) e sem deslocamento de layout (só `transform`/`filter`), para não empurrar o conteúdo.

### 4. `<ParallaxSection>` (RF12)

- Único efeito com JS por frame. Implementação: `IntersectionObserver` para só calcular a seção visível + `requestAnimationFrame` aplicando `transform: translate3d()` no fundo.
- **Nunca** animar `background-position`, `top` ou `margin` (forçam layout a cada frame).
- **Desligado abaixo de 768px** e quando `prefers-reduced-motion: reduce` — no celular vira fundo estático. É o maior candidato a travar a rolagem em aparelho fraco, e o requisito de responsividade vale mais que o efeito.

### 5. `<BlackSheep>` — ovelha no rodapé (RF11)

- **SVG inline** (não GIF, não vídeo): escala em qualquer tela, pesa poucos KB e aceita a cor do tema.
- Animação `@keyframes` de `translateX` de -10% a 110% da largura do rodapé, em loop infinito, com um leve balanço vertical para dar o passo. `will-change: transform` e nada mais.
- Vive no `StoreLayout`, então aparece em **todas** as páginas da loja sem ser remontada a cada rota.
- Some com `prefers-reduced-motion` (fica parada, não some do layout).

### 6. `<MusicPlayer>` + `MusicPlayerProvider` (RF10)

- **Um único `HTMLAudioElement`**, criado no `MusicPlayerProvider` montado no `StoreLayout` — assim a música **não corta** quando o cliente navega entre páginas (uma SPA é o que torna isso possível).
- `autoPlay` **nunca** é usado e `preload="none"`: cumpre a RN04 e evita baixar MP3 de quem nunca vai clicar em play (economia direta no tempo de carregamento).
- Playlist vem de `GET /api/v1/playlist` (cache do TanStack Query); a ordem é a `position` definida pelo admin.
- Estado persistido em `localStorage`: faixa escolhida, volume e se estava tocando — mas **sem religar sozinho** no próximo acesso.
- Responsivo: no desktop, barra fixa no rodapé com lista de faixas; no celular, botão flutuante compacto que abre a lista em drawer, sem cobrir o botão de compra.
- Acessibilidade: botões com `aria-label`, controlável por teclado, e o player não rouba foco.

### 7. Painel administrativo: sóbrio de propósito

`AdminLayout` **não** carrega glitch, parallax, ovelha nem player. A persona é "dono do negócio, sem conhecimento técnico, gerenciando sozinho" — ali o valor é clareza e velocidade, não estética. Usa a paleta vinho apenas em cabeçalho e botões primários.

### 8. Orçamento de performance (critério de aceite da Fase 4)

| Métrica | Alvo |
|---------|------|
| LCP em 4G (celular) | < 2,5s |
| CLS | < 0,1 (efeitos só usam `transform`) |
| JS extra da camada glitch | < 30 KB gzip |
| Imagens de produto | webp, `loading="lazy"`, `width`/`height` declarados |
| Áudio | nada baixado antes do clique em play |

---

## Autenticação e Autorização

### Modelo

- **Uma tabela `users`** com `role: 'customer' | 'admin'`. Não existe tabela separada de admin — o painel é do mesmo sistema, e duplicar a identidade dobraria a superfície de bug e de ataque.
- **Senha com bcrypt**, custo 10. Hash nunca sai do backend (`@Exclude()` na entidade + `ClassSerializerInterceptor`).
- **JWT** assinado com `JWT_SECRET` (env, nunca no código), expiração de 7 dias para cliente.
- **Guards**: `JwtAuthGuard` (global, com `@Public()` liberando catálogo e playlist) + `RolesGuard` com `@Roles('admin')` nas rotas `/admin/*`.

### Criação do admin

Seed (`database/seeds/seed-admin.ts`) executado uma vez, lendo `ADMIN_EMAIL` e `ADMIN_PASSWORD` do ambiente. A seed **falha se `ADMIN_PASSWORD` não estiver definida** — sem senha padrão no código, nunca.

### Riscos aceitos e caminho de evolução

⚠️ O token fica no `localStorage`, o que o expõe a XSS. Aceito no MVP porque:
- React escapa conteúdo por padrão; a regra do projeto é **nunca** usar `dangerouslySetInnerHTML` (nem para a descrição do produto — se precisar de formatação, usar um subset markdown sanitizado);
- Uma CSP restritiva será configurada no backend (Helmet).

Evolução prevista para depois da Fase 3, se a loja crescer: refresh token em cookie `httpOnly` + `SameSite=Strict`, com access token curto em memória.

### Proteções mínimas (Fase 2, não negociáveis)

- Rate limit (`@nestjs/throttler`) em `/auth/login` e `/auth/register` — 5 tentativas/minuto por IP.
- Mensagem de erro genérica no login ("e-mail ou senha inválidos"), sem revelar se o e-mail existe.
- Cliente só lê o **próprio** pedido: `GET /orders/:id` filtra por `userId` do token. Confiar no ID da URL é o furo de autorização mais comum em loja.
- Upload: whitelist de mime-type (`image/jpeg|png|webp`, `audio/mpeg`), limite de tamanho (8 MB imagem / 15 MB áudio), nome de arquivo gerado pelo servidor (nunca o do usuário).

---

## Business Rules Implementation

| # | Regra | Onde | Como |
|---|-------|------|------|
| RN01 | Estoque por variação | `product_variants.stock_quantity` + `InventoryService` | Coluna só existe na variação; `CHECK >= 0` no banco |
| RN02 | Conta obrigatória para comprar | `JwtAuthGuard` no `POST /orders` + `ProtectedRoute` no checkout | Backend recusa com 401; frontend leva ao login e **preserva o carrinho** |
| RN03 | Pagamento fora do site | Ausência de módulo de pagamento; texto no checkout e no e-mail/tela de confirmação | Pedido nasce em `AGUARDANDO_CONTATO` |
| RN04 | Música não inicia sozinha | `MusicPlayerProvider` | Sem `autoPlay`, `preload="none"`, play só por clique |
| — | Preço congelado | `CreateOrderUseCase` | Snapshot em `order_items` |
| — | Produto sem estoque não vende | `CreateOrderUseCase` (409) + `StockBadge` no frontend | Backend é a autoridade; UI só antecipa o aviso |
| — | Cancelamento devolve estoque | `ChangeOrderStatusUseCase` → `RestoreStockUseCase` | Uma vez só, protegido pelo status atual dentro da transação |
| — | Slug único de produto | `CreateProductUseCase` | Gerado do nome + sufixo se colidir |

---

## Data Flow

```
[Cliente escolhe tamanho/cor e clica em Comprar]
     │
     ↓
[CartContext (localStorage)] ──── sem rede, instantâneo
     │
     ↓ (clica em Finalizar)
[ProtectedRoute] ── não logado? ──> [Login/Cadastro] ──> volta com o carrinho intacto
     │ logado
     ↓
[orderService.create] ──> POST /api/v1/orders  (JWT no header)
                                │
                                ↓
                       [OrdersController]  valida DTO
                                │
                                ↓
                       [CreateOrderUseCase]  ── TRANSAÇÃO ──┐
                                │                           │
                                ↓                           │
                       [lock nas variações]                 │
                       [recalcula preço do banco]           │
                       [InventoryService debita estoque]    │
                       [grava order + items + histórico]    │
                                │                           │
                                ↓ ───────────────────────────┘
                       [Postgres]  commit ou rollback total
                                │
                                ↓
[Tela de confirmação] <── 201 { orderNumber } ──┘
     │
     ↓
[Admin abre /admin/pedidos] ──> GET /api/v1/admin/orders ──> pedido já está lá
     │
     ↓
[Admin muda status] ──> PATCH /admin/orders/:id/status ──> histórico gravado
     │
     ↓
[Cliente vê o status em Minha Conta]
```

---

## Ordem de Implementação (alinhada às 4 fases)

### Fase 0 — Fundação (pré-requisito, ~não entrega tela)

Sem isso nada das fases seguintes compila. **Deve ser a primeira tarefa entregue.**

- [ ] `backend/` NestJS com `main.ts` (prefixo `/api/v1`, ValidationPipe global, Swagger, estáticos + SPA fallback)
- [ ] TypeORM + `data-source.ts` + scripts de migration no `package.json`
- [ ] `frontend/` Vite + React + TS + Tailwind + shadcn/ui, com tokens da marca já no tema
- [ ] `build/Dockerfile`, `build/entrypoint.sh`, `build/migration.sh` e `docker-compose.yml` (app + postgres + volume de mídia) — tarefa do **devops-specialist**
- [ ] `.env.example` com `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `UPLOADS_DIR`
- [ ] Criar `./.rules/` conforme a tabela da seção "Project Rule References"

### Fase 1 — Catálogo + painel de produtos + responsividade (RF01, RF07, RF13)

**Backend**
- [ ] Entidades `User`, `Category`, `Product`, `ProductVariant`, `ProductImage` + migration inicial
- [ ] Seed do admin e de categorias
- [ ] `AuthModule` mínimo: login do admin, `JwtAuthGuard`, `RolesGuard` (cadastro de cliente fica na Fase 2)
- [ ] `CatalogModule`: use-cases públicos (listar, detalhe por slug) e admin (CRUD + variações + estoque)
- [ ] `UploadsModule`: imagem com Multer + sharp (webp, máx. 1600px, miniatura)
- [ ] Swagger documentado

**Frontend**
- [ ] `types/`, `services/api.ts`, `productService`
- [ ] `StoreLayout` + `AdminLayout` responsivos (sem efeitos ainda)
- [ ] Home + Catálogo (grade responsiva, filtro por categoria, busca com debounce)
- [ ] Detalhe do produto: galeria, `VariantSelector`, `StockBadge` ("Esgotado" desabilita a seleção)
- [ ] Login do admin + `AdminRoute`
- [ ] `/admin/produtos`: lista, formulário (dados + fotos + variações + estoque), exclusão
- [ ] Teste real em 360px, 768px e 1440px

**Pronto quando:** o Alexandre cadastra um produto com duas variações e vê ele no catálogo, pelo celular.

### Fase 2 — Conta, pedidos e estoque (RF02, RF03, RF04, RF05, RF08)

- [ ] Migration: `orders`, `order_items`, `stock_movements`
- [ ] `AuthModule`: cadastro de cliente, `/me`, throttler no login
- [ ] `InventoryModule`: `debit-stock`, `restore-stock`, `adjust-stock` (com `stock_movements`)
- [ ] `CreateOrderUseCase` com transação + lock pessimista (**o coração do sistema**)
- [ ] `list-my-orders`, `list-all-orders` (admin, com filtro por status)
- [ ] Frontend: `CartContext` + `CartDrawer`, páginas de Login/Cadastro, Checkout (com aviso claro de RN03), Minha Conta
- [ ] Frontend: `/admin/pedidos` com lista e detalhe
- [ ] Testes Jest do `CreateOrderUseCase`: estoque insuficiente, produto inativo, dois pedidos concorrentes

**Pronto quando:** um pedido feito pelo celular aparece no painel sem ninguém anotar nada, e o estoque cai sozinho.

### Fase 3 — Status do pedido (RF06)

- [ ] Migration `order_status_history`
- [ ] `ChangeOrderStatusUseCase` com máquina de estados (transições válidas apenas) e devolução de estoque no cancelamento
- [ ] `PATCH /admin/orders/:id/status`
- [ ] Admin: mudar status na lista e no detalhe, com nota opcional
- [ ] Cliente: linha do tempo do pedido em Minha Conta
- [ ] (Opcional, se o negócio pedir) e-mail avisando mudança de status

### Fase 4 — Identidade visual e experiência (RF09, RF10, RF11, RF12)

Ordem interna, do menor risco para o maior:
- [ ] `useReducedMotion` + tokens finalizados (base para todo o resto)
- [ ] `GlitchText` no logo e nos títulos + `useGlitchHover` em botões e cards
- [ ] `BlackSheep` no rodapé
- [ ] Backend `PlaylistModule` + upload de áudio + `/admin/playlist`
- [ ] `MusicPlayerProvider` + `MusicPlayer` (desktop e mobile)
- [ ] `ParallaxSection` na home e nas seções de destaque (**por último: maior risco de performance**)
- [ ] Auditoria final: Lighthouse mobile, teste com `prefers-reduced-motion`, teste em celular real

---

## Implementation Checklist

### Backend
- [ ] Entidades com UUID, `snake_case` no banco, `timestamptz` e transformer de `numeric`
- [ ] Migrations versionadas (nunca `synchronize: true` fora de dev)
- [ ] DTOs com `class-validator` e mensagens em pt-BR
- [ ] Use-cases pequenos, um por operação
- [ ] Controllers separados: público vs. `/admin`
- [ ] Guards aplicados na classe, não método a método
- [ ] Swagger com exemplos de request/response
- [ ] Arquivos de 200–300 linhas no máximo

### Frontend
- [ ] Types espelhando os DTOs do backend
- [ ] Todas as chamadas via `services/` + TanStack Query (nenhum `fetch` solto em componente)
- [ ] Formulários com react-hook-form + zod, validando o mesmo que o backend
- [ ] Estados de loading, vazio e erro em toda lista
- [ ] Responsivo validado em 360/768/1440
- [ ] Imagens com `loading="lazy"` e dimensões declaradas

### Testing
- [ ] Unit (Jest): `CreateOrderUseCase`, `InventoryService`, `ChangeOrderStatusUseCase`
- [ ] Integração: fluxo `cadastro → login → pedido → estoque debitado`
- [ ] Manual: celular real na Fase 1 e na Fase 4

### Architecture Diagrams (kanban-draw)
- [x] Diagramas `.kdraw` existentes analisados antes de projetar (pasta não existia — conjunto criado do zero)
- [x] `.kdraw` criados para refletir a arquitetura desta feature
- [x] Validados com o validador da skill (`✅ OK`, inclusive o mapa)
- [x] Publicados com o publisher da skill

---

## Architecture Diagrams (kanban-draw)

Diagramas analisados e mantidos via a skill `kanban-draw-diagramas`. A pasta `.kdraw/` **não existia** — este é o primeiro mapa do projeto.

| Diagrama (`.kdraw/*.json`) | Kind | Mudança | Pergunta que responde |
|---------------------------|------|---------|------------------------|
| `ROOT.json` | infra | Criado | Quais são as peças da Loja Glitch e como conversam? |
| `infra-do-frontend-react-da-loja.json` | infra | Criado | Como a SPA se organiza entre loja, conta e painel admin? |
| `infra-da-identidade-visual-glitch-no-frontend.json` | infra | Criado | Como glitch, parallax, ovelha e player se encaixam no frontend? |
| `infra-do-backend-nestjs-da-loja.json` | infra | Criado | Quais módulos compõem a API e quem fala com o banco? |
| `mer-do-esquema-da-loja-glitch.json` | MER | Criado | Como produtos, variações, estoque, pedidos e playlist estão modelados? |
| `sequencia-de-finalizacao-do-pedido.json` | sequence | Criado | O que acontece, em ordem, quando o cliente finaliza a compra? |
| `fluxo-de-status-do-pedido.json` | fluxograma | Criado | Por quais estados o pedido passa, incluindo cancelamento? |
| `fluxo-de-publicacao-de-produto-no-painel-admin.json` | fluxograma | Criado | Que passos o admin segue para publicar um produto? |

**Grafo de navegação (a partir do `ROOT.json`):**

```
ROOT.json
├── spa    → infra-do-frontend-react-da-loja.json
│              └── visual → infra-da-identidade-visual-glitch-no-frontend.json
├── api    → infra-do-backend-nestjs-da-loja.json
│              ├── catalog → fluxo-de-publicacao-de-produto-no-painel-admin.json
│              ├── orders  → sequencia-de-finalizacao-do-pedido.json
│              │               └── pedido → fluxo-de-status-do-pedido.json
│              └── db      → mer-do-esquema-da-loja-glitch.json
└── db     → mer-do-esquema-da-loja-glitch.json   (mesmo arquivo, dois pais)
```

- **Validado:** sim (`✅ OK` em todos os 8 arquivos e no mapa) · **Publicado:** sim

⚠️ Estes diagramas descrevem a arquitetura **projetada**, não código existente (o repositório está vazio). Conforme cada fase for implementada, o `developer-fullstack` deve reportar divergências e o `software-architect` atualiza os `.kdraw` — eles precisam virar retrato do código, não do plano.

---

## Notes for Developer

### Armadilhas específicas deste projeto

1. **`numeric` do TypeORM volta como string.** Sem `ColumnNumericTransformer`, o total do pedido sai concatenado, não somado. É o bug número um deste modelo de dados.
2. **Volume de mídia precisa ser persistente.** Se o `docker-compose`/deploy não montar volume em `UPLOADS_DIR`, todas as fotos do catálogo somem no próximo restart do container. Verificar isso na Fase 0, não na Fase 4.
3. **Carrinho não pode se perder no login.** O cliente monta o carrinho deslogado, é mandado para o cadastro (RN02) e precisa voltar com tudo. Guardar no `localStorage` antes de redirecionar e revalidar estoque na volta.
4. **`onDelete` das FKs:** `CASCADE` em variações e fotos (pertencem ao produto), mas **`RESTRICT`** em `order_items → product_variants`. Apagar um produto não pode apagar o histórico de vendas. Por isso o `DELETE /admin/products/:id` deve **inativar** (`active = false`) quando o produto já tiver pedidos, e só apagar de verdade quando nunca foi vendido — avisando o admin em linguagem simples ("este produto já foi vendido, então ele será apenas ocultado do site").
5. **Casos de borda do estoque:** quantidade pedida maior que o estoque; variação inativada entre a montagem do carrinho e o checkout; produto inativado com o cliente na página; dois pedidos simultâneos da última peça. Todos devem retornar 409 com a lista do que falhou, item a item.
6. **Painel do admin é para leigo.** Sem jargão: "Esgotado" em vez de "stock = 0", "Publicado/Não publicado" em vez de "active: true/false", "Aguardando contato" em vez de "AWAITING_CONTACT". Confirmação antes de excluir. Mensagem de erro que diz o que fazer.
7. **Glitch nunca em conteúdo funcional.** Preço, descrição, campos de formulário e qualquer coisa do painel admin ficam fora do efeito — o próprio critério de aceite pede "sem prejudicar a leitura do conteúdo".
8. **`prefers-reduced-motion` não é opcional.** É a chave que evita que a Fase 4 vire um problema de acessibilidade e de enjoo visual, e o interruptor geral para desligar efeitos em dispositivo fraco.

### Performance (risco levantado no documento de negócio)

- Catálogo paginado (12–24 itens por página), nunca carregar 100 produtos de uma vez.
- Índices: `products(slug)`, `products(active, category_id)`, `product_variants(product_id)`, `orders(user_id, created_at)`, `orders(status)`.
- Imagens convertidas para webp no upload, servidas com `Cache-Control` longo (o nome do arquivo já é único).
- Efeitos glitch em CSS puro; JS por frame só no parallax, e só no desktop.

### Operação (para o devops-specialist)

- Backup diário do Postgres com `pg_dump` (o `postgresql-client` já está na imagem) **e** do volume de mídia — o backup do banco sozinho não traz as fotos de volta.
- `JWT_SECRET` e `ADMIN_PASSWORD` sempre por variável de ambiente; a aplicação deve **recusar subir** se `JWT_SECRET` estiver ausente ou for o valor de exemplo.
- Helmet + CSP + rate limit global habilitados a partir da Fase 2.
- HTTPS obrigatório em produção (senha de cliente trafegando).

### Decisões pendentes com o Alexandre

- Quais categorias iniciais e quais tamanhos/cores padrão (para pré-carregar no formulário e poupar digitação).
- Formato e tamanho dos arquivos de música (define o limite de upload e se vale converter para um bitrate menor no servidor).
- Se o cliente deve receber e-mail quando o status mudar (Fase 3) — hoje ele só vê entrando na conta.
- Texto exato que aparece no checkout explicando como o pagamento será combinado.
