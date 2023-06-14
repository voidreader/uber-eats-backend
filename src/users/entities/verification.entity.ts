import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { v4 as uuidv4 } from 'uuid';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Verification extends CoreEntity {
  // id , createdAt, updatedAt

  @Column()
  @Field((type) => String)
  code: string;

  // one-to-one relations. 1:1 관계

  // 만약 user로부터 verification에 접근하고 싶다면
  // JoinColumn이 User쪽에 있어야한다.

  // Verification에서 User에 접근하길 원한다.
  // JoinColumn이 Verification에 있어야한다.

  @OneToOne((type) => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @BeforeInsert()
  createCode(): void {
    // this.code = Math.random().toString(36).substring(2);
    this.code = uuidv4();
  }
}
