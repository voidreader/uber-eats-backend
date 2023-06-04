import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<string | undefined> {
    // check that email does not exist. (new user check )
    // 계정 생성, 비밀번호 해싱
    try {
      const exists = await this.users.findOne({ where: { email } }); // typeORM 버전이 올라가면서 where을 명시적으로 작성해주어야한다.

      if (exists) {
        // 에러
        // throw Error()

        return '이미 유저 존재함';
      }

      await this.users.save(this.users.create({ email, password, role }));
    } catch (e) {
      console.log(e);
      return '게정을 생성할 수 없었습니다.';
    }
  }
}
