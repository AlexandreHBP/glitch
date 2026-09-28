/**
 * Runner dos seeds de desenvolvimento/produção inicial: admin + categorias.
 * Uso: npm run seed
 */
import { AppDataSource } from '../../data-source';
import { seedAdmin } from './seed-admin';
import { seedCategories } from './seed-categories';

async function run(): Promise<void> {
  await AppDataSource.initialize();

  try {
    await seedAdmin(AppDataSource);
    await seedCategories(AppDataSource);
  } finally {
    await AppDataSource.destroy();
  }
}

run()
  .then(() => {
    console.log('[seed] Concluído.');
    process.exit(0);
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[seed] Falhou:', message);
    process.exit(1);
  });
