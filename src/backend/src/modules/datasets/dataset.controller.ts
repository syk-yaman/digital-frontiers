import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request, UploadedFiles, UseInterceptors, HttpException, HttpStatus } from '@nestjs/common';
import { DatasetsService } from './dataset.service';
import { CreateDatasetDto, UpdateDatasetDto } from './dataset.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import mqtt from 'mqtt';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

interface MqttConnectionDto {
    mqttAddress: string;
    mqttPort: number;
    mqttTopic: string;
    mqttUsername?: string;
    mqttPassword?: string;
}

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

    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiBearerAuth()
    create(@Body() createDto: CreateDatasetDto, @Request() req) {
        const userId = req.user.userId;
        createDto.userId = userId;
        return this.datasetsService.create(createDto); // Pass the user ID to the service
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    @ApiBearerAuth()
    update(@Param('id') id: number, @Body() updateDto: UpdateDatasetDto) {
        return this.datasetsService.update(id, updateDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    remove(@Param('id') id: number) {
        return this.datasetsService.remove(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('uploadHeroImages')
    @ApiBearerAuth()
    @UseInterceptors(
        FilesInterceptor('files', 20, {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
                    callback(null, filename);
                },
            }),
            fileFilter: (req, file, callback) => {
                if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                    return callback(new Error('Only image files are allowed!'), false);
                }
                callback(null, true);
            },
        }),
    )
    uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
        const fileNames = files.map((file) => file.filename);
        return fileNames;
    }

    @UseGuards(JwtAuthGuard)
    @Post('/mqtt/verify')
    @ApiBearerAuth()
    verifyMqttConnection(@Body() connectionDto: MqttConnectionDto): Promise<void> {
        const { mqttAddress, mqttPort, mqttTopic, mqttUsername, mqttPassword } = connectionDto;
        return this.datasetsService.verifyMqttConnection(mqttAddress, mqttPort, mqttTopic, mqttUsername, mqttPassword);
    }
}
