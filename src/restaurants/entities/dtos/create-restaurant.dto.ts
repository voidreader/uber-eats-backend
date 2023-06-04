import { ArgsType, Field, InputType, OmitType } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';
import { bool } from 'joi';
import { Restaurant } from '../restaurant.entity';

// export class createRestaurantDto extends OmitType(Restaurant, ['id']) {} // 이렇게 사용하는 경우 Restaurant와 동일한 ObjectType 클래스가 된다.
// ! export class createRestaurantDto extends OmitType(Restaurant, ['id'], InputType) {} // 다음 Parameter를 통해서 child type 데코레이터를 변경할 수 있다.

@InputType()
export class createRestaurantDto extends OmitType(
  Restaurant,
  ['id'],
  InputType,
) {} // 이렇게 사용하는 경우 Restaurant와 동일한 ObjectType 클래스가 된다.
