import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dataset, DatasetTag } from './dataset.entity'; // Import DatasetTag
import { DatasetsController } from './dataset.controller';
import { DatasetsService } from './dataset.service';

@Module({
    imports: [TypeOrmModule.forFeature([Dataset, DatasetTag])], // Add DatasetTag
    providers: [DatasetsService],
    controllers: [DatasetsController],
})
export class DatasetsModule { }
