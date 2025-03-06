import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { DatasetsService } from './dataset.service';
import { CreateDatasetDto, UpdateDatasetDto } from './dataset.dto';
//import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('datasets')
export class DatasetsController {
    constructor(private readonly datasetsService: DatasetsService) { }

    @Get()
    findAll() {
        return this.datasetsService.findAll();
    }

    @Get('recent')
    findRecent() {
        return this.datasetsService.findRecent();
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.datasetsService.findOne(id);
    }

    //@UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() createDto: CreateDatasetDto) {
        return this.datasetsService.create(createDto);
    }

    //@UseGuards(JwtAuthGuard, AdminGuard)
    @Put(':id')
    update(@Param('id') id: number, @Body() updateDto: UpdateDatasetDto) {
        return this.datasetsService.update(id, updateDto);
    }

    //@UseGuards(JwtAuthGuard, AdminGuard)
    @Delete(':id')
    remove(@Param('id') id: number) {
        return this.datasetsService.remove(id);
    }
}
