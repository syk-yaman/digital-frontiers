import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dataset, DatasetTag } from './dataset.entity';
import { DatasetsController } from './dataset.controller';
import { DatasetsService } from './dataset.service';
import { User } from '../users/user.entity';
import { AuthorisationModule } from '../authorisation/authorisation.module';
import { TagsModule } from '../tags/tags.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Dataset, DatasetTag, User]),
        AuthorisationModule,
        TagsModule
    ],
    providers: [DatasetsService],
    controllers: [DatasetsController],
    exports: [DatasetsService]
})
export class DatasetsModule { }