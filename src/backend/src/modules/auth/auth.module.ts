import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy'; // Ensure this path is correct
import { LocalStrategy } from './local.strategy';

@Module({
    imports: [
        forwardRef(() => UsersModule), // Use forwardRef to resolve circular dependency
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'defaultSecret', // Use environment variable for production
            signOptions: { expiresIn: '1h' },
        }),
    ],
    providers: [AuthService, JwtStrategy, LocalStrategy], // Add LocalStrategy
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { }
