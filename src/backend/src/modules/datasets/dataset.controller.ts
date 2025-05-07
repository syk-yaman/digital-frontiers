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

    @ApiOperation({
        summary: '[Public] Get all datasets',
        description: `Public endpoint that returns only public, approved and non-controlled datasets.`
    })
    @Get()
    async findAll(@Request() req) {
        return this.datasetsService.findAll();
    }

    @ApiOperation({
        summary: '[Public] Get recent datasets',
        description: `Public endpoint that returns recent datasets: only public, approved and non-controlled.`
    })
    @Get('recent')
    findRecent() {
        return this.datasetsService.findRecent();
    }

    @ApiOperation({
        summary: '[Admin] Get pending approval datasets',
        description: `Admin endpoint that returns datasets pending approval.`
    })
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
        summary: '[User-aware] Get dataset by ID',
        description: `Public endpoint that returns different data based on
         authentication status. i.e. if user is admin, he can get info about
        controlled and unapproved datasets.`
    })
    async findOne(@Param('id') id: number, @Request() req) {
        const userContext = req.user ?
            this.userContextFactory.createFromRequest(req) :
            this.userContextFactory.createPublicContext();

        return this.datasetsService.findOne(id, userContext);
    }

    @ApiOperation({
        summary: '[User-aware] Create a dataset',
        description: `Authenticated endpoint that creates a dataset. If used be admin, it will be auto-approved.`
    })
    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiBearerAuth()
    async create(@Body() createDto: CreateDatasetDto, @Request() req) {
        const userContext = this.userContextFactory.createFromRequest(req);
        createDto.userId = req.user.userId;
        return this.datasetsService.create(createDto, userContext);
    }

    @ApiOperation({
        summary: '[User-aware] Edit a dataset',
        description: `Authenticated endpoint that edits a dataset. 
        Admin can used it to modify controlled, approved and not-approved datasets.`
    })
    @UseGuards(JwtAuthGuard)
    @Put(':id')
    @ApiBearerAuth()
    update(@Param('id') id: number, @Body() updateDto: UpdateDatasetDto, @Request() req) {
        const currentUserId = req.user.userId;
        return this.datasetsService.update(id, updateDto, currentUserId);
    }

    @ApiOperation({
        summary: '[User-aware] Delete a dataset',
        description: `Authenticated endpoint that deletes a dataset.
         User can use it to delete his own datasets.
         Admin can used it to delete and dataset (controlled, approved and not-approved).`
    })
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    remove(@Param('id') id: number) {
        return this.datasetsService.remove(id);
    }

    @ApiOperation({
        summary: 'Upload a hero image for a dataset',
        description: `Authenticated endpoint that uploads a hero image for a dataset.`
    })
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

    @ApiOperation({
        summary: 'Verfiy mqtt connection for a dataset',
        description: `Authenticated endpoint that verifies mqtt connection for a dataset.`
    })
    @UseGuards(JwtAuthGuard)
    @Post('/mqtt/verify')
    @ApiBearerAuth()
    verifyMqttConnection(@Body() connectionDto: MqttConnectionDto): Promise<void> {
        const { mqttAddress, mqttPort, mqttTopic, mqttUsername, mqttPassword } = connectionDto;
        return this.datasetsService.verifyMqttConnection(mqttAddress, mqttPort, mqttTopic, mqttUsername, mqttPassword);
    }

    @ApiOperation({
        summary: 'Get my datasets',
        description: `Authenticated endpoint that returns datasets created by the user.`
    })
    @UseGuards(JwtAuthGuard)
    @Get('search/me')
    @ApiBearerAuth()
    findMyDatasets(@Request() req) {
        const userId = req.user.userId;
        return this.datasetsService.findByUser(userId);
    }

    @ApiOperation({
        summary: '[Admin] Approve a dataset',
        description: `Authenticated endpoint that admin can use to approve a dataset.`
    })
    @Put(':id/approve')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    async approveDataset(@Param('id') id: number, @Request() req) {
        const userContext = this.userContextFactory.createFromRequest(req);
        return this.datasetsService.approveDataset(id, userContext);
    }

    @ApiOperation({
        summary: '[Admin] Deny a dataset',
        description: `Authenticated endpoint that admin can use to deny a dataset.`
    })
    @Put(':id/deny')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    denyDataset(@Param('id') id: number) {
        return this.datasetsService.denyDataset(id);
    }

    @ApiOperation({
        summary: '[Public] Get datasets by tag ID',
        description: `Public endpoint that returns datasets having a specific tag.`
    })
    @Get('search/tag/:tagId')
    findByTagId(@Param('tagId') tagId: number) {
        return this.datasetsService.findByTagId(tagId);
    }
}
