import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// graphQL와 TypeORM을 하나의 클래스에서 데코레이터를 통해서 사용할 수 있다.

@ObjectType() // graphLQ
@Entity() // TypeORM
export class Restaurant {
  @PrimaryGeneratedColumn()
  @Field((type) => Number)
  id: number;

  @Field(() => String)
  @Column()
  name: string;

  @Field(() => Boolean, { nullable: true })
  @Column()
  isGood?: boolean;

  @Field(() => String)
  @Column()
  address: string;

  @Field(() => String)
  @Column()
  ownerName: string;

  @Field((type) => String)
  @Column()
  categoryName: string;
}
