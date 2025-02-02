import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly demoService: UsersService) { }

    @Get()
    async findAll() {
        return this.demoService.findAll();
    }
}
