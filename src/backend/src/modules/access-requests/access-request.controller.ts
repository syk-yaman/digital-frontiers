import { Controller, Post, Body, UseGuards, Request, Param, Delete, Get, Put, Logger } from '@nestjs/common';
import { AccessRequestService } from './access-request.service';
import { CreateAccessRequestDto, ApproveAccessRequestDto } from './access-request.dto';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import { RolesGuard } from '../authentication/roles.guard';
import { Roles } from '../authentication/roles.decorator';
import { UserContext } from '../authorisation/user-context';
import { JwtUserContextFactory } from '../authorisation/factories/jwt-user-context.factory';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('access-requests')
export class AccessRequestController {
    constructor(
        private readonly accessRequestService: AccessRequestService,
        private readonly userContextFactory: JwtUserContextFactory,
    ) { }

    @ApiBearerAuth()
    @Post()
    @UseGuards(JwtAuthGuard)
    async createAccessRequest(@Body() dto: CreateAccessRequestDto, @Request() req) {
        const userContext = await this.userContextFactory.createFromRequest(req);
        return this.accessRequestService.createAccessRequest(dto, userContext);
    }

    @ApiBearerAuth()
    @Put(':id/approve')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    async approveAccessRequest(@Param('id') id: number, @Body() dto: ApproveAccessRequestDto, @Request() req) {
        const userContext = await this.userContextFactory.createFromRequest(req);
        return this.accessRequestService.approveAccessRequest(id, dto, userContext);
    }

    @ApiBearerAuth()
    @Put(':id/deny')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    async denyAccessRequest(@Param('id') id: number, @Request() req) {
        const userContext = await this.userContextFactory.createFromRequest(req);
        return this.accessRequestService.denyAccessRequest(id, userContext);
    }

    @ApiBearerAuth()
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    async deleteAccessRequest(@Param('id') id: number, @Request() req) {
        const userContext = await this.userContextFactory.createFromRequest(req);
        return this.accessRequestService.deleteAccessRequest(id, userContext);
    }

    @ApiBearerAuth()
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    async getAllRequests() {
        return this.accessRequestService.getAllRequests();
    }

    @ApiBearerAuth()
    @Get('user/me')
    @UseGuards(JwtAuthGuard)
    async getMyRequests(@Request() req) {
        const userId = req.user.userId;
        return this.accessRequestService.getRequestsForUser(userId);
    }

    @ApiBearerAuth()
    @Get('user/:userId')
    @Roles('admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    async getRequestsForUser(@Param('userId') userId: string) {
        return this.accessRequestService.getRequestsForUser(userId);
    }

    @ApiBearerAuth()
    @Get('user/:userId/dataset/:datasetId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    async getRequestForUserAndDataset(@Param('userId') userId: string, @Param('datasetId') datasetId: number) {
        return this.accessRequestService.getRequestForUserAndDataset(userId, datasetId);
    }

    @ApiBearerAuth()
    @Get('dataset/:datasetId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    async getRequestsForDataset(@Param('datasetId') datasetId: number) {
        return this.accessRequestService.getRequestsForDataset(datasetId);
    }
}
