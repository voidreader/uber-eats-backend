import { Inject, Injectable, Post } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.const';
import { EmailVars, MailModuleOptions } from './mail.interface';
import got from 'got';
import * as FormData from 'form-data';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    console.log(options);
    // this.sendEmail(`testing`, 'test');
  }

  private async sendEmail(
    subject: string,
    template: string,
    emailVars: EmailVars[],
  ) {
    const form = new FormData();
    form.append(`from`, `Excited User <mailgun@${this.options.domain}>`);
    form.append(`to`, `loudsmile@naver.com`); // 여기는 유료다! 인증된 이메일만 고정으로 사용하도록 해놓고 서비스 시 변경.
    form.append(`subject`, subject);
    // form.append(`text`, content);
    form.append(`template`, template);
    // form.append(`v:code`, 'test-code');
    emailVars.forEach((item) => form.append(item.key, item.value));
    try {
      const response = await got(
        `https://api.mailgun.net/v3/${this.options.domain}/messages`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `api:${this.options.apiKey}`,
            ).toString('base64')}`,
          },
          method: 'POST',
          body: form,
        },
      );
    } catch (error) {
      console.log(error);
    }
  } // ? END endEmail

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail('Verify Your Email', 'verify-email', [
      { key: 'v:code', value: code },
    ]);
  }
}
