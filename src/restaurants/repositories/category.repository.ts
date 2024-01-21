import { DataSource, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoryRepository extends Repository<Category> {
  constructor(private dataSource: DataSource) {
    super(Category, dataSource.createEntityManager());
  }

  async getOrCreate(name: string): Promise<Category> {
    // Category를 할당한다. slug  포함
    const categoryName = name.trim().toLowerCase();

    const categorySlug = categoryName.replace(/ /g, '-');

    // category 찾기
    let category = await this.findOne({
      where: { slug: categorySlug },
    });

    if (!category) {
      category = await this.save(
        this.create({ slug: categorySlug, name: categoryName }),
      );
    }

    return category;
  }
}
