/**
 * Sanitização do parâmetro `?redirect=` usado por LoginForm e RegisterForm
 * para devolver o cliente ao checkout depois de autenticar (RN02).
 *
 * Nunca repassar esse valor cru para router.push(): ele vem da querystring
 * (controlada por quem monta o link) e um destino absoluto ou
 * protocol-relative (`https://evil.com`, `//evil.com`) causaria um open
 * redirect — o cliente autentica no domínio legítimo e é enviado embora
 * logo em seguida. Só aceitamos caminhos internos, começando com um único
 * `/`.
 */
const DEFAULT_REDIRECT = "/minha-conta";

export function getSafeRedirect(rawRedirect: string | null, fallback: string = DEFAULT_REDIRECT): string {
  if (!rawRedirect) return fallback;
  // `//evil.com` é protocol-relative (o browser resolve como
  // `https://evil.com`); `/\evil.com` é normalizado da mesma forma por
  // alguns browsers, então bloqueamos os dois, não só `//`.
  const isInternalPath = /^\/(?!\/|\\)/.test(rawRedirect);
  return isInternalPath ? rawRedirect : fallback;
}
