import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Get all users' })
    async findAll() {
        return this.usersService.findAll();
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get the current signed-in user' })
    async getMe(@Request() req) {
        return req.user;
    }
}
