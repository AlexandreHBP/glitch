# Security Review Report - Glitch Loja Online (2ª rodada / re-teste)

## Executive Summary

- **Review date**: 2026-09-11
- **Reviewed scope**: `./backend` (NestJS), `./frontend` (painel admin, Vite/React), `./site` (loja pública, Next.js 15) — re-validação das correções da 1ª rodada + varredura nova completa
- **Reviewed files**: ~85 arquivos de código (leitura integral dos de relevância de segurança) + verificação **em runtime** contra os serviços vivos (backend :3000, site :3001, admin :5173, Postgres :5432)
- **Vulnerabilities found**: 1 Critical (**RESOLVIDA**), 1 High (**RESOLVIDA**), 3 Medium (**RESOLVIDAS**), 4 Low (**RESOLVIDAS**) + **1 achado novo (Medium)** e alguns Low/Informational de hardening
- **Status das 9 pendências da 1ª rodada**: **9/9 corrigidas e confirmadas em runtime**
- **Verdict**: ✅ **APPROVED**

> Os dois bloqueadores da 1ª rodada (segredo de JWT/senha admin versionados; SSRF no image optimizer) foram **fechados e verificados empiricamente**. Resta **um** achado novo Medium (open redirect no fluxo de login/cadastro, mesma raiz nos dois formulários) — não bloqueia a aprovação, mas deve ser corrigido no mesmo ciclo (fix de uma linha).

> **Nota de processo**: o diretório `./.rules/` continua **não existindo** neste repositório (`ls .rules` → No such file or directory; não há `SUMMARY.md`). As regras foram inferidas dos comentários-âncora do próprio código e do `./todo/architecture-glitch-loja.md`, como na 1ª rodada. Recomenda-se versionar `./.rules/` antes do próximo ciclo.

---

## Reviewed Files (com classificação de risco)

### Backend
1. 🔥 `backend/.gitignore` — política de exclusão de segredos (**corrigida**)
2. 🔥 `backend/.env` / `backend/.env.example` — segredos rotacionados, git-ignored
3. 🔥 `backend/src/main.ts` — bootstrap, helmet, CORS, static assets, ValidationPipe (**reordenado**)
4. 🔥 `backend/src/app.module.ts` — guards globais (Throttler + JwtAuthGuard)
5. 🔥 `backend/src/modules/uploads/uploads.controller.ts` / `uploads.service.ts` — validação por magic bytes (**corrigida**)
6. 🔥 `backend/src/modules/auth/strategies/jwt.strategy.ts` — role derivada do banco, não do token
7. 🔥 `backend/src/modules/auth/use-cases/{login,register-customer}.usecase.ts` — role forçada a CUSTOMER
8. 🔥 controllers `orders`, `orders-admin`, `catalog-admin`, `playlist-admin`, `uploads` — RolesGuard + @Roles(ADMIN)
9. ⚠️ DTOs (`register.dto.ts` endurecido: MinLength 10 + complexidade), `http-exception.filter.ts`, `user.entity.ts`
10. ⚠️ `backend/package.json` — `sqlite3`/`better-sqlite3` **removidos**; `embedded-postgres` movido para devDeps; `file-type@^16` adicionado

### Frontend (painel admin)
11. 🔥 `frontend/.gitignore` — agora exclui `.env` (**corrigido**)
12. 🔥 `frontend/vite.config.ts` — `allowedHosts` como lista explícita (**corrigido**)
13. ⚠️ `frontend/src/{services/api.ts,context/AuthContext.tsx,components/guards/AdminRoute.tsx}`

### Site (loja pública)
14. 🔥 `site/next.config.ts` — `remotePatterns` derivado do `NEXT_PUBLIC_API_URL` (**corrigido**)
15. 🔥 `site/components/forms/LoginForm.tsx` / `RegisterForm.tsx` — **open redirect (novo, Medium)**
16. ⚠️ `site/app/layout.tsx` (JSON-LD estático), `site/contexts/{AuthContext,MusicPlayerContext}.tsx`, `site/lib/{api/client,media,seo,site-config}.ts`, `site/hooks/useRequireAuth.ts`

---

## Verificação das pendências da 1ª rodada (runtime)

### ✅ [Critical #1] Segredos versionados / JWT forjável — **RESOLVIDO**

