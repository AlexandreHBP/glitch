# Segurança — Headers, CSP e Boas Práticas

## Headers HTTP (configurados em `next.config.ts`)

| Header | Valor | Por que |
|---|---|---|
| `X-Frame-Options` | `SAMEORIGIN` | Bloqueia clickjacking via iframe |
| `X-Content-Type-Options` | `nosniff` | Impede MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Vaza menos info em links externos |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Negar features sensíveis |
| `X-DNS-Prefetch-Control` | `on` | Acelera resolução DNS |

### Adicionar em produção

| Header | Valor recomendado |
|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `Content-Security-Policy` | (ver abaixo) |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Cross-Origin-Embedder-Policy` | `require-corp` (cuidado: pode quebrar embeds) |

> **Não adicione HSTS em desenvolvimento** — pode lockar o navegador no localhost via HTTPS.

## Content Security Policy (CSP)

CSP é a defesa mais forte contra XSS. Comece em modo `Report-Only` e migre para enforcement quando estável.

```ts
// next.config.ts (exemplo — ajuste para seus domínios)
{
  key: "Content-Security-Policy",
  value: [
    "default-src 'self'",
    "script-src 'self' 'nonce-{NONCE}' 'strict-dynamic'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
}
```

Para nonces dinâmicos, use middleware do Next ([docs](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)).

## Variáveis de ambiente

### Regras

- **Públicas**: prefixadas `NEXT_PUBLIC_*` — bundladas no client.
- **Privadas**: sem prefixo — disponíveis **apenas** em server components, route handlers, server actions.
- **Nunca** commit `.env*` (já no `.gitignore`).
- Sempre tenha `.env.example` versionado documentando as variáveis necessárias.

### Validação

Em projetos críticos, valide env com [zod](https://github.com/colinhacks/zod):

```ts
// lib/env.ts
import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  GOOGLE_SITE_VERIFICATION: z.string().optional(),
});

export const env = schema.parse(process.env);
```

Falha rápido em build se env estiver malformada.

## Sanitização

- **JSX escapa HTML por padrão** — não use `dangerouslySetInnerHTML` sem sanitizar com DOMPurify.
- **Markdown de usuário** → renderize via biblioteca segura (`react-markdown` + `rehype-sanitize`).
- **SQL** → use ORM/query builder com parametrização, nunca string concat.
- **Comandos de shell** → evite. Se necessário, valide whitelist e use `execFile` em vez de `exec`.

## Autenticação (quando aplicável)

- **Sessão server-side** preferida sobre JWT no localStorage.
- **Cookies** com `HttpOnly`, `Secure`, `SameSite=Lax` (ou `Strict`).
- **CSRF token** em forms que mutam estado (não puramente API + JWT).
- **Rate limiting** em endpoints sensíveis (login, signup, reset).
- **bcrypt/argon2** para senhas. Nunca SHA/MD5.

## Dependências

- `npm audit` em CI.
- Dependabot/Renovate ativo.
- Pin major versions em `package.json` (evite `^` em libs críticas após estabilização).
- Audite libs novas — supply chain attacks são reais.

## Forms e API

- **Validação no server**, não confie no client.
- **Schema com zod/valibot** em route handlers.
- **CORS** configurado restritivamente em `/api/*`.
- **Rate limit** por IP/usuário em endpoints públicos.
- **Captcha** (hCaptcha, Cloudflare Turnstile) em forms públicos críticos.

## LGPD/GDPR

- Banner de consentimento para cookies não-essenciais.
- Política de privacidade acessível no footer.
- Direito ao esquecimento — endpoint para deleção de dados.
- DPO/contato para solicitações de privacidade.

## Logs

- **Nunca logue** PII, senhas, tokens, dados de cartão.
- Use níveis (`debug`, `info`, `warn`, `error`).
- Em produção, integre Sentry/Datadog para erros (já tem hook em `app/error.tsx`).

## Checklist pré-deploy

- [ ] HTTPS forçado
- [ ] Headers de segurança aplicados
- [ ] CSP em modo enforcement (após período Report-Only)
- [ ] HSTS habilitado
- [ ] Variáveis de ambiente validadas
- [ ] `npm audit` sem vulnerabilidades altas/críticas
- [ ] Rate limiting em rotas autenticadas e forms públicos
- [ ] Banner LGPD/cookies
- [ ] Política de privacidade publicada
