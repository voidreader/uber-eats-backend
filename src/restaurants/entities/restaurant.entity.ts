import { Field, ObjectType } from '@nestjs/graphql';

// 데이터베이스 모델.
@ObjectType()
export class Restaurant {
  @Field(() => String)
  name: string;

  @Field(() => Boolean, { nullable: true })
  isGood?: boolean;

  @Field(() => String)
  address: string;

  @Field(() => String)
  ownerName: string;
}
