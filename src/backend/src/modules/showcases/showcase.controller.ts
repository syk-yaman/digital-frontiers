import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request, UseInterceptors, UploadedFiles, HttpException, HttpStatus } from '@nestjs/common';
import { ShowcasesService } from './showcase.service';
import { CreateShowcaseDto, UpdateShowcaseDto } from './showcase.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import { Roles } from '../authentication/roles.decorator';
import { RolesGuard } from '../authentication/roles.guard';
import { OptionalJwtAuthGuard } from '../authentication/optional-jwt-auth.guard';
import { JwtUserContextFactory } from '../authorisation/factories/jwt-user-context.factory';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Permission } from '../authorisation/enums/permissions.enum';

@ApiTags('Showcases')
@Controller('showcases')
export class ShowcasesController {
    constructor(
        private readonly showcasesService: ShowcasesService,
        private readonly userContextFactory: JwtUserContextFactory
    ) { }

    @Get()
    @ApiOperation({ summary: '[Public] Get all approved showcases' })
    @ApiResponse({ status: 200, description: 'Returns all approved showcases' })
    async findAll() {
        return this.showcasesService.findAll();
    }

    @Get('requests')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: '[Admin] Get pending approval showcases' })
    @ApiResponse({ status: 200, description: 'Returns showcases pending approval' })
    async findPendingApproval(@Request() req) {
        const userContext = this.userContextFactory.createFromRequest(req);
        return this.showcasesService.findPendingApproval(userContext);
    }

    @Get(':id')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiOperation({ summary: '[Public, User, Admin] Get showcase by ID' })
    @ApiResponse({ status: 200, description: 'Returns the showcase with the given ID' })
    async findOne(@Param('id') id: number, @Request() req) {
        const userContext = req.user ?
            this.userContextFactory.createFromRequest(req) :
            this.userContextFactory.createPublicContext();

        return this.showcasesService.findOne(id, userContext);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '[User, Admin] Create a new showcase' })
    @ApiResponse({ status: 201, description: 'The showcase has been created' })
    @ApiBody({ type: CreateShowcaseDto })
    async create(@Body() createDto: CreateShowcaseDto, @Request() req) {
        const userContext = this.userContextFactory.createFromRequest(req);
        createDto.userId = userContext.userId;
        return this.showcasesService.create(createDto, userContext);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '[User, Admin] Update an existing showcase' })
    @ApiResponse({ status: 200, description: 'The showcase has been updated' })
    @ApiBody({ type: UpdateShowcaseDto })
    async update(@Param('id') id: number, @Body() updateDto: UpdateShowcaseDto, @Request() req) {
        const userContext = this.userContextFactory.createFromRequest(req);
        return this.showcasesService.update(id, updateDto, userContext);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '[User, Admin] Delete a showcase' })
    @ApiResponse({ status: 200, description: 'The showcase has been deleted' })
    async remove(@Param('id') id: number, @Request() req) {
        const userContext = this.userContextFactory.createFromRequest(req);
        return this.showcasesService.remove(id, userContext);
    }

    @Put(':id/approve')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: '[Admin] Approve a showcase' })
    @ApiResponse({ status: 200, description: 'The showcase has been approved' })
    async approveShowcase(@Param('id') id: number, @Request() req) {
        const userContext = this.userContextFactory.createFromRequest(req);
        return this.showcasesService.approveShowcase(id, userContext);
    }

    @Put(':id/deny')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: '[Admin] Deny a showcase' })
    @ApiResponse({ status: 200, description: 'The showcase has been denied' })
    async denyShowcase(@Param('id') id: number, @Request() req) {
        const userContext = this.userContextFactory.createFromRequest(req);
        return this.showcasesService.denyShowcase(id, userContext);
    }

    @Post('upload')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @UseInterceptors(
        FilesInterceptor('files', 10, {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    const filename = `showcase-${uniqueSuffix}${ext}`;
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
    @ApiOperation({ summary: '[User, Admin] Upload showcase images' })
    uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
        return files.map(file => file.filename);
    }

    @Get('user/:userId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '[User, Admin] Get showcases by user ID' })
    @ApiResponse({ status: 200, description: "Returns a user's showcases" })
    async findByUser(@Param('userId') userId: string, @Request() req) {
        const userContext = this.userContextFactory.createFromRequest(req);

        // Users can only see their own showcases, admins can see any user's showcases
        if (userId !== userContext.userId && !userContext.hasPermission(Permission.VIEW_ALL_UNAPPROVED_CONTENT)) {
            throw new HttpException('Not authorized to view this user\'s showcases', HttpStatus.FORBIDDEN);
        }

        return this.showcasesService.findByUser(userId);
    }
}
