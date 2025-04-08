import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateNested, ValidateIf, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { DatasetType, UpdateFrequencyUnit } from './dataset.entity';
import { HttpException, HttpStatus } from '@nestjs/common'; // Import HttpException and HttpStatus

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
    @IsString() dataOwnerName!: string;
    @IsString() dataOwnerEmail!: string;
    @IsEnum(DatasetType) datasetType!: DatasetType;
    @IsOptional() @IsString() description?: string;

    @ValidateIf((o) => !o.mqttAddress) // Required if no MQTT info exists
    @IsNumber() updateFrequency!: number;

    @ValidateIf((o) => !o.mqttAddress) // Required if no MQTT info exists
    @IsEnum(UpdateFrequencyUnit) updateFrequencyUnit!: UpdateFrequencyUnit;

    @ValidateIf((o) => o.mqttAddress) // Required if MQTT info exists
    @IsString() mqttAddress?: string;

    @ValidateIf((o) => o.mqttAddress) // Required if MQTT info exists
    @IsNumber() mqttPort?: number;

    @ValidateIf((o) => o.mqttAddress) // Required if MQTT info exists
    @IsString() mqttTopic?: string;

    @ValidateIf((o) => o.mqttUsername || o.mqttPassword) // Both username and password must exist together
    @IsString() mqttUsername?: string;

    @ValidateIf((o) => o.mqttUsername || o.mqttPassword) // Both username and password must exist together
    @IsString() mqttPassword?: string;

    @IsOptional() @IsString() dataExample?: string;

    @ValidateNested({ each: true }) @Type(() => DatasetLinkDto) links!: DatasetLinkDto[];
    @ValidateNested({ each: true }) @Type(() => DatasetLocationDto) locations!: DatasetLocationDto[];
    @ValidateNested({ each: true }) @Type(() => DatasetSliderImageDto) sliderImages!: DatasetSliderImageDto[];

    @ValidateNested({ each: true }) @Type(() => DatasetTagDto) tags!: DatasetTagDto[];

    // Custom validation: Ensure at least one tag exists
    validateTags() {
        if (!this.tags || this.tags.length === 0) {
            throw new Error('At least one tag must be provided.');
        }
    }

    // Custom validation: Ensure MQTT data is valid
    validateMqttData() {
        if (this.updateFrequency != 0 && this.updateFrequencyUnit != UpdateFrequencyUnit.ONLY_ONCE) {
            if (!this.mqttAddress) {
                throw new HttpException(
                    'The update frequency is not set to "once", so MQTT data must be provided.',
                    HttpStatus.BAD_REQUEST,
                );
            }
            if (!this.mqttPort || !this.mqttTopic) {
                throw new HttpException(
                    'If MQTT data exists, address, port, and topic must be provided.',
                    HttpStatus.BAD_REQUEST,
                );
            }
            if ((this.mqttUsername && !this.mqttPassword) || (!this.mqttUsername && this.mqttPassword)) {
                throw new HttpException(
                    'If MQTT username or password is provided, both must be provided.',
                    HttpStatus.BAD_REQUEST,
                );
            }
        } else {
            // Nothing to do, maybe force the user to add links to static files in the future.
        }

        // Trying not to store empty strings in the database
        this.mqttUsername == '' ? this.mqttUsername = null : this.mqttUsername;
        this.mqttPassword == '' ? this.mqttPassword = null : this.mqttPassword;
    }
}

export class UpdateDatasetDto extends CreateDatasetDto { }
