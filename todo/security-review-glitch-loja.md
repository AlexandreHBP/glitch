# Security Review Report - Glitch Loja Online

## Executive Summary

- **Review date**: 2026-09-11
- **Reviewed scope**: `./backend`, `./frontend` (painel admin), `./site` (loja pública Next.js) — arquivos criados nesta task
- **Reviewed files**: ~80 arquivos de código (backend 60, frontend 12, site 45 — apenas os de relevância de segurança lidos integralmente)
- **Vulnerabilities found**: 9 (Critical: 1 | High: 1 | Medium: 3 | Low: 4)
- **Verdict**: ❌ **REJECTED** (1 Critical)

> ⚠️ **Nota de processo**: o diretório `./.rules/` **não existe** neste repositório (`find` e `ls` confirmam ausência; não há `SUMMARY.md`). Comentários no código referenciam `./.rules` (ex.: `frontend/src/services/api.ts:6`) mas o diretório não foi versionado. As regras de projeto foram então inferidas do documento de arquitetura `./todo/architecture-glitch-loja.md` e dos comentários-âncora dos próprios arquivos. **Recomendação de processo:** criar/versionar `./.rules/` antes do próximo ciclo de review.

---

## Reviewed Files (com classificação de risco)

### Backend
1. 🔥 `backend/.env` — **segredos vivos (JWT_SECRET, ADMIN_PASSWORD, credenciais PG)**
2. 🔥 `backend/.gitignore` — política de exclusão de segredos
3. 🔥 `backend/src/main.ts` — bootstrap, helmet, CORS, static assets, ValidationPipe
4. 🔥 `backend/src/app.module.ts` — guards globais (Throttler + JwtAuthGuard)
5. 🔥 `backend/src/common/guards/jwt-auth.guard.ts` — autenticação secure-by-default
6. 🔥 `backend/src/common/guards/roles.guard.ts` — autorização por papel
7. 🔥 `backend/src/modules/auth/strategies/jwt.strategy.ts` — validação do token
8. 🔥 `backend/src/modules/auth/use-cases/login.usecase.ts` — comparação bcrypt, assinatura JWT
9. 🔥 `backend/src/modules/auth/use-cases/register-customer.usecase.ts` — role forçada a CUSTOMER
10. 🔥 `backend/src/modules/uploads/uploads.controller.ts` — validação de upload
11. 🔥 `backend/src/modules/uploads/uploads.service.ts` — gravação em disco (sharp/fs)
12. 🔥 `backend/src/modules/orders/use-cases/create-order.usecase.ts` — preço/estoque transacional
13. 🔥 `backend/src/modules/orders/orders.controller.ts` / `orders-admin.controller.ts` — fronteira cliente/admin
14. 🔥 `backend/src/modules/orders/use-cases/get-order.usecase.ts` / `list-my-orders.usecase.ts` — escopo por userId
15. 🔥 `backend/src/modules/catalog/catalog-admin.controller.ts` / `playlist-admin.controller.ts` — rotas /admin
16. ⚠️ `backend/src/modules/users/entities/user.entity.ts` — `@Exclude()` no passwordHash
17. ⚠️ `backend/src/common/filters/http-exception.filter.ts` — vazamento de erro
18. ⚠️ DTOs: `create-order*.dto.ts`, `register.dto.ts`, `login.dto.ts`, `create-product.dto.ts`, `create-track.dto.ts`, `pagination-query.dto.ts`
19. ⚠️ `backend/src/database/seeds/seed-admin.ts` — criação do admin
20. ⚠️ `backend/Dockerfile`, `backend/.dockerignore`, `backend/package.json`
21. ✅ `backend/src/common/utils/slugify.ts`, transformers, enums, migrations

### Frontend (painel admin)
22. 🔥 `frontend/vite.config.ts` — **dev server + proxy**
23. ⚠️ `frontend/src/services/api.ts` — interceptors, token em localStorage
24. ⚠️ `frontend/src/context/AuthContext.tsx`, `frontend/src/components/guards/AdminRoute.tsx`
25. ⚠️ `frontend/src/services/uploadService.ts`
26. ✅ `frontend/.env`, `frontend/.env.example` — sem segredos

