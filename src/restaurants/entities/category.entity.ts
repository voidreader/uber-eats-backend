import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import {
  IsBoolean,
  IsOptional,
  IsString,
  Length,
  isString,
} from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Restaurant } from './restaurant.entity';
// graphQL와 TypeORM을 하나의 클래스에서 데코레이터를 통해서 사용할 수 있다.

@InputType('CategoryInputType', { isAbstract: true })
@ObjectType() // graphLQ
@Entity() // TypeORM
export class Category extends CoreEntity {
  @Field(() => String)
  @Column({ unique: true })
  @IsString()
  name: string;

  @Field((type) => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  coverImg: string;

  @Field((type) => String)
  @Column({ unique: true })
  @IsString()
  slug: string;

  // 카테고리는 여러 레스토랑을 가질 수 있다.
  // 레스토랑에서는 restaurant의 category 컬럼을
  // 카테고리를 지울때 레스토랑을 지우면 안된다!
  @Field((type) => [Restaurant])
  @OneToMany((type) => Restaurant, (restaurant) => restaurant.category)
  restaurants: Restaurant[];
}
