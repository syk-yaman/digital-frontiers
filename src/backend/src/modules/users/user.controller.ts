import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import { Roles } from '../authentication/roles.decorator';
import { RolesGuard } from '../authentication/roles.guard';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: '[Admin] Get all users' })
    async findAll() {
        return this.usersService.findAll();
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: '[User] Get the current signed-in user' })
    async getMe(@Request() req) {
        return this.usersService.findOne(req.user.userId);
    }
}
