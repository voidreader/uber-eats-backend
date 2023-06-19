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
});

const mockJwtService = {
  sign: jest.fn(),
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

  beforeAll(async () => {
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
      usersRepository.findOne.mockRejectedValue(new Error('whatever!'));
      try {
        const result = await service.createAccount(createAccountArgs);
        console.log(result);
        expect(result).toEqual({ ok: false, error: "Couldn't create account" });
      } catch (e) {}
    }); // END OF it.
  }); // ? end of describe('createAccount', () => {
  //   it.todo(`createAccount`);

  it.todo(`login`);
  it.todo(`findById`);
  it.todo(`editProfile`);
  it.todo(`verifyEmail`);
}); // ? end of describe
