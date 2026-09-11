# Deploy e Ambiente

## Comandos

```bash
npm install            # instalar dependências
npm run dev            # dev server em 0.0.0.0:8080
npm run build          # build de produção
npm run start          # serve build em 0.0.0.0:8080
npm run lint           # ESLint (next/core-web-vitals)
npm run typecheck      # tsc --noEmit
```

## Host e porta

Configurados em `package.json`:

```json
"dev":   "next dev   -H 0.0.0.0 -p 8080",
"start": "next start -H 0.0.0.0 -p 8080"
```

- **`0.0.0.0`** — escuta em todas as interfaces de rede. Necessário para acesso de outras máquinas/containers.
- **`8080`** — porta padrão. Para mudar, sobrescreva no `package.json` ou via variável de ambiente em hosting platforms.

> ⚠️ **Cuidado em redes públicas.** `0.0.0.0` em laptop sem firewall expõe o dev server à LAN. Em CI/containers isolados, é seguro.

## Variáveis de ambiente

Veja `.env.example` para a lista completa. Mínimo para produção:

| Variável | Obrigatória | Uso |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | ✅ | URL canônica (sem barra final) |
| `NEXT_PUBLIC_SITE_NAME` | recomendada | Nome da marca |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | recomendada | `pt_BR` por padrão |
| `GOOGLE_SITE_VERIFICATION` | opcional | Search Console |
| `NEXT_PUBLIC_GA_ID` | opcional | Google Analytics |
| `NEXT_PUBLIC_GTM_ID` | opcional | Google Tag Manager |

## Docker

O `Dockerfile` na raiz do projeto é multi-stage (deps → builder → runner)
baseado no exemplo oficial da Vercel, usando Alpine + libc6-compat,
BuildKit cache mounts e usuário não-root. Imagem final: ~150 MB.

Pré-requisito: `next.config.ts` com `output: "standalone"` (já configurado).

### Build local

```bash
# Build e run direto
docker build -t site .
docker run -p 8080:8080 --env-file .env site

# Ou via compose (mais ergonômico)
docker compose up --build
docker compose down
```

### Variáveis NEXT_PUBLIC_* são inlined no build

Como o Next compila essas variáveis dentro do bundle, **passe via `--build-arg`**, não via `--env`:

```bash
docker build \
  --build-arg NEXT_PUBLIC_SITE_URL=https://meusite.com \
  --build-arg NEXT_PUBLIC_GA_ID=G-XXXXXX \
  -t site .
```

O `docker-compose.yml` já mapeia automaticamente do `.env` para `args`.

### Variáveis privadas (sem prefixo)

Disponíveis em runtime (server components, route handlers). Passe normalmente via `--env`/`environment:` no compose:

```bash
docker run -p 8080:8080 -e GOOGLE_SITE_VERIFICATION=abc123 site
```

### Healthcheck

O Dockerfile inclui `HEALTHCHECK` que valida HTTP 200 em `/` a cada 30s. Veja status com `docker ps` ou `docker inspect`.

## Plataformas de deploy

| Plataforma | Comando | Notas |
|---|---|---|
| **Vercel** | `vercel deploy` ou push pra branch | Zero config, edge functions nativas |
| **Netlify** | conector Git + plugin Next | Suporta App Router via adapter |
| **AWS** | OpenNext + CDK/SST | Para Amplify use SSR adapter |
| **Cloudflare Pages** | `next-on-pages` | Edge runtime obrigatório |
| **Self-hosted** | Docker + nginx/traefik | Configure HTTPS no proxy |

## Observabilidade

### Erros
- **Sentry** ou **Bugsnag** — integre em `app/error.tsx` e `app/global-error.tsx`.

### Métricas
- **Vercel Analytics** ou **Plausible** — privacy-friendly, sem cookies.
- **Web Vitals** — coleta no campo:
  ```tsx
  import { useReportWebVitals } from "next/web-vitals";

  useReportWebVitals((metric) => sendToAnalytics(metric));
  ```

### Logs
- Em containers, logue em **stdout/stderr** (12-factor app).
- Use logger estruturado (pino, winston) com JSON em produção.

## CI/CD mínimo

```yaml
# .github/workflows/ci.yml (exemplo)
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run build
```

## Checklist pré-deploy

- [ ] `npm run build` passa sem erros nem warnings críticos
- [ ] `npm run lint` passa
- [ ] `npm run typecheck` passa
- [ ] Variáveis de ambiente configuradas no host
- [ ] Domínio aponta para o deploy (DNS A/CNAME)
- [ ] HTTPS forçado (HSTS após período de teste)
- [ ] `NEXT_PUBLIC_SITE_URL` aponta para o domínio final
- [ ] `og-image.png` existe em `public/` (1200×630)
- [ ] Favicon, apple-touch-icon, manifest icons presentes
- [ ] Search Console configurado (`GOOGLE_SITE_VERIFICATION`)
- [ ] Sitemap acessível em `/sitemap.xml`
- [ ] robots.txt acessível em `/robots.txt`
- [ ] Lighthouse: Performance ≥ 90, A11y ≥ 95, Best Practices ≥ 95, SEO = 100
