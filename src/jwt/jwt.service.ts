import { Inject, Injectable } from '@nestjs/common';

import { JwtModuleOptions } from './jwt.interfaces';
import * as jwt from 'jsonwebtoken';
import { CONFIG_OPTIONS } from 'src/common/common.const';

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions,
  ) {
    console.log(options);
  }

  sign(userID: number): string {
    // console.log('hello');
    console.log(`jwt Sign : ${userID}`);
    return jwt.sign({ id: userID }, this.options.privateKey);
  }

  verify(token: string): string | object {
    return jwt.verify(token, this.options.privateKey);
  }
}
