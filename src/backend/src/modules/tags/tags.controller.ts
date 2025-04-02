import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { TagsService } from './tags.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';
import { CreateDatasetTagDto, UpdateDatasetTagDto } from './tags.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Dataset Tags')
@ApiExtraModels(CreateDatasetTagDto, UpdateDatasetTagDto) // Register DTOs for Swagger
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
    @ApiOperation({ summary: 'Create a new tag' })
    @ApiResponse({ status: 201, description: 'The tag has been successfully created.' })
    @ApiBody({
        description: 'Payload for creating a new tag',
        schema: { $ref: getSchemaPath(CreateDatasetTagDto) }, // Use DTO schema
    })
    create(@Body() createTagDto: CreateDatasetTagDto) {
        return this.tagsService.create(createTagDto);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Update an existing tag' })
    @ApiResponse({ status: 200, description: 'The tag has been successfully updated.' })
    @ApiBody({
        description: 'Payload for updating an existing tag',
        schema: { $ref: getSchemaPath(UpdateDatasetTagDto) }, // Use DTO schema
    })
    update(@Param('id') id: number, @Body() updateTagDto: UpdateDatasetTagDto) {
        return this.tagsService.update(id, updateTagDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
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