### Site (loja pública)
27. 🔥 `site/next.config.ts` — **remotePatterns do image optimizer**
28. 🔥 `site/lib/api/client.ts` — cliente HTTP, injeção de Bearer
29. ⚠️ `site/contexts/AuthContext.tsx`, `site/hooks/useRequireAuth.ts`
30. ⚠️ `site/app/layout.tsx` — `dangerouslySetInnerHTML` (JSON-LD)
31. ⚠️ `site/components/checkout/CheckoutView.tsx`, `site/lib/api/orders.ts`
32. ⚠️ `site/lib/media.ts`, `site/lib/seo.ts`, `site/lib/site-config.ts`
33. ✅ `site/app/error.tsx`, `site/.env.local` (gitignored), componentes de UI/catálogo

---

## Findings

### 🔴 Critical (1 encontrado)

#### 1. Segredos de produção em `backend/.env` não coberto pelo `.gitignore` — permite forjar token de administrador

- **Categoria**: 4.3 Cryptography / 4.5 Data Exposure / 4.2 Authentication
- **Arquivos**: `backend/.env:10` (JWT_SECRET), `backend/.env:17` (ADMIN_PASSWORD), `backend/.env:2-7` (credenciais PG), `backend/.gitignore:38-42`
- **Confidence**: **HIGH (>95%)** — exploração comprovada em runtime
- **Data flow**: `backend/.env` (segredo vivo em disco) → `git add backend/` (o `.gitignore` do backend **não** contém a entrada `.env`) → histórico do repositório → qualquer leitor do repo obtém `JWT_SECRET` → assina JWT HS256 arbitrário → `JwtAuthGuard` + `JwtStrategy` aceitam → `RolesGuard` lê `role: "admin"` do payload validado.

**Evidência de que o `.gitignore` não cobre o arquivo:**
```
$ git check-ignore -v backend/.env frontend/.env site/.env.local
site/.gitignore:28:.env*   site/.env.local      <-- só o site está protegido
```
`backend/.gitignore` declara apenas `.env.development.local`, `.env.test.local`, `.env.production.local` e `.env.local` — **nunca `.env`**. O `git status` mostra `?? backend/`, ou seja, o arquivo entra no próximo `git add backend/`.

**Exploração comprovada** (token forjado offline apenas com o segredo do `.env`, sem nenhuma credencial):
```bash
# JWT HS256 assinado com o JWT_SECRET lido de backend/.env, role=admin
curl -H "Authorization: Bearer <token-forjado>" \
     http://localhost:3000/api/v1/admin/orders
# => HTTP 200 — lista completa de pedidos, com dados pessoais de todos os clientes
```
Adicionalmente, `ADMIN_PASSWORD=GlitchAdmin@2026!` é a senha **real e funcional** do admin — confirmada por login bem-sucedido em `POST /api/v1/auth/login`.

- **Exploitability**: Qualquer pessoa com acesso de leitura ao repositório (colaborador, CI, fork, backup, futuro repositório público) obtém: (a) bypass total de autenticação via JWT forjado com papel `admin`; (b) a senha do administrador em texto claro; (c) as credenciais do Postgres. Não há rotação de chave nem `jti`/revogação — trocar o segredo é a única mitigação e invalida todas as sessões.
- **Regra violada**: `./todo/architecture-glitch-loja.md` — seção "Operação"/"Proteções mínimas" (segredo forte por ambiente, nunca versionado). O próprio `backend/.env.example` documenta o padrão correto com placeholder.
- **Impact**: **Comprometimento total do sistema** — leitura/alteração de todo o catálogo, de todos os pedidos e dos dados pessoais (nome, e-mail, endereço de entrega) de todos os clientes; acesso direto ao banco.
- **Fix**:
  ```diff
  # backend/.gitignore
  # dotenv environment variable files
  +.env
  +.env.*
  +!.env.example
   .env.development.local
   .env.test.local
   .env.production.local
   .env.local
  ```
  E, obrigatoriamente, **rotacionar os três segredos** (eles devem ser considerados queimados a partir de agora):
  ```bash
  # 1. Novo JWT_SECRET (invalida todas as sessões — comportamento esperado)
  openssl rand -hex 48
  # 2. Nova ADMIN_PASSWORD + re-seed do admin
  # 3. Nova senha do Postgres
  # 4. Se já houve commit, purgar do histórico (git filter-repo / BFG)
  ```
  Em produção, injetar via secret manager (Docker secrets / SSM / Vault), nunca via arquivo no repo. Observação: `backend/.dockerignore` **já** exclui `.env` corretamente — a imagem Docker não é afetada; o vazamento é exclusivamente pelo Git.

---

### 🟡 High (1 encontrado)

#### 1. SSRF no Next.js Image Optimizer — `remotePatterns` com hostname curinga

