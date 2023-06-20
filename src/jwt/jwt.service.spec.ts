import { Test } from '@nestjs/testing';
import { JwtService } from './jwt.service';
import { CONFIG_OPTIONS } from 'src/common/common.const';
import * as jwt from 'jsonwebtoken';

const TEST_KEY = 'testKey';
const USER_ID = 1;

// npm module mocking
jest.mock('jsonwebtoken', () => {
  return {
    sign: jest.fn(() => 'TOKEN'),
    verify: jest.fn(() => ({ id: USER_ID })),
  };
});

describe('JWT Service', () => {
  let service: JwtService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: CONFIG_OPTIONS,
          useValue: { privateKey: TEST_KEY },
        },
      ],
    }).compile();

    service = module.get<JwtService>(JwtService);
  });

  it(`it should be dfined`, () => {
    expect(service).toBeDefined();
  });

  describe('sign', () => {
    it('사인 토큰 받기', async () => {
      const token = service.sign(1);
      expect(typeof token).toBe('string');
      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toHaveBeenCalledWith({ id: 1 }, TEST_KEY);
    }); // ? end of 사인토큰받기
  }); // end of describe 'sign'

  describe('verify', () => {
    it('verify 토큰!', async () => {
      const decodedToken = service.verify('TOKEN');
      console.log(decodedToken);
      expect(decodedToken).toEqual({ id: USER_ID });

      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(jwt.verify).toHaveBeenCalledWith('TOKEN', TEST_KEY);
    }); // ? end of it 토큰 인증
  }); // ? end of verify describe
}); // end of first describe
