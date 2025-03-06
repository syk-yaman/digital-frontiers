import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './modules/users/user.entity';
import { UsersModule } from './modules/users/users.module';
import { AppDataSource } from '../data-source';
import { DatasetsModule } from './modules/datasets/datasets.module';
import { Dataset, DatasetLink, DatasetLocation, DatasetSliderImage, DatasetTag } from './modules/datasets/dataset.entity';

@Module({
  //imports: [TypeOrmModule.forRoot(AppDataSource.options)],
  imports: [TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'DigitalFrontiersDB',
    entities: [User, Dataset, DatasetLink, DatasetLocation, DatasetSliderImage, DatasetTag],
    synchronize: false, //to be off in production
    migrations: ['src/database/migrations/*-migration.ts'],
    migrationsTableName: '_migrations',
  }),
    UsersModule,
    DatasetsModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
