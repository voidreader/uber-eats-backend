import {
  ArgsType,
  Field,
  InputType,
  ObjectType,
  OmitType,
  PickType,
} from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';
import { bool } from 'joi';
import { Restaurant } from '../restaurant.entity';
import { CoreOutput } from 'src/common/dtos/output.dto';

// export class createRestaurantDto extends OmitType(Restaurant, ['id']) {} // 이렇게 사용하는 경우 Restaurant와 동일한 ObjectType 클래스가 된다.
// ! export class createRestaurantDto extends OmitType(Restaurant, ['id'], InputType) {} // 다음 Parameter를 통해서 child type 데코레이터를 변경할 수 있다.

@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, [
  'name',
  'coverImg',
  'address',
]) {
  @Field((type) => String)
  categoryName: string;
}

// export class CreateRestaurantInput extends OmitType(
//   Restaurant,
//   ['id', 'category', 'owner'],
//   InputType,
// ) {} // 이렇게 사용하는 경우 Restaurant와 동일한 ObjectType 클래스가 된다.

@ObjectType()
export class CreateRestaurantOutput extends CoreOutput {}
