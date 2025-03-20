import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { DatasetsService } from './dataset.service';
import { CreateDatasetDto, UpdateDatasetDto } from './dataset.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
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

    @Post('uploadHeroImages')
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
}
