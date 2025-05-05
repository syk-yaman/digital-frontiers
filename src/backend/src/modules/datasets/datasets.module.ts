import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dataset, DatasetTag } from './dataset.entity'; // Import DatasetTag
import { DatasetsController } from './dataset.controller';
import { DatasetsService } from './dataset.service';
import { User } from '../users/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Dataset, DatasetTag, User])], // Add DatasetTag
    providers: [DatasetsService],
    controllers: [DatasetsController],
})
export class DatasetsModule { } 
