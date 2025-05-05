import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorisationService } from './authorisation.service';
import { JwtUserContextFactory } from './factories/jwt-user-context.factory';
import { User } from '../users/user.entity';
import { DatasetAuthorisationService } from './domain/dataset-authorisation.service';
import { TagAuthorisationService } from './domain/tag-authorisation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
  ],
  providers: [
    AuthorisationService,
    JwtUserContextFactory,
    DatasetAuthorisationService,
    TagAuthorisationService
  ],
  exports: [
    AuthorisationService,
    JwtUserContextFactory,
    DatasetAuthorisationService,
    TagAuthorisationService
  ]
})
export class AuthorisationModule { }