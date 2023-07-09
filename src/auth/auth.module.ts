import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';

@Module({
  providers: [
    {
      provide: APP_GUARD, // APP_GUARD 를 사용해서 AuthGuard가 모든 곳에서 작동하도록 처리.
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}
