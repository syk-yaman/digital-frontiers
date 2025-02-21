import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './modules/users/user.entity';
import { UsersModule } from './modules/users/users.module';
import { AppDataSource } from '../data-source';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'DigitalFrontiersDB',
    entities: [User],
    synchronize: false, //to be off in production
    migrations: ['src/database/migrations/*-migration.ts'],
    migrationsTableName: '_migrations',
  }), UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
