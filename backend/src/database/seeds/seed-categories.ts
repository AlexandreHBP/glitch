/**
 * Cria as categorias iniciais do catálogo, se ainda não existirem.
 */
import { DataSource } from 'typeorm';
import { Category } from '../../modules/catalog/entities/category.entity';
import { slugify } from '../../common/utils/slugify';

const INITIAL_CATEGORIES = ['Camisetas', 'Moletons', 'Acessórios', 'Calças'];

export async function seedCategories(dataSource: DataSource): Promise<void> {
  const categoryRepository = dataSource.getRepository(Category);

  for (const name of INITIAL_CATEGORIES) {
    const slug = slugify(name);
    const existing = await categoryRepository.findOne({ where: { slug } });

    if (existing) {
      continue;
    }

    const category = categoryRepository.create({ name, slug, active: true });
    await categoryRepository.save(category);
    console.log(`[seed-categories] Categoria "${name}" criada.`);
  }
}
