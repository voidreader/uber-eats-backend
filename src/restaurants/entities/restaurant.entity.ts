import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Category } from './category.entity';
import { User } from 'src/users/entities/user.entity';
// graphQL와 TypeORM을 하나의 클래스에서 데코레이터를 통해서 사용할 수 있다.

@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType() // graphLQ
@Entity() // TypeORM
export class Restaurant extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  name: string;

  @Field((type) => String)
  @Column()
  @IsString()
  coverImg: string;

  @Field(() => String)
  @Column()
  address: string;

  // 카테고리를 지울때 레스토랑을 지우면 안된다! 그래서 nullable로 해주어야한다.
  // 카테고리 삭제시 레스토랑의 컬럼은 NULL로 처리
  @Field((type) => Category, { nullable: true })
  @ManyToOne((type) => Category, (category) => category.restaurants, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category: Category;

  @Field((type) => User)
  @ManyToOne((type) => User, (owner) => owner.restaurants, {
    onDelete: 'CASCADE',
  })
  owner: User;
}
