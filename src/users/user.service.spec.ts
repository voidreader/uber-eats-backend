import { ExternalExceptionFilterContext } from '@nestjs/core/exceptions/external-exception-filter-context';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JsonWebTokenError } from 'jsonwebtoken';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UserService } from './users.service';
import { string } from 'joi';

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
});

const mockJwtService = {
  sign: jest.fn(() => 'fake signed-token'),
  verify: jest.fn(),
};

const mockMailService = {
  sendVerificationEmail: jest.fn(),
};

type MockRepository<T> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserService', () => {
  // 선언하고, TestingModule에서 값을 할당해야한다.
  let service: UserService;
  let usersRepository: MockRepository<User>;
  let verificationsRepository: MockRepository<Verification>;
  let mailService: MailService;
  let jwtService: JwtService;

  //beforeAll은 한번만, each는 describe마다 각각.
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    usersRepository = module.get(getRepositoryToken(User));
    verificationsRepository = module.get(getRepositoryToken(Verification));
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
  }); // end beforeAll

  it(`it should be dfined`, () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    const createAccountArgs = {
      email: 'xxx@naver.com',
      password: 'xxxx',
      role: 0,
    };

    it('should fail if user exists', async () => {
      // DB에 유저가 있으면 fail
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'radiogaga.jin@gmail.com',
      });

      const result = await service.createAccount(createAccountArgs);

      expect(result).toMatchObject({
        ok: false,
        error: 'There is a user with that email already',
      });
    });

    it(`should create a new user`, async () => {
      usersRepository.findOne.mockResolvedValue(undefined);
      usersRepository.create.mockReturnValue(createAccountArgs);
      usersRepository.save.mockResolvedValue(createAccountArgs);
      verificationsRepository.create.mockReturnValue({
        user: createAccountArgs,
      });
      verificationsRepository.save.mockResolvedValue({ code: 'code' });

      // 서비스 호출하고.
      const result = await service.createAccount(createAccountArgs);

      // 여러 다른 함수를 통해서 expect.
      expect(usersRepository.create).toHaveBeenCalledTimes(1); // 함수가 1번 불릴것이다.
      // expect(usersRepository.create).toHaveBeenCalledWith('potato'); // 인수가 무엇이었는지?
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs); // 인수가 무엇이었는지?
      expect(usersRepository.save).toHaveBeenCalled();
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);
      expect(verificationsRepository.create).toHaveBeenCalled();
      expect(verificationsRepository.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      expect(verificationsRepository.save).toHaveBeenCalled();
      expect(verificationsRepository.save).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      expect(mailService.sendVerificationEmail).toHaveBeenCalled();
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );

      expect(result).toEqual({ ok: true });
    }); // ? END it

    it('should fail an exception', async () => {
      // 강제 실패를 위해 가짜 rejectedValue 설정
      usersRepository.findOne.mockRejectedValue(new Error('whatever!'));
      try {
        const result = await service.createAccount(createAccountArgs);
        console.log(result);
        expect(result).toEqual({ ok: false, error: "Couldn't create account" });
      } catch (e) {}
    }); // END OF it.
  }); // ? end of describe('createAccount', () => {
  //   it.todo(`createAccount`);

  describe(`login`, () => {
    const loginArgs = {
      email: 'xxx@gmail.com',
      password: 'XXXX',
    };

    it('유저가 존재하지 않는 경우 fail', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      const result = await service.login(loginArgs);

      expect(usersRepository.findOne).toHaveBeenCalled();
      expect(usersRepository.findOne).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toEqual({
        ok: false,
        error: 'User not found',
      });
    }); // end of it.

    it(`패스워드가 틀리면 fail!`, async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      console.log(result);

      expect(result).toEqual({
        ok: false,
        error: 'Wrong password',
      });
    }); // end of it

    it('토큰 받기!', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      // expect
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));
      expect(result).toEqual({
        ok: true,
        token: 'fake signed-token',
      });
    }); // ? end of it '토큰받기'
  }); // ? END OF login

  describe(`findById`, () => {
    const findByIdArgs = {
      id: 1,
    };

    it('유저 찾았음', async () => {
      usersRepository.findOneOrFail.mockResolvedValue(findByIdArgs);
      const result = await service.findById(1);

      expect(result).toEqual({ ok: true, user: findByIdArgs });
    }); // end of it.

    it('유저 못찾음', async () => {
      usersRepository.findOneOrFail.mockRejectedValue(new Error());
      const result = await service.findById(1);

      expect(result).toEqual({ ok: false, error: 'User Not Found' });
    }); // end of it.
  }); // ? END of findById

  describe(`editProfile`, () => {
    it('이메일 주소 변경하기', async () => {
      const oldUser = {
        email: 'xxx@gmail.com',
        verified: true,
      };

      const editProfileArgs = {
        userId: 1,
        input: { email: 'efef@gmail.com' },
      };

      const newVerfication = {
        code: 'new code',
      };

      const newUser = {
        email: editProfileArgs.input.email,
        verified: false,
      };

      // mock
      usersRepository.findOne.mockResolvedValue(oldUser);
      verificationsRepository.create.mockReturnValue(newVerfication);
      verificationsRepository.save.mockResolvedValue(newVerfication);

      await service.editProfile(editProfileArgs.userId, editProfileArgs.input);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: editProfileArgs.userId },
      });

      expect(verificationsRepository.create).toHaveBeenCalledWith({
        user: newUser,
      });
      expect(verificationsRepository.save).toHaveBeenCalledWith(newVerfication);

      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        newUser.email,
        newVerfication.code,
      );
    }); // end of '이메일 주소 변경'
  }); // ? end of describe(`editProfile`, ()=> {
  it.todo(`verifyEmail`);
}); // ? end of describe
