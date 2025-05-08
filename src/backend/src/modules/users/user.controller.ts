import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request, HttpStatus, HttpException } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import { Roles } from '../authentication/roles.decorator';
import { RolesGuard } from '../authentication/roles.guard';
import { SignUpDto } from './user.dto';
import { DatasetsService } from '../datasets/dataset.service';
import { User } from './user.entity';
import { JwtUserContextFactory } from '../authorisation/factories/jwt-user-context.factory';

// Define DTO for editing users
class EditUserDto {
    firstName?: string;
    lastName?: string;
    company?: string;
    email?: string;
    password?: string;
    isAdmin?: boolean;
    isActivated?: boolean;
}

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly datasetsService: DatasetsService,
        private readonly userContextFactory: JwtUserContextFactory
    ) { }

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

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: '[Admin] Create a new user' })
    @ApiResponse({ status: 201, description: 'User successfully created' })
    @ApiBody({ type: SignUpDto })
    async createUser(@Body() createUserDto: SignUpDto) {
        // Check if user already exists
        const existingUser = await this.usersService.findByEmail(createUserDto.email);
        if (existingUser) {
            throw new HttpException(
                'User with this email already exists',
                HttpStatus.CONFLICT
            );
        }

        // Create new user
        const newUser = new User();
        Object.assign(newUser, createUserDto);

        // Save the user
        return this.usersService.create(newUser);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: '[Admin] Update user details' })
    @ApiResponse({ status: 200, description: 'User successfully updated' })
    @ApiBody({ type: EditUserDto })
    async editUser(@Param('id') id: string, @Body() editUserDto: EditUserDto) {
        // Check if user exists
        const user = await this.usersService.findOne(id);
        if (!user) {
            throw new HttpException(
                'User not found',
                HttpStatus.NOT_FOUND
            );
        }

        // Update user details
        if (editUserDto.firstName) user.firstName = editUserDto.firstName;
        if (editUserDto.lastName) user.lastName = editUserDto.lastName;
        if (editUserDto.company) user.company = editUserDto.company;
        if (editUserDto.email) {
            // Check if email is already used by another user
            const existingUser = await this.usersService.findByEmail(editUserDto.email);
            if (existingUser && existingUser.id !== id) {
                throw new HttpException(
                    'Email is already in use by another user',
                    HttpStatus.CONFLICT
                );
            }
            user.email = editUserDto.email;
        }

        if (editUserDto.isAdmin !== undefined) user.isAdmin = editUserDto.isAdmin;
        if (editUserDto.isActivated !== undefined) user.isActivated = editUserDto.isActivated;

        // Handle password update separately
        if (editUserDto.password) {
            await this.usersService.updatePassword(id, editUserDto.password);
        }

        // Save other changes
        return this.usersService.save(user);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: '[Admin] Delete user and transfer datasets to admin' })
    @ApiResponse({ status: 200, description: 'User successfully deleted and datasets transferred' })
    async deleteUser(@Param('id') id: string, @Request() req) {
        // Check if user exists
        const user = await this.usersService.findOne(id);
        if (!user) {
            throw new HttpException(
                'User not found',
                HttpStatus.NOT_FOUND
            );
        }

        // Transfer user's datasets to the admin (person making the request)
        const adminId = req.user.userId;
        await this.usersService.transferDatasetsAndDelete(id, adminId);

        return { message: 'User deleted successfully and datasets transferred to admin' };
    }

    @Get(':id/datasets')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: '[Admin] Get all datasets belonging to a user' })
    @ApiResponse({ status: 200, description: 'Retrieved datasets for user' })
    async getUserDatasets(@Param('id') id: string, @Request() req) {
        // Check if user exists
        const user = await this.usersService.findOne(id);
        if (!user) {
            throw new HttpException(
                'User not found',
                HttpStatus.NOT_FOUND
            );
        }

        // Create user context from the request
        const userContext = this.userContextFactory.createFromRequest(req);

        // Get user's datasets
        return this.datasetsService.findByUser(id);
    }
}
