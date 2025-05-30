import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import { Roles } from '../authentication/roles.decorator';
import { RolesGuard } from '../authentication/roles.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Stats')
@Controller('stats')
export class StatsController {
    constructor(private readonly statsService: StatsService) { }
    @ApiBearerAuth()
    @Get('admin-home')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    async getAdminHomeStats() {
        return this.statsService.getAdminHomeStats();
    }
}
