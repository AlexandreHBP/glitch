/**
 * Lista categorias ativas, para o catálogo público.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { ListCategories } from './interfaces';

@Injectable()
export class ListCategoriesUseCase implements ListCategories {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async listCategories(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { active: true },
      order: { name: 'ASC' },
    });
  }
}
