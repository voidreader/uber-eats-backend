import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class RestaurantsResolver {
  @Query(() => Boolean) // for graphQL
  isPizzaGood() {
    // for typescrpt
    return true;
  }
}