- **Categoria**: 4.4 Code Execution (Server-Side Request Forgery) / 4.8 Configuration
- **Arquivo**: `site/next.config.ts:18`
- **Confidence**: **HIGH (>90%)** — exploração comprovada em runtime
- **Código**:
  ```ts
  remotePatterns: [
    { protocol: "http",  hostname: "localhost", port: "3000", pathname: "/uploads/**" },
    { protocol: "https", hostname: "**",        pathname: "/uploads/**" },  // <-- linha 18
  ],
  ```
- **Data flow**: query param `url` de `GET /_next/image` (atacante anônimo) → validação do Next contra `remotePatterns` → `hostname: "**"` casa com **qualquer** host → o servidor Next emite `fetch()` server-side para o host escolhido pelo atacante.

**Exploração comprovada** (oráculo de alcançabilidade por status + timing):
```
GET /_next/image?url=https://example.com/uploads/x.png&w=640&q=75
  -> status=404  time=0.33s   (host resolvido e alcançado; upstream respondeu)

GET /_next/image?url=https://this-host-does-not-exist-abc123.invalid/uploads/x.png&w=640
  -> status=500  time=20.8s   (host não resolve; timeout)

GET /_next/image?url=https://example.com/not-uploads/x.png&w=640
  -> status=400               (rejeitado pelo pattern — controle negativo)
```
A diferença **400 (rejeitado pela política) vs 404/500 (requisição efetivamente emitida)** prova que o curinga libera a chamada de saída.

- **Exploitability**: Atacante não autenticado varre a rede interna do servidor Next (serviços internos, metadata endpoints de cloud expostos em HTTPS, hosts `*.internal`) distinguindo alcançável/inalcançável por status e tempo de resposta; e usa o domínio da loja como **proxy de imagem aberto** (serve conteúdo de terceiros sob o domínio Glitch, com potencial de envenenar o cache do otimizador e consumir a cota de otimização). O caminho exigir prefixo `/uploads/` e o protocolo ser `https` limitam, mas não eliminam, o alcance — é SSRF cega, não teórica.
- **Regra violada**: documentação oficial do Next.js desaconselha explicitamente `hostname: "**"`. O próprio comentário no arquivo (`site/next.config.ts:15`) reconhece a pendência: *"Em produção, restrinja ao hostname real do backend."* — a restrição não foi aplicada.
- **Impact**: Reconhecimento de rede interna a partir do servidor de produção; abuso de banda/cache; potencial pivô para serviços internos sem autenticação que sirvam conteúdo sob `/uploads/`.
- **Fix**: remover o curinga e fixar o host real do backend, parametrizado por ambiente:
  ```ts
  // site/next.config.ts
  const backendUrl = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1");

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: backendUrl.protocol.replace(":", "") as "http" | "https",
        hostname: backendUrl.hostname,
        port: backendUrl.port,
        pathname: "/uploads/**",
      },
    ],
  },
  ```

---

### 🟠 Medium (3 encontrados)

#### 1. Upload de áudio aceita qualquer conteúdo — só o `Content-Type` declarado pelo cliente é validado

- **Categoria**: 4.7 Input Validation (file upload)
- **Arquivos**: `backend/src/modules/uploads/uploads.controller.ts:85` (`allowedTypes.includes(file.mimetype)`), `backend/src/modules/uploads/uploads.service.ts:43-51` (`fs.promises.writeFile(filePath, buffer)`)
- **Confidence**: **HIGH (>90%)** — exploração comprovada em runtime
- **Data flow**: header `Content-Type` da parte multipart (100% controlado pelo cliente; o multer apenas o copia para `file.mimetype`) → `validateFile()` → `saveAudio()` grava o **buffer bruto, sem qualquer inspeção de magic bytes** → arquivo servido estaticamente em `/uploads/audio/<uuid>.mp3`.

