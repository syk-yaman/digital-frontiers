import { IsNotEmpty, IsOptional, IsUUID, IsDateString, IsEmail, IsString } from 'class-validator';

export class CreateAccessRequestDto {
    @IsNotEmpty()
    @IsUUID()
    datasetId!: number;

    @IsNotEmpty()
    @IsString()
    jobTitle!: string;

    @IsNotEmpty()
    @IsString()
    company!: string;

    @IsNotEmpty()
    @IsEmail()
    contactEmail!: string;

    @IsOptional()
    @IsString()
    department?: string;

    @IsNotEmpty()
    @IsString()
    projectDescription!: string;

    @IsNotEmpty()
    @IsString()
    usageDetails!: string;

    @IsOptional()
    @IsDateString()
    endTime?: string; // ISO 8601 format
}

export class ApproveAccessRequestDto {
    @IsOptional()
    @IsDateString()
    accessEndDate?: string; // ISO 8601 format
}

