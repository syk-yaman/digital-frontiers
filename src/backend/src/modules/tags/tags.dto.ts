import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDatasetTagDto {
    @ApiProperty({ description: 'The name of the tag', example: 'Science' })
    @IsString()
    name!: string;

    @ApiProperty({ description: 'The colour of the tag in hex format', example: '#FF5733' })
    @IsString()
    colour!: string;

    @ApiProperty({ description: 'The icon representing the tag', example: 'flask' })
    @IsString()
    icon!: string;
}

export class UpdateDatasetTagDto {
    @ApiProperty({ description: 'The name of the tag', example: 'Technology', required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ description: 'The colour of the tag in hex format', example: '#4287f5', required: false })
    @IsOptional()
    @IsString()
    colour?: string;

    @ApiProperty({ description: 'The icon representing the tag', example: 'laptop', required: false })
    @IsOptional()
    @IsString()
    icon?: string;
}