**Exploração comprovada:**
```bash
$ printf '<html><script>alert(document.domain)</script></html>' > payload.bin
$ curl -X POST /api/v1/admin/uploads/audio -H "Authorization: Bearer <admin>" \
       -F "file=@payload.bin;type=audio/mpeg;filename=evil.mp3"
{"url":"/uploads/audio/0bf04a4e-....mp3"}

$ curl http://localhost:3000/uploads/audio/0bf04a4e-....mp3
<html><script>alert(document.domain)</script></html>     # servido na íntegra
```
- **Exploitability**: Requer token de administrador — o que **rebaixa a severidade de Critical para Medium** (o admin já é um papel confiável). O risco real é de segunda ordem: um admin comprometido (ou um XSS no painel) ganha um primitivo de "hospedar conteúdo arbitrário sob a origem do backend", encadeável com o Finding Medium #2 (ausência de `nosniff` em `/uploads/*`). Também permite armazenar malware sob o domínio confiável da marca.
- **Contraste positivo**: o caminho de **imagem** não tem esse problema — `sharp(buffer).webp().toFile()` faz re-encode completo, então bytes arbitrários são descartados (testado: payload HTML declarado como `image/png` é rejeitado pelo sharp).
- **Regra violada**: `backend/src/modules/uploads/uploads.controller.ts:1-4` — o próprio cabeçalho do arquivo promete *"Whitelist de mime-type, limite de tamanho"*; a whitelist aplicada é sobre um valor que o atacante escolhe.
- **Fix**: validar o conteúdo real (magic bytes) e não o rótulo:
  ```typescript
  // uploads.service.ts
  import { fileTypeFromBuffer } from 'file-type';

  async saveAudio(buffer: Buffer): Promise<string> {
    const detected = await fileTypeFromBuffer(buffer);
    if (!detected || detected.mime !== 'audio/mpeg') {
      throw new BadRequestException(
        'Arquivo não é um MP3 válido (conteúdo não corresponde ao tipo declarado)',
      );
    }
    const filename = `${randomUUID()}.mp3`;
    // ...
  }
  ```

#### 2. `/uploads/*` servido sem nenhum header de segurança (static assets registrado antes do helmet)

- **Categoria**: 4.8 Configuration & Headers
- **Arquivo**: `backend/src/main.ts:50-55`
- **Confidence**: **HIGH (>95%)** — comprovado em runtime
- **Código** (ordem de registro dos middlewares):
  ```typescript
  app.useStaticAssets(uploadsDir, { prefix: '/uploads' });  // linha 53  <-- registrado 1º
  app.use(helmet());                                        // linha 55  <-- registrado 2º
  ```
  `useStaticAssets()` registra `express.static` imediatamente no adapter Express. Como o helmet só entra depois, **toda resposta de `/uploads/*` termina antes de o helmet rodar**.
- **Evidência**:
  ```
  $ curl -sI http://localhost:3000/api/v1/products      # rota normal
  Content-Security-Policy: default-src 'self';...
  X-Content-Type-Options: nosniff
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Cross-Origin-Resource-Policy: same-origin

  $ curl -sI http://localhost:3000/uploads/images/<arquivo>.webp
  X-Powered-By: Express          <-- fingerprinting
  Content-Type: image/webp
  (nenhum header do helmet: sem nosniff, sem CSP, sem CORP, sem HSTS)
  ```
- **Exploitability**: Encadeia diretamente com o Medium #1 — conteúdo arbitrário gravado em `/uploads/audio/*.mp3` é entregue **sem `X-Content-Type-Options: nosniff`**, habilitando MIME sniffing em navegadores legados/configurações permissivas e removendo a barreira de `Cross-Origin-Resource-Policy` para embedding cross-origin. Também vaza `X-Powered-By: Express`.
- **Impact**: Defense-in-depth perdida exatamente no único caminho que serve conteúdo enviado por usuário — o lugar onde ela mais importa.
- **Fix**: mover o helmet para antes do static (e desabilitar o `x-powered-by`):
  ```typescript
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(helmet());                    // <-- PRIMEIRO
  app.disable('x-powered-by');

  app.useStaticAssets(uploadsDir, {     // <-- DEPOIS
    prefix: '/uploads',
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
    },
  });
  ```

#### 3. Vite dev server com `allowedHosts: true` + `host: 0.0.0.0` expõe o backend via proxy (DNS rebinding)

- **Categoria**: 4.8 Configuration
- **Arquivo**: `frontend/vite.config.ts:18-29`
- **Confidence**: **HIGH (>90%)** — comprovado em runtime
- **Análise do proxy solicitada na task**: o proxy em si **não** introduz SSRF nem proxy aberto. O alvo é fixo (`http://localhost:3000`), restrito a dois prefixos (`/api`, `/uploads`), e nenhuma parte do alvo é controlável pelo cliente. **Essa parte está correta.** O problema está na linha vizinha.
- **Código**:
  ```ts
  server: {
    host: "0.0.0.0",
    allowedHosts: true,   // <-- linha 20: desliga a proteção de Host header do Vite
    proxy: {
      "/api":     { target: "http://localhost:3000", changeOrigin: true },
      "/uploads": { target: "http://localhost:3000", changeOrigin: true },
    },
  }
  ```