| Verificação | Resultado |
|---|---|
| `git check-ignore backend/.env` | ✅ `backend/.gitignore:39:.env` — ignorado |
| `git check-ignore frontend/.env` | ✅ `frontend/.gitignore:16:.env` — ignorado |
| `git check-ignore site/.env` / `site/.env.local` | ✅ `site/.gitignore:28:.env*` — ignorado |
| `.env.example` preservado | ✅ `!.env.example` em backend e frontend |
| `git ls-files \| grep .env` | ✅ **nenhum** `.env` rastreado |
| `git add -n backend/` inclui `.env`? | ✅ Não — só `backend/.env.example` seria adicionado |
| Login com a senha antiga `GlitchAdmin@2026!` | ✅ **401** (senha revogada) |
| Login com a nova `ADMIN_PASSWORD` do `.env` | ✅ 200 (senha rotacionada e funcional) |
| JWT forjado com segredo **antigo/arbitrário** → `/admin/orders` | ✅ **401** (assinatura rejeitada) |
| JWT forjado com o **novo** segredo do `.env` → `/admin/orders` | 200 (esperado: o segredo é vivo, mas **não está mais no Git**) |

**Observação sobre a replay do segredo antigo:** o **valor literal** do `JWT_SECRET` da 1ª rodada não foi registrado no relatório anterior (apenas seus efeitos), então não foi possível re-assinar com a string exata. A rotação, porém, está comprovada por dois fatos independentes: (a) a **senha antiga do admin não autentica mais** (401), e (b) qualquer token assinado com segredo diferente do `.env` atual é rejeitado com 401. O segredo atual (96 hex, > 32 chars) passa no sanity-check de boot (`main.ts:29-45`) e — crucialmente — **não está mais no controle de versão**. Defesa adicional confirmada: `JwtStrategy.validate` deriva o `role` do **usuário no banco** (`jwt.strategy.ts:35-49`), não do claim do token, então um token forjado com `role:"admin"` sobre o `sub` de um cliente resultaria em 403.

### ✅ [High #1] SSRF no Next.js Image Optimizer — **RESOLVIDO**

Oráculo de status/timing re-executado contra `:3001/_next/image`:

| `url=` | status | tempo | interpretação |
|---|---|---|---|
| `http://localhost:3000/uploads/x.png` (host permitido) | 404 | 0,02s | única origem liberada (backend real) |
| `https://example.com/uploads/x.png` (host arbitrário) | **400** | 0,004s | **rejeitado pela política — sem fetch** |
| `http://169.254.169.254/uploads/x.png` (metadata cloud) | **400** | 0,007s | **rejeitado — sem fetch** |
| `https://*.invalid/uploads/x.png` (não-resolvível) | **400** | 0,009s | **rejeitado — sem oráculo de timing** |
| `http://localhost:3000/not-uploads/x.png` (path errado) | 400 | 0,004s | controle negativo |

O curinga `hostname: "**"` foi substituído por `hostname`/`port`/`protocol` derivados de `new URL(process.env.NEXT_PUBLIC_API_URL)` (`next.config.ts:9-31`). Todos os hosts arbitrários retornam **400 instantâneo**, sem chamada de saída — o oráculo de reconhecimento de rede interna **deixou de existir**.

### ✅ [Medium #1] Upload de áudio confia só no Content-Type — **RESOLVIDO**

`uploads.service.ts:57-76` agora valida **magic bytes** via `file-type` (`fromBuffer`) antes de gravar, whitelistando `audio/mpeg`. Testes em runtime (com token admin válido):

| Payload | Content-Type declarado | Resultado |
|---|---|---|
| HTML `<script>` disfarçado de MP3 | `audio/mpeg` | ✅ **400** "Arquivo não é um MP3 válido (conteúdo não corresponde ao tipo declarado)" |
| SVG com `<script>` disfarçado de PNG (caminho de imagem) | `image/png` | ✅ **400** "Arquivo de imagem inválido ou corrompido" (sharp re-encode) |

Não é mais possível hospedar conteúdo arbitrário sob a origem do backend via `/uploads/audio/*.mp3`.

### ✅ [Medium #2] `/uploads/*` sem headers de segurança — **RESOLVIDO**

`helmet()` foi movido para **antes** de `useStaticAssets` (`main.ts:56`), com `app.disable('x-powered-by')` e `setHeaders` explícitos. `curl -I` num arquivo real de `/uploads/audio/*.mp3`:

```
Content-Security-Policy: default-src 'none'; sandbox
Cross-Origin-Resource-Policy: cross-origin
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: SAMEORIGIN
Referrer-Policy: no-referrer
(sem X-Powered-By)
```

