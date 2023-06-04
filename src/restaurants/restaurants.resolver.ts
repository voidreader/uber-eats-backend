import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { createRestaurantDto } from './entities/dtos/create-restaurant.dto';
import { UpdateRestaurantDto } from './entities/dtos/update-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';

@Resolver((of) => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  // 그래프QL과 타입스크립트에서 배열 표현방식이 다르다.
  @Query((returns) => [Restaurant])
  restaurants(): Promise<Restaurant[]> {
    return this.restaurantService.getAll();
  }

  @Mutation((returns) => Boolean)
  async createRestaurant(
    @Args('input') createRestaurantDto: createRestaurantDto,
  ): Promise<boolean> {
    try {
      await this.restaurantService.createRestaurant(createRestaurantDto);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  } // ? END createRestaurant

  @Mutation((returns) => Boolean)
  async updateRestaurant(
    @Args('input') updateRestaurantDto: UpdateRestaurantDto,
  ): Promise<boolean> {
    try {
      await this.restaurantService.updateRestaurant(updateRestaurantDto);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