- **Evidência**:
  ```
  $ curl http://localhost:5173/api/v1/products                -> 200 (backend alcançado via proxy)
  $ curl -H "Host: evil.attacker.test" http://localhost:5173/ -> 200 (Host arbitrário aceito)
  ```
- **Exploitability**: `allowedHosts: true` desativa a validação de `Host` que existe justamente para barrar **DNS rebinding**. Um site malicioso visitado pelo desenvolvedor/admin pode: (1) resolver `evil.com` para o IP da máquina de dev; (2) rebind para `127.0.0.1`; (3) fazer o navegador da vítima falar com `http://evil.com:5173/api/v1/...`, que o Vite aceita e encaminha ao backend. Como do ponto de vista do navegador tudo é same-origin com `evil.com:5173`, **a allowlist de CORS do backend (`main.ts:57-64`) é completamente contornada**. Somado a `host: "0.0.0.0"`, o backend — que escuta apenas em localhost — passa a ser alcançável por toda a rede local através da porta 5173.
  *Atenuante:* o JWT do admin vive no `localStorage` da origem `http://localhost:5173`, que **não** é compartilhado com `evil.com:5173` — logo não há roubo direto de token. E `server` só afeta `vite dev`, não o build de produção. Por isso: Medium, não High.
- **Fix**:
  ```ts
  server: {
    host: "0.0.0.0",
    // Liste explicitamente os hosts do ingress de teste em vez de `true`.
    allowedHosts: (process.env.VITE_ALLOWED_HOSTS ?? "localhost").split(","),
    proxy: {
      "/api":     { target: "http://localhost:3000", changeOrigin: true },
      "/uploads": { target: "http://localhost:3000", changeOrigin: true },
    },
  }
  ```

---

### 🔵 Low (4 encontrados)

#### 1. Política de senha fraca (mínimo 6 caracteres, sem requisito de complexidade)
- **Categoria**: 4.2 Authentication
- **Arquivos**: `backend/src/modules/auth/dto/register.dto.ts:18`, `backend/src/modules/auth/dto/login.dto.ts:11`
- **Confidence**: HIGH — leitura direta
- **Atenuante**: o throttle de 5 tentativas/minuto por IP (`auth.controller.ts:28`) reduz muito o brute force online.
- **Fix**: elevar para `@MinLength(10)` e adicionar `@Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)` ou, preferencialmente, checagem contra lista de senhas vazadas.

#### 2. JWT de 24h em `localStorage`, sem revogação
- **Categoria**: 4.2 Authentication
- **Arquivos**: `site/contexts/AuthContext.tsx:57`, `frontend/src/context/AuthContext.tsx:45`, `backend/.env:11`
- **Confidence**: HIGH
- Trade-off **explicitamente documentado** em `site/contexts/AuthContext.tsx:4-7` e coerente com o MVP. Registrado como fronteira de confiança: qualquer XSS futuro no painel ou na loja resulta em roubo de sessão de até 24h, sem mecanismo de revogação (`jti`/denylist). O `logout` é puramente client-side.
- **Fix (futuro)**: cookie `HttpOnly`+`Secure`+`SameSite=Strict` com refresh token rotativo, ou pelo menos reduzir `JWT_EXPIRATION` e adicionar `jti` + denylist em Redis.

#### 3. Falha de decodificação de imagem retorna 500 em vez de 400
- **Categoria**: 4.5 Data Exposure (menor)
- **Arquivo**: `backend/src/modules/uploads/uploads.service.ts:30-38`
- **Confidence**: HIGH — comprovado (`{"statusCode":500,"message":"Erro interno do servidor"}` ao enviar um não-imagem declarado como `image/png`)
- O `HttpExceptionFilter` faz seu trabalho e **não vaza stack trace** (bom), mas o erro do `sharp` escapa como 500 e polui os logs de erro, mascarando incidentes reais. É input inválido do cliente → deve ser 400.
- **Fix**: envolver a chamada do sharp em `try/catch` e lançar `BadRequestException('Arquivo de imagem inválido ou corrompido')`.

