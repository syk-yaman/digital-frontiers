import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dataset } from './dataset.entity';
import { DatasetsController } from './dataset.controller';
import { DatasetsService } from './dataset.service';

@Module({
    imports: [TypeOrmModule.forFeature([Dataset])],
    providers: [DatasetsService],
    controllers: [DatasetsController],
})
export class DatasetsModule { }
