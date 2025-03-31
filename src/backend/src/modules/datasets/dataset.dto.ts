import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DatasetType, UpdateFrequencyUnit } from './dataset.entity';

class DatasetLinkDto {
    @IsString() title!: string;
    @IsString() url!: string;
}

class DatasetLocationDto {
    @IsNumber() lon!: number;
    @IsNumber() lat!: number;
}

class DatasetSliderImageDto {
    @IsString() fileName!: string;
}

class DatasetTagDto {
    id?: number;
    @IsString() name!: string;
    @IsString() colour!: string;
    @IsString() icon: string;
}

export class CreateDatasetDto {
    @IsUUID() userId!: string;
    @IsString() name!: string;
    @IsString() dataOwner!: string;
    @IsString() pointOfContactName!: string;
    @IsString() pointOfContactEmail!: string;
    @IsString() pointOfContactPhoto!: string;
    @IsEnum(DatasetType) datasetType!: DatasetType;
    @IsString() description!: string;
    @IsNumber() updateFrequency!: number;
    @IsEnum(UpdateFrequencyUnit) updateFrequencyUnit!: UpdateFrequencyUnit;
    @IsString() dataExample!: string;

    @ValidateNested({ each: true }) @Type(() => DatasetLinkDto) links!: DatasetLinkDto[];
    @ValidateNested({ each: true }) @Type(() => DatasetLocationDto) locations!: DatasetLocationDto[];
    @ValidateNested({ each: true }) @Type(() => DatasetSliderImageDto) sliderImages!: DatasetSliderImageDto[];
    @ValidateNested({ each: true }) @Type(() => DatasetTagDto) tags!: DatasetTagDto[];
}

export class UpdateDatasetDto extends CreateDatasetDto { }
