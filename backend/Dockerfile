# syntax=docker/dockerfile:1.7

# ---------- Stage 1: build (compila TypeScript e instala dependências nativas) ----------
FROM node:22-alpine AS builder

WORKDIR /app

# Ferramentas necessárias para compilar módulos nativos (better-sqlite3, sqlite3)
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig*.json nest-cli.json ./
COPY src ./src

RUN npm run build

# ---------- Stage 2: production deps (apenas dependências de runtime) ----------
FROM node:22-alpine AS prod-deps

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ---------- Stage 3: runner (imagem final mínima) ----------
FROM node:22-alpine AS runner

ENV NODE_ENV=production \
    PORT=3000

WORKDIR /app

# dumb-init para tratar sinais corretamente (SIGTERM/SIGINT) como PID 1
RUN apk add --no-cache dumb-init \
    && addgroup -S nodejs \
    && adduser -S nestjs -G nodejs

COPY --chown=nestjs:nodejs package.json package-lock.json ./
COPY --from=prod-deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

USER nestjs

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
