import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { TagsService } from './tags.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CreateDatasetTagDto, UpdateDatasetTagDto } from './tags.dto';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import { Roles } from '../authentication/roles.decorator';
import { RolesGuard } from '../authentication/roles.guard';
import { JwtUserContextFactory } from '../authorisation/factories/jwt-user-context.factory';

@ApiTags('Dataset Tags')
@Controller('tags')
export class TagsController {
    constructor(
        private readonly tagsService: TagsService,
        private readonly userContextFactory: JwtUserContextFactory
    ) { }

    //Returns only public results 
    @Get()
    @ApiOperation({ summary: 'List all tags' })
    @ApiResponse({ status: 200, description: 'Returns a list of all tags.' })
    async findAll(@Request() req) {
        return this.tagsService.findAll();
    }

    //Returns only public results 
    @Get('search') //TODO: discuss lowercase and other potential inputs..
    @ApiOperation({ summary: 'Search tags by name' })
    @ApiQuery({ name: 'name', required: true, description: 'The name of the tag to search for.' })
    @ApiResponse({ status: 200, description: 'Returns tags matching the search criteria.' })
    search(@Query('name') name: string) {
        return this.tagsService.search(name);
    }

    //Returns only public results 
    @Get('top')
    @ApiOperation({ summary: 'Get the last 5 created tags' })
    @ApiResponse({ status: 200, description: 'Returns the last 5 most recently created tags.' })
    getTopTags() {
        return this.tagsService.getTopTags();
    }

    //Returns public and user-aware results 
    @Get(':id') //TODO: discuss if it doesn't exist
    @ApiOperation({ summary: 'Get a single tag by ID' })
    @ApiResponse({ status: 200, description: 'Returns the tag with the specified ID.' })
    async findOne(@Param('id') id: number, @Request() req) {
        const userContext = req.user ?
            this.userContextFactory.createFromRequest(req) :
            this.userContextFactory.createPublicContext();

        return this.tagsService.findOne(id, userContext);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new tag' })
    @ApiResponse({ status: 201, description: 'The tag has been successfully created.' })
    @ApiBody({ type: CreateDatasetTagDto })
    async create(@Body() createTagDto: CreateDatasetTagDto, @Request() req) {
        const userContext = this.userContextFactory.createFromRequest(req);
        return this.tagsService.create(createTagDto, userContext);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update an existing tag' })
    @ApiResponse({ status: 200, description: 'The tag has been successfully updated.' })
    @ApiBody({ type: UpdateDatasetTagDto })
    update(@Param('id') id: number, @Body() updateTagDto: UpdateDatasetTagDto) {
        return this.tagsService.update(id, updateTagDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a tag' })
    @ApiResponse({ status: 200, description: 'The tag has been successfully deleted.' })
    remove(@Param('id') id: number) {
        return this.tagsService.remove(id);
    }
}