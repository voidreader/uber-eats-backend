import { InputType, ObjectType, PartialType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { User } from '../entities/user.entity';

@ObjectType()
export class EditProfileOutput extends CoreOutput {}

@InputType()
export class EditProfileInput extends PartialType(
  // Pick으로 2개를 가져오고 PartialType으로 두 값을 Optional 하게 만든다.
  PickType(User, ['email', 'password']),
) {}
