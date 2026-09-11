# syntax=docker/dockerfile:1.7
# ─────────────────────────────────────────────────────────────────────────────
# Dockerfile multi-stage para Next.js 15 em produção
# Baseado no exemplo oficial: github.com/vercel/next.js/tree/canary/examples/with-docker
#
# Estratégia:
#   - 3 estágios: deps → builder → runner
#   - Alpine + libc6-compat = imagem final ~150 MB
#   - Suporta npm, yarn (clássico/berry) e pnpm via detecção de lockfile
#   - Cache de dependências persistente via BuildKit (--mount=type=cache)
#   - output: "standalone" do Next reduz drasticamente o bundle final
#   - Roda como usuário não-root (UID 1001) por segurança
#   - HEALTHCHECK validando o servidor
#
# Pré-requisito no projeto: next.config.ts com `output: "standalone"`.
#
# Build:   docker build -t site:latest .
# Run:     docker run -p 8080:8080 --env-file .env site:latest
# ─────────────────────────────────────────────────────────────────────────────

ARG NODE_VERSION=22-alpine

# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — deps: instala node_modules (sem devDeps quando possível)
# ─────────────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS deps

# libc6-compat: necessário para alguns binários Node em Alpine (sharp, swc)
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copia apenas manifestos para maximizar cache de layer
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./

RUN --mount=type=cache,target=/root/.npm \
    --mount=type=cache,target=/root/.yarn \
    --mount=type=cache,target=/root/.local/share/pnpm/store \
    if   [ -f package-lock.json ]; then npm ci --no-audit --no-fund; \
    elif [ -f yarn.lock ];          then corepack enable && yarn install --frozen-lockfile; \
    elif [ -f pnpm-lock.yaml ];     then corepack enable && pnpm install --frozen-lockfile; \
    else echo "Nenhum lockfile encontrado." && exit 1; \
    fi

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — builder: gera o build de produção (.next/standalone)
# ─────────────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variáveis NEXT_PUBLIC_* precisam estar disponíveis no build (são inlined no bundle).
# Passe via --build-arg ou docker compose:
#   docker build --build-arg NEXT_PUBLIC_SITE_URL=https://meusite.com .
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_SITE_NAME
ARG NEXT_PUBLIC_DEFAULT_LOCALE
ARG NEXT_PUBLIC_GA_ID
ARG NEXT_PUBLIC_GTM_ID
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_SITE_NAME=${NEXT_PUBLIC_SITE_NAME}
ENV NEXT_PUBLIC_DEFAULT_LOCALE=${NEXT_PUBLIC_DEFAULT_LOCALE}
ENV NEXT_PUBLIC_GA_ID=${NEXT_PUBLIC_GA_ID}
ENV NEXT_PUBLIC_GTM_ID=${NEXT_PUBLIC_GTM_ID}

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN if   [ -f package-lock.json ]; then npm run build; \
    elif [ -f yarn.lock ];          then corepack enable && yarn build; \
    elif [ -f pnpm-lock.yaml ];     then corepack enable && pnpm build; \
    else echo "Nenhum lockfile encontrado." && exit 1; \
    fi

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3 — runner: imagem final mínima para produção
# ─────────────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Usuário não-root para reduzir blast radius em caso de exploit
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Copia o público (servido em /) e o standalone gerado pelo Next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

# Healthcheck simples — valida que o servidor responde HTTP 200 na home
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:8080/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# server.js é gerado automaticamente pelo `output: "standalone"`
CMD ["node", "server.js"]
