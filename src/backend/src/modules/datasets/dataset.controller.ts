import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request, UploadedFiles, UseInterceptors, HttpException, HttpStatus } from '@nestjs/common';
import { DatasetsService } from './dataset.service';
import { CreateDatasetDto, UpdateDatasetDto } from './dataset.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import mqtt from 'mqtt';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import { Roles } from '../authentication/roles.decorator';
import { RolesGuard } from '../authentication/roles.guard';
import { JwtUserContextFactory } from '../authorisation/factories/jwt-user-context.factory';
import { OptionalJwtAuthGuard } from '../authentication/optional-jwt-auth.guard';

interface MqttConnectionDto {
    mqttAddress: string;
    mqttPort: number;
    mqttTopic: string;
    mqttUsername?: string;
    mqttPassword?: string;
}

@Controller('datasets')
export class DatasetsController {

    constructor(
        private readonly datasetsService: DatasetsService,
        private readonly userContextFactory: JwtUserContextFactory
    ) { }

    //Returns only public results 
    @Get()
    async findAll(@Request() req) {
        return this.datasetsService.findAll();
    }

    //Returns only public results 
    @Get('recent')
    findRecent() {
        return this.datasetsService.findRecent();
    }

    @Get('requests')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    findPendingApproval(@Request() req) {
        const userContext = this.userContextFactory.createFromRequest(req);
        return this.datasetsService.findPendingApproval(userContext);
    }

    //Returns public and user-aware results 
    @Get(':id')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiOperation({
        summary: 'Get dataset by ID',
        description: 'Public endpoint that returns different data based on authentication status'
    })
    async findOne(@Param('id') id: number, @Request() req) {
        const userContext = req.user ?
            this.userContextFactory.createFromRequest(req) :
            this.userContextFactory.createPublicContext();

        return this.datasetsService.findOne(id, userContext);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiBearerAuth()
    async create(@Body() createDto: CreateDatasetDto, @Request() req) {
        const userContext = this.userContextFactory.createFromRequest(req);
        createDto.userId = req.user.userId;
        return this.datasetsService.create(createDto, userContext);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    @ApiBearerAuth()
    update(@Param('id') id: number, @Body() updateDto: UpdateDatasetDto, @Request() req) {
        const currentUserId = req.user.userId;
        return this.datasetsService.update(id, updateDto, currentUserId);
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

    //Returns user-aware results 
    @UseGuards(JwtAuthGuard)
    @Get('search/me')
    @ApiBearerAuth()
    findMyDatasets(@Request() req) {
        const userId = req.user.userId;
        return this.datasetsService.findByUser(userId);
    }

    @Put(':id/approve')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    async approveDataset(@Param('id') id: number, @Request() req) {
        const userContext = this.userContextFactory.createFromRequest(req);
        return this.datasetsService.approveDataset(id, userContext);
    }

    @Put(':id/deny')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    denyDataset(@Param('id') id: number) {
        return this.datasetsService.denyDataset(id);
    }

    //Returns only public results 
    @Get('search/tag/:tagId')
    findByTagId(@Param('tagId') tagId: number) {
        return this.datasetsService.findByTagId(tagId);
    }
}
