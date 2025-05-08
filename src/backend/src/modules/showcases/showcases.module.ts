import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Showcase, ShowcaseSliderImage, ShowcaseLocation } from './showcase.entity';
import { ShowcasesController } from './showcase.controller';
import { ShowcasesService } from './showcase.service';
import { User } from '../users/user.entity';
import { Dataset } from '../datasets/dataset.entity';
import { AuthorisationModule } from '../authorisation/authorisation.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Showcase, ShowcaseSliderImage, ShowcaseLocation, User, Dataset]),
        AuthorisationModule
    ],
    providers: [ShowcasesService],
    controllers: [ShowcasesController],
    exports: [ShowcasesService]
})
export class ShowcasesModule { }
