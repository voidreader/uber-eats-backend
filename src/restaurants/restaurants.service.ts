import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './entities/dtos/create-restaurant.dto';

import { Restaurant } from './entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Category } from './entities/category.entity';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './entities/dtos/edit-restaurant.dto';
import { CategoryRepository } from './repositories/category.repository';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categories: CategoryRepository,
  ) {}

  getAll(): Promise<Restaurant[]> {
    return this.restaurants.find();
  }

  // * 레스토랑 만들기
  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);

      // owner를 할당한다.
      newRestaurant.owner = owner;
      const category = await this.categories.getOrCreate(
        createRestaurantInput.categoryName,
      );

      newRestaurant.category = category;

      await this.restaurants.save(newRestaurant);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  } // ? END create Restaurant

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    // 레스토랑을 수정하는 유저가 owner가 맞는지 체크한다.

    const restaurant = await this.restaurants.findOne({
      where: {
        id: editRestaurantInput.restaurantId,
      },
      loadRelationIds: true,
    });

    if (!restaurant) {
      return {
        ok: false,
        error: 'Restaurant not fount',
      };
    }

    if (owner.id !== restaurant.ownerId) {
      return {
        ok: false,
        error: `You can't edit this restaurant`,
      };
    }

    let category: Category = null;
    if (editRestaurantInput.categoryName) {
      // 카테고리 이름이 있으면 처리
      category = await this.categories.getOrCreate(
        editRestaurantInput.categoryName,
      );
    }

    await this.restaurants.save([
      {
        id: editRestaurantInput.restaurantId,
        ...editRestaurantInput,
        ...(category && { category }), // 카테고리가 있으면 spread
      },
    ]);

    return { ok: true };
  } // ? END EditRestaurant
}
