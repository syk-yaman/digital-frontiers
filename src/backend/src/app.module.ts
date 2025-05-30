import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './modules/users/user.entity';
import { UsersModule } from './modules/users/users.module';
import { DatasetsModule } from './modules/datasets/datasets.module';
import { Dataset, DatasetLink, DatasetLocation, DatasetSliderImage, DatasetTag } from './modules/datasets/dataset.entity';
import { TagsModule } from './modules/tags/tags.module';
import { AuthModule } from './modules/authentication/auth.module';
import { AuthorisationModule } from './modules/authorisation/authorisation.module';
import { ShowcasesModule } from './modules/showcases/showcases.module';
import { Showcase, ShowcaseLocation, ShowcaseSliderImage } from './modules/showcases/showcase.entity';
import { AccessRequestsModule } from './modules/access-requests/access-requests.module';
import { AccessRequest } from './modules/access-requests/access-request.entity';
import { StatsModule } from './modules/stats/stats.module';
import { SettingsModule } from './modules/settings/settings.module';
import { Setting } from './modules/settings/settings.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [
        User,
        Dataset, DatasetLink, DatasetLocation, DatasetSliderImage, DatasetTag,
        Showcase, ShowcaseSliderImage, ShowcaseLocation,
        AccessRequest, Setting
      ],
      synchronize: false, //to be off in production
      migrations: ['src/database/migrations/*-migration.ts'],
      migrationsTableName: '_migrations',
    }),
    UsersModule,
    DatasetsModule,
    TagsModule,
    AuthModule,
    AuthorisationModule,
    ShowcasesModule,
    AccessRequestsModule,
    SettingsModule,
    StatsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
