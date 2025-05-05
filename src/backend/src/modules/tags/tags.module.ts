import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatasetTag } from '../datasets/dataset.entity';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { AuthorisationModule } from '../authorisation/authorisation.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([DatasetTag]),
        AuthorisationModule
    ],
    controllers: [TagsController],
    providers: [TagsService],
    exports: [TagsService]
})
export class TagsModule { }
