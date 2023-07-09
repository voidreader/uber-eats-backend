import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { User } from 'src/users/entities/user.entity';
import { AllowedRoles } from './role.decorator';

// metadata가 설정되어있다 => resolver가 public이 되면 안된다.
// metadata가 설정되어 있지 않으면, 예컨데, user authentication을 신경쓰지 않는다는 뜻이다.

// 메타데이터를 설정한다는 뜻은 우리가 Authentication을 고려한다는 뜻이다.
// 메타데이터를 얻기 위해서는 reflector class를 get 해야한다.

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // request의 context와 graphql의 context가 서로 다르다.
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );

    if (!roles) {
      return true;
    }
    // metadata가 있으면 user가 있다고 기대한다.

    // graphql 에서는 @Arg()로 input을 받기 때문에 input 값이 Context에 저장되어있다.
    // context에서 input값을 꺼내오는 과정이 필요하다.

    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user: User = gqlContext['user'];

    if (!user) {
      return false;
    }

    // Any는 User만 존재하면 된다.
    if (roles.includes('Any')) {
      return true;
    }

    return roles.includes(user.role);
  }
}
