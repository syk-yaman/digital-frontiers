import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { TagsService } from './tags.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CreateDatasetTagDto, UpdateDatasetTagDto } from './tags.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Dataset Tags')
@Controller('tags')
export class TagsController {
    constructor(private readonly tagsService: TagsService) { }

    @Get()
    @ApiOperation({ summary: 'List all tags' })
    @ApiResponse({ status: 200, description: 'Returns a list of all tags.' })
    findAll() {
        return this.tagsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single tag by ID' })
    @ApiResponse({ status: 200, description: 'Returns the tag with the specified ID.' })
    findOne(@Param('id') id: number) {
        return this.tagsService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new tag' })
    @ApiResponse({ status: 201, description: 'The tag has been successfully created.' })
    @ApiBody({ type: CreateDatasetTagDto })
    create(@Body() createTagDto: CreateDatasetTagDto) {
        return this.tagsService.create(createTagDto);
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

    @Get('search')
    @ApiOperation({ summary: 'Search tags by name' })
    @ApiQuery({ name: 'name', required: true, description: 'The name of the tag to search for.' })
    @ApiResponse({ status: 200, description: 'Returns tags matching the search criteria.' })
    search(@Query('name') name: string) {
        return this.tagsService.search(name);
    }
}