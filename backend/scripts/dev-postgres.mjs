/*
 * Sobe um PostgreSQL "embutido" (binário baixado pelo pacote embedded-postgres,
 * sem Docker e sem privilégios de root) para uso EXCLUSIVO em desenvolvimento
 * local neste ambiente sandbox, onde não há Docker nem um Postgres real
 * disponível na máquina.
 *
 * Decisão de infraestrutura (ver ./todo/architecture-glitch-loja.md, Fase 0):
 * o ambiente não tem `docker`, nem `sudo`/apt para instalar postgresql-server,
 * e as variáveis de ambiente de um Postgres gerenciado externamente não estão
 * expostas neste shell. A solução escolhida foi usar o pacote npm
 * `embedded-postgres`, que baixa um binário oficial do Postgres e o roda como
 * processo comum do usuário atual, ouvindo em 127.0.0.1:5432 com as mesmas
 * credenciais já configuradas em backend/.env (postgres/postgres/postgres).
 *
 * Isso é uma solução de DESENVOLVIMENTO apenas. Em produção, o
 * docker-compose.yml (ver build/) continua usando a imagem oficial
 * `postgres:16` — este script nunca é usado fora do `devmode`.
 *
 * Os dados ficam em backend/.pgdata (fora do controle de versão).
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import EmbeddedPostgres from 'embedded-postgres';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '.pgdata');

const pg = new EmbeddedPostgres({
  databaseDir: DATA_DIR,
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  persistent: true,
});

async function main() {
  const alreadyInitialized = fs.existsSync(path.join(DATA_DIR, 'PG_VERSION'));

  if (!alreadyInitialized) {
    console.log('[dev-postgres] Inicializando cluster Postgres em', DATA_DIR);
    await pg.initialise();
  }

  await pg.start();
  console.log(
    `[dev-postgres] Postgres pronto em 127.0.0.1:${process.env.POSTGRES_PORT || 5432} (banco "postgres")`,
  );

  const dbName = process.env.POSTGRES_DB || 'postgres';
  if (dbName !== 'postgres') {
    try {
      await pg.createDatabase(dbName);
      console.log(`[dev-postgres] Banco "${dbName}" criado`);
    } catch {
      // já existe, ok
    }
  }

  const shutdown = async () => {
    console.log('[dev-postgres] Encerrando...');
    try {
      await pg.stop();
    } finally {
      process.exit(0);
    }
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('[dev-postgres] Falha ao iniciar Postgres embutido:', err);
  process.exit(1);
});
