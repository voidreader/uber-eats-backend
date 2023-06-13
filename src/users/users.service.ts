import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';

import { ConfigService } from '@nestjs/config';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput } from './dtos/edit-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<[boolean, string?]> {
    // check that email does not exist. (new user check )
    // 계정 생성, 비밀번호 해싱
    try {
      const exists = await this.users.findOne({ where: { email } }); // typeORM 버전이 올라가면서 where을 명시적으로 작성해주어야한다.

      if (exists) {
        // 에러
        // throw Error()

        return [false, '이미 유저 존재함'];
      }

      await this.users.save(this.users.create({ email, password, role }));
      return [true];
    } catch (e) {
      console.log(e);
      return [false, '게정을 생성할 수 없었습니다.'];
    }
  } // ? END OF createAccount

  async login({
    email,
    password,
  }: LoginInput): Promise<{ ok: boolean; error?: string; token?: string }> {
    // 1. email 찾기
    // 2. password 검증
    // 3. JWT 생성 후 유저에게 전달.

    try {
      const user = await this.users.findOne({ where: { email } });
      if (!user) {
        return { ok: false, error: 'email 올바르지 않음' };
      }

      const passCheckResult = await user.checkPassword(password);

      if (!passCheckResult) {
        return {
          ok: false,
          error: '패스워드 틀림',
        };
      }

      // const token = jwt.sign({ id: user.id }, this.config.get('SECRET_KEY'));
      const token = this.jwtService.sign(user.id);

      return {
        ok: true,
        token,
      };
    } catch (e) {
      return {
        ok: false,
        error: e,
      };
    }
  } // ? END login

  async findById(id: number): Promise<User> {
    return this.users.findOne({ where: { id } });
  }

  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<User> {
    // return this.users.update({ id: userId }, { email, password });
    const user = await this.users.findOne({ where: { id: userId } });

    // typeorm에서 beforeupdate를 상시 발동하기 위해서
    // 강제로 업데이트 된것처럼 만들어준다.
    if (email) {
      user.email = email;
    }

    if (password) {
      user.password = password;
    }

    return this.users.save(user);
  }
}
