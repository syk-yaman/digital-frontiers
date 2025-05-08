import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { TagsService } from './tags.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CreateDatasetTagDto, UpdateDatasetTagDto } from './tags.dto';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import { Roles } from '../authentication/roles.decorator';
import { RolesGuard } from '../authentication/roles.guard';
import { JwtUserContextFactory } from '../authorisation/factories/jwt-user-context.factory';
import { OptionalJwtAuthGuard } from '../authentication/optional-jwt-auth.guard';

@ApiTags('Dataset Tags')
@Controller('tags')
export class TagsController {
    constructor(
        private readonly tagsService: TagsService,
        private readonly userContextFactory: JwtUserContextFactory
    ) { }

    @Get()
    @ApiOperation({ summary: '[Public] List all tags' })
    @ApiResponse({ status: 200, description: 'Returns a list of all tags.' })
    async findAll(@Request() req) {
        return this.tagsService.findAll();
    }

    @ApiOperation({
        summary: '[Admin] Get pending approval tags',
        description: `Admin endpoint that returns tags pending approval.`
    })
    @Get('requests')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    findPendingApproval(@Request() req) {
        const userContext = this.userContextFactory.createFromRequest(req);
        return this.tagsService.findPendingApproval(userContext);
    }

    @Get('search') //TODO: discuss lowercase and other potential inputs..
    @ApiOperation({ summary: '[Public] Search tags by name' })
    @ApiQuery({ name: 'name', required: true, description: 'The name of the tag to search for.' })
    @ApiResponse({ status: 200, description: 'Returns tags matching the search criteria.' })
    search(@Query('name') name: string) {
        return this.tagsService.search(name);
    }

    @Get('navbar')
    @ApiOperation({ summary: '[Public] Get the navbar tags in order' })
    @ApiResponse({ status: 200, description: 'Returns the selected navbar tags by admin.' })
    getTopTags() {
        return this.tagsService.getNavbarTags();
    }

    @Get(':id')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiOperation({ summary: '[Public, User, Admin] Get a single tag by ID' })
    @ApiResponse({ status: 200, description: 'Returns the tag with the specified ID.' })
    async findOne(@Param('id') id: number, @Request() req) {
        const userContext = req.user ?
            this.userContextFactory.createFromRequest(req) :
            this.userContextFactory.createPublicContext();

        return this.tagsService.findOne(id, userContext);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: '[Admin] Create a new tag' })
    @ApiResponse({ status: 201, description: 'The tag has been successfully created.' })
    @ApiBody({ type: CreateDatasetTagDto })
    async create(@Body() createTagDto: CreateDatasetTagDto, @Request() req) {
        const userContext = this.userContextFactory.createFromRequest(req);
        return this.tagsService.create(createTagDto, userContext);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: '[Admin] Update an existing tag' })
    @ApiResponse({ status: 200, description: 'The tag has been successfully updated.' })
    @ApiBody({ type: UpdateDatasetTagDto })
    update(@Param('id') id: number, @Body() updateTagDto: UpdateDatasetTagDto) {
        return this.tagsService.update(id, updateTagDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: '[Admin] Delete a tag' })
    @ApiResponse({ status: 200, description: 'The tag has been successfully deleted.' })
    remove(@Param('id') id: number) {
        return this.tagsService.remove(id);
    }

    @ApiOperation({
        summary: '[Admin] Approve a tag',
        description: `Authenticated endpoint that admin can use to approve a tag.`
    })
    @Put(':id/approve')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    async approveDataset(@Param('id') id: number, @Request() req) {
        const userContext = this.userContextFactory.createFromRequest(req);
        return this.tagsService.approveTag(id, userContext);
    }
}