#### 4. Drivers SQLite em `dependencies` de produção, sem uso (superfície de supply chain)
- **Categoria**: 4.10 Supply Chain
- **Arquivo**: `backend/package.json` — `better-sqlite3@^12.5.0` e `sqlite3@^5.1.7` em `dependencies`
- **Confidence**: HIGH — a aplicação usa exclusivamente Postgres (`app.module.ts:25 type: 'postgres'`); nenhum import de sqlite existe no `src/`.
- Ambos são módulos **nativos com scripts de instalação** (o `allowScripts` do próprio `package.json` os habilita explicitamente) e são instalados no estágio `prod-deps` do `backend/Dockerfile:27`, inflando a imagem e a superfície de ataque de build sem contrapartida.
- **Fix**: remover ambos de `dependencies` (se usados só em teste, mover `embedded-postgres` e afins para `devDependencies`).

---

## Positive Security Practices

Esta implementação acerta a maioria dos controles difíceis. Verificado em runtime salvo indicação contrária:

- ✅ **Autenticação secure-by-default**: `JwtAuthGuard` como `APP_GUARD` global (`app.module.ts:47`) protege **todas** as rotas; a liberação é opt-in via `@Public()`. Confirmado: `GET /orders` sem token → **401**.
- ✅ **Separação de papéis realmente aplicada** (ponto de atenção da task): `RolesGuard` + `@Roles(ADMIN)` **na classe inteira** de todos os 4 controllers administrativos. Testado com token de cliente legítimo:
  `/admin/orders` → **403** · `/admin/products` → **403** · `/admin/playlist` → **403** · `/admin/uploads/image` → **403**
- ✅ **Sem IDOR entre clientes** (ponto de atenção da task): `GetOrderUseCase` e `ListMyOrdersUseCase` filtram por `userId` **do token**, nunca da URL. Testado: cliente A lendo pedido do cliente B → **404** (não 403 — não vaza sequer a existência do recurso). Listagem do cliente A retorna apenas os próprios pedidos.
- ✅ **Preço sempre recalculado no servidor** (ponto de atenção da task): `CreateOrderItemDto` não possui campo de preço, e `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` rejeita ativamente tentativas de injeção. Testado com `{"items":[{...,"unitPrice":0.01}],"total":0.01}` → **400** `["property total should not exist","items.0.property unitPrice should not exist"]`. O total vem de `variant.priceOverride ?? variant.product.basePrice` lido do banco dentro da transação (`create-order.usecase.ts:88`).
- ✅ **Escalação de privilégio por mass assignment bloqueada**: `POST /auth/register` com `"role":"admin"` → **400** `["property role should not exist"]`. Além disso, `RegisterCustomerUseCase:42` força `role: UserRole.CUSTOMER` no código.
- ✅ **Hash de senha nunca vaza**: `@Exclude()` em `User.passwordHash` + `ClassSerializerInterceptor` global. Verificado no pior caso — `GET /admin/orders` com `relations: ['user']` — a serialização atravessa corretamente o `PaginatedResponseDto` e o `passwordHash` **não** aparece na resposta.
- ✅ **Nenhum segredo nos bundles de cliente** (ponto de atenção da task): `frontend/.env` e `site/.env.local` contêm apenas URLs públicas e IDs de analytics. Nenhuma referência a `JWT_SECRET` ou credenciais de banco em `./frontend` ou `./site`. Inlining de `NEXT_PUBLIC_*` no `site/Dockerfile:58-67` está restrito a valores não sensíveis.
- ✅ **Sanity check de JWT_SECRET no boot** (`main.ts:28-43`): recusa subir com segredo ausente, de exemplo ou com menos de 32 caracteres.
- ✅ **CORS restrito por allowlist**, sem curinga, com default seguro (`main.ts:57-64`) — nunca `origin: '*'` com `credentials: true`.
- ✅ **Zero SQL injection**: toda consulta usa QueryBuilder parametrizado (`:categoryId`, `:search`, `:ids`, `:prefix`) ou o repositório do TypeORM. Nenhuma concatenação de string em SQL em todo o backend. IDs de rota passam por `ParseUUIDPipe`.
- ✅ **Zero XSS**: nenhum `dangerouslySetInnerHTML` sobre dado vindo da API. Os dois usos em `site/app/layout.tsx:52,58` são JSON-LD construído **exclusivamente** a partir de constantes estáticas de `site-config.ts` — sem fonte não confiável, sem risco de quebra de `</script>`. Descrição de produto renderizada como texto (`produtos/[slug]/page.tsx:72`).
- ✅ **Login endurecido**: bcrypt (cost 10), mensagem de erro genérica que não revela existência do e-mail, e throttle de 5 req/min (`auth.controller.ts:28`).
- ✅ **`JwtStrategy` revalida o usuário no banco a cada requisição** (`where: { id, active: true }`) — desativar uma conta tem efeito imediato, sem esperar a expiração do token.
- ✅ **Uploads sem path traversal**: o nome do arquivo é **sempre** gerado pelo servidor (`randomUUID()`), a extensão é derivada de uma whitelist do servidor, e o nome enviado pelo usuário é integralmente descartado. Limites de tamanho aplicados (8 MB imagem / 15 MB áudio).
- ✅ **Imagens re-encodadas via sharp** — descarta qualquer payload embutido (polyglots, EXIF malicioso, SVG).
- ✅ **Integridade transacional na criação de pedido**: transação única com lock pessimista (`SELECT FOR UPDATE`) nas variações, impedindo venda dupla da última peça; máquina de estados com transições validadas e estados terminais, também sob lock, garantindo que o cancelamento devolva estoque exatamente uma vez.
- ✅ **Containers como usuário não-root** em ambos os Dockerfiles; `backend/.dockerignore` exclui corretamente `.env`, `.git` e testes.
- ✅ **Headers de segurança no site** (`next.config.ts:21-34`) e `poweredByHeader: false`.
- ✅ **`synchronize: false`** no TypeORM — migrations explícitas, sem alteração automática de schema.
- ✅ Paginação com teto (`@Max(100)`) e quantidade por item limitada (`@Max(20)`) em todas as listagens.

