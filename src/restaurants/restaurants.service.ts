import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createRestaurantDto } from './entities/dtos/create-restaurant.dto';
import { UpdateRestaurantDto } from './entities/dtos/update-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
  ) {}

  getAll(): Promise<Restaurant[]> {
    return this.restaurants.find();
  }

  createRestaurant(
    createRestaurantDto: createRestaurantDto,
  ): Promise<Restaurant> {
    // create & save
    // const newRestaurant = new Restaurant();
    // newRestaurant.name = createRestaurantDto.name; // 넘 짜증...!

    const newRestaurant = this.restaurants.create(createRestaurantDto);
    return this.restaurants.save(newRestaurant);
  }

  updateRestaurant({ id, data }: UpdateRestaurantDto) {
    // search criteria, 데이터
    return this.restaurants.update(id, { ...data });
  }
}
