import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorisationService } from './authorisation.service';
import { JwtUserContextFactory } from './factories/jwt-user-context.factory';
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
  ],
  providers: [
    AuthorisationService,
    JwtUserContextFactory,
  ],
  exports: [
    AuthorisationService,
    JwtUserContextFactory,
  ]
})
export class AuthorisationModule { }