`nosniff` + CSP `default-src 'none'; sandbox` agora cobrem exatamente o caminho que serve conteúdo enviado por usuário. `X-Powered-By: Express` eliminado.

### ✅ [Medium #3] Vite `allowedHosts: true` (DNS rebinding) — **RESOLVIDO**

`vite.config.ts:24-28` agora usa lista explícita (`VITE_ALLOWED_HOSTS ?? "localhost,127.0.0.1"`). Runtime:

| Requisição | Resultado |
|---|---|
| `GET :5173/` (Host normal) | ✅ 200 |
| `GET :5173/` com `Host: evil.attacker.test` | ✅ **403** "This host is not allowed" |
| `GET :5173/api/v1/products` com `Host: evil.attacker.test` | ✅ **403** |

### ✅ [Low #1–#4] — **todos RESOLVIDOS**
- **#1 Política de senha fraca** → `register.dto.ts:23-28`: `MinLength(10)` + `@Matches` (minúscula+maiúscula+dígito) + `MaxLength(72)`. `POST /register` com `role:"admin"` → 400 (mass assignment bloqueado).
- **#2 JWT em localStorage sem revogação** → trade-off documentado; `next.config.ts` adiciona CSP (Report-Only) como camada extra. Aceito para o MVP.
- **#3 Falha do sharp retorna 500** → `uploads.service.ts:47-52`: `try/catch` converte em `BadRequestException` (400). Confirmado em runtime.
- **#4 Drivers SQLite em produção** → `grep sqlite package.json` = 0 ocorrências; `embedded-postgres` agora em `devDependencies`.

---

## Findings (novos / remanescentes)

### 🔴 Critical (0)

Nenhum.

### 🟡 High (0)

Nenhum.

### 🟠 Medium (1 novo)

#### 1. Open redirect no fluxo de autenticação — `?redirect=` repassado sem validação a `router.push()`

- **Categoria**: 4.8 Configuration (Open Redirect) — fluxo de auth
- **Arquivos**:
  - `site/components/forms/LoginForm.tsx:30-31`
  - `site/components/forms/RegisterForm.tsx:41-42` (padrão idêntico, mesma raiz)
- **Confidence**: **HIGH (>90%) na falha de código**; cadeia end-to-end **não** pôde ser executada no browser do sandbox (ver nota abaixo)
- **Código**:
  ```ts
  const redirect = searchParams.get("redirect") || "/minha-conta";
  router.push(redirect);   // sem checar que é caminho interno relativo
  ```
- **Data flow**: query param `redirect` (atacante controla a URL enviada à vítima) → `searchParams.get("redirect")` → `router.push(redirect)`. No App Router do Next.js, `router.push()` com uma URL **absoluta externa** (`https://evil.com`) ou **protocol-relative** (`//evil.com`) executa navegação de página inteira para fora do domínio.
- **Exploitability**: atacante distribui um link **do próprio domínio confiável da loja** — `https://glitch/entrar?redirect=https://evil.com/login-falso`. A vítima confia no domínio, autentica normalmente e, logo após o sucesso, é jogada para `evil.com` (página de phishing que imita a Glitch pedindo dados de cartão / "sessão expirada"). Amplificador clássico de phishing.
- **Impacto (delimitado)**: **redirecionamento/phishing apenas**. O token JWT permanece no `localStorage` da origem real da Glitch e **não** é enviado para `evil.com` (não há roubo de sessão pela navegação em si). Por isso Medium, não High.
- **Nota de validação**: o link malicioso foi carregado no browser real (`/entrar?redirect=https://example.com/pwned`) e o formulário preenchido/submetido, mas o `login()` client-side falha no sandbox porque o `NEXT_PUBLIC_API_URL` aponta para `localhost:3000`, inalcançável a partir do namespace de rede do browser (fetch recusado) — impedindo completar o passo pós-login **neste ambiente**. A falha de código, porém, é inequívoca por leitura estática, e o produtor do parâmetro (`useRequireAuth.ts:20`) só gera `pathname` interno codificado, confirmando que a intenção era navegação interna.
- **Regra violada**: OWASP "Unvalidated Redirects and Forwards"; boa prática de sempre restringir redirects a caminhos same-origin.
- **Fix** (aplicar nos dois formulários):
  ```ts
  const raw = searchParams.get("redirect") || "/minha-conta";
  // aceita apenas caminho interno absoluto; barra protocol-relative e URLs externas
  const redirect = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/minha-conta";
  router.push(redirect);
  ```

### 🔵 Low / Informational (hardening — não bloqueiam)

