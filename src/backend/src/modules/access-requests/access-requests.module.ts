import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessRequest } from './access-request.entity';
import { AccessRequestService } from './access-request.service';
import { AccessRequestController } from './access-request.controller';
import { AuthorisationModule } from '../authorisation/authorisation.module';

@Module({
    imports: [TypeOrmModule.forFeature([AccessRequest]), AuthorisationModule],
    providers: [AccessRequestService],
    controllers: [AccessRequestController],
    exports: [AccessRequestService, TypeOrmModule], // Export TypeOrmModule to provide AccessRequestRepository
})
export class AccessRequestsModule { }
