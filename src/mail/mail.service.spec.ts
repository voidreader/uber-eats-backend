import { Test } from '@nestjs/testing';
import { MailService } from './mail.service';
import { CONFIG_OPTIONS } from 'src/common/common.const';

import got from 'got';
import * as FormData from 'form-data';

jest.mock('got'); // 모듈 자체를 mock.
jest.mock('form-data');

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            apiKey: 'TEST-apiKey',
            domain: 'TEST-domain',
            fromEmail: 'TEST-fromMail',
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it(`it should be dfined`, () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('sendVerificationEmail', async () => {
      const sendArgs = {
        email: 'email',
        code: 'code',
      };

      // service.sendEmail = jest.fn(); // mocking
      jest.spyOn(service, 'sendEmail').mockImplementation(async () => {
        console.log('mock implementation');
      });
      service.sendVerificationEmail(sendArgs.email, sendArgs.code);

      expect(service.sendEmail).toHaveBeenCalledTimes(1);
      expect(service.sendEmail).toHaveBeenCalledWith(
        'Verify Your Email',
        'verify-email',
        [{ key: 'v:code', value: sendArgs.code }],
      );
    });
  }); // end of describe

  describe('sendEmail', () => {
    it('이메일 보내기', async () => {
      service.sendEmail('', '', [{ key: 'v:code', value: 'xxx' }]);
      const formSpy = jest.spyOn(FormData.prototype, 'append');
      expect(formSpy).toHaveBeenCalled();
      expect(got).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
    });
  });
}); // ? END OF first mail service