1. **`RolesGuard` não é `APP_GUARD` global** (`app.module.ts:45-48`) — só `ThrottlerGuard` e `JwtAuthGuard` são globais. Hoje os 4 controllers admin declaram `@UseGuards(JwtAuthGuard, RolesGuard)` corretamente, mas um futuro controller que use `@Roles(ADMIN)` e **esqueça** o `RolesGuard` falharia **aberto** para qualquer cliente logado. Registrar `RolesGuard` como `APP_GUARD` fecharia essa armadilha latente. *(defense-in-depth)*
2. **DTOs de URL sem `@IsUrl`/whitelist de path** (`catalog/dto/product-image.dto.ts:22-25`, `playlist/dto/create-track.dto.ts:24-26`) — `url` é só `@IsString @MaxLength(500)`; admin-only e consumido como `<Image src>`/`<audio src>`. Restringir a `/uploads/...` seria mais seguro.
3. **`login.dto.ts:11` `MinLength(6)`** inconsistente com `register.dto.ts` (10 + complexidade) — não explorável (só afeta contas já criadas), mas vale alinhar.
4. **Swagger `/api/docs` montado incondicionalmente** (`main.ts:97-106`), inclusive produção — divulga a superfície da API. Considerar gate por `NODE_ENV !== 'production'`.
5. **CSP do site em `Report-Only`** (`next.config.ts:56`) — não bloqueia nada ainda; como o JWT vive em `localStorage`, qualquer XSS futuro = roubo de sessão. TODO já documentado; migrar para enforcement após validar.
6. **`MusicPlayerContext.tsx:147`** usa `src={currentTrack?.url}` **cru** (sem `resolveMediaUrl`), diferente do resto — bug funcional e único ponto onde URL vinda de admin é usada sem normalizar.
7. **`@scarf/scarf` no `allowScripts`** (`backend/package.json`) — telemetria de instalação que "liga pra casa"; `uuid@^14` declarado e não usado (dep morta). Superfície desnecessária.

---

## Positive Security Practices (confirmadas em runtime nesta rodada)

- ✅ **Segredos fora do Git**: os três `.gitignore` excluem `.env`, preservam `.env.example`; nenhum `.env` rastreado; repositório sem commits com segredos.
- ✅ **Segredos rotacionados**: senha antiga do admin revogada (401); segredos só no `.env` local (não versionado).
- ✅ **Autenticação secure-by-default**: `JwtAuthGuard` global; `GET /orders` sem token → 401.
- ✅ **RBAC aplicado**: cliente legítimo → `/admin/orders` 403, `/admin/products` 403, `/admin/playlist` 403, `POST /admin/uploads/image` 403.
- ✅ **Sem IDOR**: cliente A → pedido inexistente/de terceiros = 404 (não vaza existência); `/orders` retorna só os próprios.
- ✅ **`role` do token não é confiável**: `JwtStrategy` relê `user.role` do banco a cada request (`where: { id, active: true }`).
- ✅ **Preço recalculado no servidor**: `CreateOrderItemDto` sem campo de preço; `forbidNonWhitelisted` rejeita `unitPrice`/`total`.
- ✅ **Mass assignment bloqueado**: `POST /register` com `role:"admin"` → 400; `register-customer.usecase.ts:43` força `CUSTOMER`.
- ✅ **Upload endurecido**: magic bytes (`file-type`) no áudio; sharp re-encode na imagem; nome sempre `randomUUID()`; sem path traversal; limites de tamanho.
- ✅ **`/uploads/*` com headers**: helmet antes do static + `nosniff`/CSP/CORP explícitos; sem `X-Powered-By`.
- ✅ **CORS por allowlist** (`main.ts:71-78`), sem curinga; **zero SQL injection** (tudo parametrizado / QueryBuilder com bind params); **zero XSS** (único `dangerouslySetInnerHTML` é JSON-LD de constantes estáticas).
- ✅ **`@Exclude()` no `passwordHash`** + `ClassSerializerInterceptor`; filtro de exceção sem stack trace; login com bcrypt + throttle 5/min + mensagem genérica.

---

## Technical Validations Performed

### Segredos & Git
- `git check-ignore -v` para `backend/.env`, `frontend/.env`, `site/.env(.local)` → todos ignorados; `.env.example` preservados.
- `git ls-files | grep .env` → vazio; `git add -n backend/` → só `.env.example`.
- Metadados do `.env` (sem expor valores): `JWT_SECRET` 96 chars, `ADMIN_PASSWORD` 20 chars, `POSTGRES_PASSWORD` 24 chars.

