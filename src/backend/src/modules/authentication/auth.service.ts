import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.usersService.findByEmailWithPassword(email);
        if (user && (await bcrypt.compare(password, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, isAdmin: user.isAdmin };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async signUp(userDto: any) {
        const existingUser = await this.usersService.findByEmail(userDto.email);
        if (existingUser) {
            throw new UnauthorizedException('User already exists');
        }
        return this.usersService.create(userDto);
    }
}
