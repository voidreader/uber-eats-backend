import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { findBreakingChanges } from 'graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Resolver((of) => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query((returns) => Boolean)
  hi() {
    console.log('hi');
    return true;
  }

  @Query((returns) => User)
  // @UseGuards(AuthGuard)
  findMe(@AuthUser() authUser: User) {
    // console.log('context USER ::: ', context.user);

    return authUser;

    // if (context.user) {
    //   const user: User = context.user;

    //   return user;

    //   //return true;
    // } else return null;

    // if (!context.user) {
    //   return;
    // } else {
    //   console.log('user exists');
    //   return context.user;
    // }

    // if(context.user && typeof context.user === 'User')
  }

  @Mutation((returns) => CreateAccountOutput)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    try {
      const [ok, error] = await this.usersService.createAccount(
        createAccountInput,
      );

      return {
        ok,
        error,
      };
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error,
      };
    }
  } // ? END createAccount

  @Mutation((returns) => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    try {
      const { ok, error, token } = await this.usersService.login(loginInput);
      return { ok, error, token };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  } // ? END OF loginInput
}