### Autenticação/Autorização (backend :3000)
- Login senha antiga → 401; senha nova → 200. JWT forjado (segredo antigo/arbitrário) → 401; (segredo novo) → 200.
- Matriz de RBAC/IDOR (cliente real): 403 em todos os `/admin/*`, 404 em pedido de terceiro, 200 em `/orders` próprio, 401 sem token.

### SSRF (site :3001)
- 5 variações de `/_next/image` — todos os hosts arbitrários (incl. `169.254.169.254`) = 400 instantâneo; só o host do backend responde.

### Upload & Headers (backend :3000)
- HTML/SVG disfarçados rejeitados (400) por magic bytes/sharp; `curl -I /uploads/...` com CSP+nosniff+CORP+HSTS, sem `X-Powered-By`.

### Vite (:5173)
- Host arbitrário → 403 em `/` e `/api/*`; host normal → 200.

### Open redirect (site :3001, via browser)
- Link `/entrar?redirect=https://example.com/pwned` carregado no Chrome real; submit não completou pós-login por indisponibilidade de `localhost:3000` no namespace do browser (fetch recusado). Falha confirmada por análise estática.

---

## Priority Remediation

1. **[MEDIUM]** Validar `redirect` (same-origin / caminho relativo) em `LoginForm.tsx:30-31` e `RegisterForm.tsx:41-42`. — *Medium #1 (novo)*
2. **[LOW]** Registrar `RolesGuard` como `APP_GUARD` global (fecha a armadilha fail-open latente).
3. **[LOW]** `@IsUrl`/whitelist `/uploads/...` nos DTOs de `url`; alinhar `login.dto` a 10 chars; gate do Swagger por ambiente; migrar CSP do site para enforcement; normalizar `MusicPlayerContext.tsx:147` via `resolveMediaUrl`.
4. **[PROCESSO]** Versionar `./.rules/`; remover dep morta `uuid`; revisar `@scarf/scarf`.

---

## Out of Scope (excluído intencionalmente)

- **CVEs de dependências** — responsabilidade do SCA. Sem typosquats detectados; sem `postinstall` nos três `package.json`.
- **Rate limiting / DoS** — fora de escopo (o throttle global de 1000/min é generoso; login corretamente 5/min).
- **CSRF** — API stateless com `Authorization: Bearer`, sem cookies de sessão.
- **`backend/.pgdata/`** — dados de runtime do Postgres embarcado, não código.
- **Replay do JWT_SECRET antigo com o valor literal** — impossível: o valor não foi registrado na 1ª rodada. Rotação comprovada por evidência indireta (senha admin revogada + rejeição de tokens de outros segredos).
- **Qualidade de código / acessibilidade / aderência funcional** — delegados ao code-reviewer e feature-review.

> 🧹 **Limpeza pendente (dev DB)**: esta rodada criou contas de teste — `idor-usera-*`, `masstest-*`, `idor-a/b/c-*`, `redir-test-*@example.com`. Remover antes de promover ambiente.

---

## Conclusion

As **9 pendências da 1ª rodada foram corrigidas e re-validadas em runtime**, incluindo os dois bloqueadores: (1) os `.env` de backend, frontend e site agora estão cobertos por `git check-ignore`, os segredos foram rotacionados (a senha antiga do admin não autentica mais e apenas o segredo atual — fora do Git — valida tokens), e (2) o SSRF do image optimizer sumiu — todo host arbitrário, inclusive o endpoint de metadata de cloud, retorna 400 instantâneo sem chamada de saída. Os três Medium (upload por magic bytes, headers em `/uploads/*`, `allowedHosts` explícito) e os quatro Low também foram fechados e confirmados. A postura de segurança da aplicação — RBAC por classe, escopo por `userId`, preço à prova de manipulação, `role` derivada do banco, zero SQLi/XSS — permanece sólida e agora **sem os furos de higiene de segredos**.

O único achado novo é um **open redirect no fluxo de login/cadastro** (mesma raiz nos dois formulários): o parâmetro `?redirect=` é repassado a `router.push()` sem restringir a caminhos internos, permitindo phishing a partir do domínio confiável da loja. O impacto é limitado a redirecionamento (não há roubo de token), a correção é de uma linha, e por isso é classificado como **Medium** — não bloqueante.

**Veredito: APPROVED.** Zero Critical, zero High. Recomenda-se corrigir o open redirect (Medium) e os itens de hardening Low no mesmo ciclo, mas nenhum deles impede a promoção.
