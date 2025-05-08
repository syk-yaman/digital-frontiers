import { IsString, IsOptional, IsNumber, IsUrl, IsUUID, ValidateNested, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ShowcaseSliderImageDto {
    @IsString()
    fileName!: string;

    @IsBoolean()
    @IsOptional()
    isTeaser?: boolean;
}

class ShowcaseLocationDto {
    @IsNumber()
    lon!: number;

    @IsNumber()
    lat!: number;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    imageLink?: string;

    @IsString()
    @IsOptional()
    linkTitle?: string;

    @IsString()
    @IsOptional()
    linkAddress?: string;
}

export class CreateShowcaseDto {
    @ApiProperty({ description: 'User ID who owns the showcase' })
    @IsUUID()
    userId!: string;

    @ApiProperty({ description: 'Title of the showcase' })
    @IsString()
    title!: string;

    @ApiProperty({ description: 'Description of the showcase' })
    @IsString()
    description!: string;

    @ApiProperty({ description: 'YouTube video link', required: false })
    @IsUrl()
    @IsOptional()
    youtubeLink?: string;

    @ApiProperty({ description: 'Optional related dataset ID', required: false })
    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => {
        if (value === '' || value === null || value === undefined) return null;
        return Number(value);
    })
    datasetId?: number;

    @ApiProperty({ description: 'Slider images for the showcase', type: [ShowcaseSliderImageDto] })
    @ValidateNested({ each: true })
    @Type(() => ShowcaseSliderImageDto)
    sliderImages!: ShowcaseSliderImageDto[];

    @ApiProperty({ description: 'Location points for the showcase', type: [ShowcaseLocationDto], required: false })
    @ValidateNested({ each: true })
    @Type(() => ShowcaseLocationDto)
    @IsOptional()
    locations?: ShowcaseLocationDto[];

    // Custom validation: Ensure at least one slider image exists
    validateSliderImages() {
        if (!this.sliderImages || this.sliderImages.length === 0) {
            throw new Error('At least one slider image must be provided.');
        }

        // Check that at most one image is marked as teaser
        const teaserCount = this.sliderImages.filter(img => img.isTeaser).length;
        if (teaserCount > 1) {
            throw new Error('Only one image can be marked as a teaser.');
        }
    }
}

export class UpdateShowcaseDto extends CreateShowcaseDto { }
