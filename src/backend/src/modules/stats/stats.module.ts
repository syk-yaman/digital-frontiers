import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Dataset } from '../datasets/dataset.entity';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
    imports: [TypeOrmModule.forFeature([User, Dataset])],
    controllers: [StatsController],
    providers: [StatsService],
    exports: [StatsService],
})
export class StatsModule { }