---

## Technical Validations Performed

### Fronteira de autenticação/autorização (backend em execução, `localhost:3000`)
| Teste | Esperado | Obtido |
|---|---|---|
| `GET /orders` sem token | 401 | ✅ 401 |
| Cliente → `GET /admin/orders` | 403 | ✅ 403 |
| Cliente → `GET /admin/products` | 403 | ✅ 403 |
| Cliente → `GET /admin/playlist` | 403 | ✅ 403 |
| Cliente → `POST /admin/uploads/image` | 403 | ✅ 403 |
| Cliente A → `GET /orders/{pedido-do-cliente-B}` | 404 | ✅ 404 |
| `GET /orders` como cliente A | só pedidos de A | ✅ `total: 0` |
| `POST /orders` com `unitPrice`/`total` | 400 | ✅ 400 (ambos rejeitados) |
| `POST /auth/register` com `role:"admin"` | 400 | ✅ 400 |
| JWT forjado com o segredo do `.env` → `/admin/orders` | — | ❌ **200 (Critical #1)** |

### Vazamento de dados
- `GET /admin/orders` com `relations: ['user']` inspecionado byte a byte: **nenhum `passwordHash`** na resposta — `@Exclude()` + `ClassSerializerInterceptor` funcionam através do envelope `PaginatedResponseDto`.
- `HttpExceptionFilter` verificado com erro 500 real: retorna apenas `"Erro interno do servidor"`, sem stack trace.

### Headers HTTP
- Comparação `/api/v1/*` (helmet completo) × `/uploads/*` (**nenhum header**, mais `X-Powered-By: Express`) — confirma Medium #2.

### Upload
- HTML declarado como `audio/mpeg` → aceito, gravado e servido na íntegra (Medium #1). Artefato de teste removido após a validação.
- HTML declarado como `image/png` → rejeitado pelo sharp (caminho de imagem seguro), porém com 500 em vez de 400 (Low #3).

### SSRF (site Next.js, `localhost:3001`)
- Oráculo host-resolvível × não-resolvível via `/_next/image` (404/0.33s × 500/20.8s) e controle negativo de path (400) — confirma High #1.

### Proxy do Vite (`localhost:5173`)
- `/api/v1/products` via proxy → 200; `Host: evil.attacker.test` aceito → confirma Medium #3. Alvo do proxy verificado como fixo e não influenciável pelo cliente (sem SSRF).

### Banco de dados
- Schema e escopo por proprietário validados por leitura: `orders.user_id` (`order.entity.ts:33`) com índice composto `idx_orders_user_created`; todos os caminhos de consulta do cliente filtram por essa coluna. Não foi necessária consulta SQL adicional.

> 🧹 **Limpeza pendente**: a validação criou uma conta de teste no banco de desenvolvimento — `sectest-a@example.com`. Remover antes de qualquer promoção de ambiente.

---

## Priority Remediation

1. **[BLOCKER]** Adicionar `.env` ao `backend/.gitignore` **e rotacionar os três segredos** (`JWT_SECRET`, `ADMIN_PASSWORD`, senha do Postgres). Confirmar com `git check-ignore backend/.env` antes de qualquer commit. Se já houver commit, purgar do histórico. — *Critical #1*
2. **[HIGH]** Substituir `hostname: "**"` em `site/next.config.ts:18` pelo host real do backend derivado de env. — *High #1*
3. **[MEDIUM]** Validar magic bytes no upload de áudio (`file-type`) em vez de confiar no `Content-Type` declarado. — *Medium #1*
4. **[MEDIUM]** Mover `app.use(helmet())` para antes de `app.useStaticAssets()` em `main.ts` e aplicar `nosniff`/CSP explícitos em `/uploads/*`. — *Medium #2*
5. **[MEDIUM]** Trocar `allowedHosts: true` por uma lista explícita em `frontend/vite.config.ts`. — *Medium #3*
6. **[LOW]** Endurecer a política de senha; converter a falha do sharp em 400; remover `sqlite3`/`better-sqlite3` das dependências de produção.
7. **[PROCESSO]** Criar e versionar `./.rules/` — o código referencia esse diretório, mas ele não existe, impedindo a validação de conformidade documental.

---

## Out of Scope (excluído intencionalmente)

- **CVEs de dependências** — responsabilidade do SCA. O Low #4 é sobre *superfície desnecessária*, não sobre vulnerabilidade conhecida.
- **Rate limiting / DoS** — fora de escopo por política. Registrado apenas como atenuante do Low #1. (Observação informativa: o limite global de `1000 req/min` em `app.module.ts:20` é generoso, mas o endpoint sensível — login — está corretamente restrito a 5/min.)
- **Race conditions teóricas** — `generateOrderNumber()` usa `COUNT(*)+1`, que sob concorrência real pode colidir; porém a constraint `unique` em `order_number` transforma isso em erro de transação, não em falha de segurança. Sem impacto explorável → não reportado como vulnerabilidade (é um bug de disponibilidade; delegado ao code-reviewer).
- **Ausência de CSRF tokens** — a API é stateless com `Authorization: Bearer` e não usa cookies de sessão; não há vetor de CSRF.
- **Conteúdo de `backend/.pgdata/`** — dados de runtime do Postgres embarcado, não código-fonte da task.
- **Qualidade de código, acessibilidade e aderência funcional** — delegados ao code-reviewer e ao feature-review.

---

## Conclusion

A postura de segurança **do código da aplicação é forte e claramente deliberada**. Os controles que costumam falhar em e-commerce foram implementados corretamente e **verificados empiricamente**: autenticação global secure-by-default com opt-in explícito, `RolesGuard` aplicado na classe inteira de todos os controllers `/admin` (403 confirmado com token de cliente real), escopo por `userId` do token em todos os caminhos de leitura de pedido (IDOR bloqueado com 404), e — o ponto mais crítico de uma loja — **preço e total exclusivamente recalculados no banco**, com o `forbidNonWhitelisted` rejeitando ativamente qualquer tentativa de injetar `unitPrice` ou `total`. Não há SQL injection, não há XSS, e não há segredos nos bundles de cliente.

Os três pontos de atenção levantados na task foram todos validados e **aprovados**: separação de papéis correta, preço à prova de manipulação, e nenhum vazamento de env sensível para frontend/site. O "proxy inerte" do Vite também está bem construído — alvo fixo, sem parâmetro controlável pelo cliente, portanto sem SSRF; o achado ali é a linha vizinha (`allowedHosts: true`), não o proxy.

**O bloqueio é de higiene de segredos, não de lógica.** `backend/.gitignore` herdou o template padrão do NestJS, que lista `.env.*.local` mas **não** `.env` — e o arquivo `.env` contém um `JWT_SECRET` vivo, a senha real do administrador e as credenciais do banco. Comprovei que esse segredo permite forjar um token de admin válido e obter HTTP 200 em `/admin/orders`, ou seja, comprometimento total com uma única linha faltando no `.gitignore`. A ironia é que o `.dockerignore` do mesmo diretório já trata `.env` corretamente, e o `main.ts` até valida a robustez do segredo no boot: a defesa foi pensada, só não foi fechada no Git.

**Veredito: REJECTED.** A correção do Critical é de baixo esforço (uma linha no `.gitignore` + rotação dos três segredos) e não exige refatoração. Com esse item e o SSRF do image optimizer resolvidos, a feature fica em condição de aprovação — os três Medium são endurecimento em profundidade e podem ser tratados no mesmo ciclo sem risco de regressão.
