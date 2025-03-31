import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatasetTag } from '../datasets/dataset.entity';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';

@Module({
    imports: [TypeOrmModule.forFeature([DatasetTag])],
    controllers: [TagsController],
    providers: [TagsService],
})
export class TagsModule { }
