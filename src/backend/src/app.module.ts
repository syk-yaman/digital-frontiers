import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './modules/users/user.entity';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost',
    port: Number(5432),
    username: 'postgres',
    password: 'postgres',
    database: 'DigitalFrontiersDB',
    entities: [User],
    synchronize: true, //to be off in production
  }), UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
