/**
 * Papel do usuário. Uma única tabela `users` guarda cliente e admin
 * (ver "Autenticação e Autorização" da arquitetura) — duplicar a
 * identidade em tabelas separadas dobraria a superfície de bug/ataque.
 */
export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}
