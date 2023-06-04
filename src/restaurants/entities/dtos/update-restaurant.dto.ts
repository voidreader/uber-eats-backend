import {
  ArgsType,
  Field,
  InputType,
  OmitType,
  PartialType,
} from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';
import { bool } from 'joi';
import { Restaurant } from '../restaurant.entity';
import { createRestaurantDto } from './create-restaurant.dto';

@InputType()
class UpdateRestaurantInputType extends PartialType(createRestaurantDto) {}

@InputType()
export class UpdateRestaurantDto {
  @Field((type) => Number)
  id: number;

  @Field((type) => UpdateRestaurantInputType)
  data: UpdateRestaurantInputType;
}
