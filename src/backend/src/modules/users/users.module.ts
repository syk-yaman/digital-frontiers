import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './user.controller';
import { User } from './user.entity';
import { AuthorisationModule } from '../authorisation/authorisation.module';
import { DatasetsModule } from '../datasets/datasets.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        AuthorisationModule,
        DatasetsModule,
    ],
    providers: [
        UsersService
    ],
    controllers: [UsersController],
    exports: [UsersService]
})
export class UsersModule { }
