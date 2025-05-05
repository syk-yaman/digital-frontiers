import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorisationService } from './authorisation.service';
import { JwtUserContextFactory } from './factories/jwt-user-context.factory';
import { User } from '../users/user.entity';
import { DatasetAuthorizationService } from './domain/dataset-authorization.service';
import { TagAuthorizationService } from './domain/tag-authorization.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
  ],
  providers: [
    AuthorisationService,
    JwtUserContextFactory,
    DatasetAuthorizationService,
    TagAuthorizationService
  ],
  exports: [
    AuthorisationService,
    JwtUserContextFactory,
    DatasetAuthorizationService,
    TagAuthorizationService
  ]
})
export class AuthorisationModule {}