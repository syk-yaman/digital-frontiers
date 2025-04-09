import { IsString, IsOptional, IsInt, IsHexColor, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDatasetTagDto {
    @ApiProperty({ description: 'The name of the tag', example: 'Science' })
    @IsString()
    name!: string;

    @ApiProperty({ description: 'The colour of the tag in hex format', example: '#FF5733' })
    @IsHexColor()
    colour!: string;

    @ApiProperty({ description: 'The icon representing the tag', example: 'flask' })
    @IsString()
    icon!: string;

    @ApiProperty({ description: 'The order of the tag in the navbar', example: 1, required: false })
    @IsOptional()
    @IsInt()
    orderInNavbar?: number;

    @ValidateIf((o) => o.orderInNavbar !== undefined) // Ensure orderInNavbar is positive if provided
    validateOrderInNavbar() {
        if (this.orderInNavbar !== undefined && this.orderInNavbar < 0) {
            throw new Error('Order in navbar must be a positive integer.');
        }
    }
}

export class UpdateDatasetTagDto {
    @ApiProperty({ description: 'The name of the tag', example: 'Technology', required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ description: 'The colour of the tag in hex format', example: '#4287f5', required: false })
    @IsOptional()
    @IsHexColor()
    colour?: string;

    @ApiProperty({ description: 'The icon representing the tag', example: 'laptop', required: false })
    @IsOptional()
    @IsString()
    icon?: string;

    @ApiProperty({ description: 'The order of the tag in the navbar', example: 1, required: false })
    @IsOptional()
    @IsInt()
    orderInNavbar?: number;

    @ValidateIf((o) => o.orderInNavbar !== undefined) // Ensure orderInNavbar is positive if provided
    validateOrderInNavbar() {
        if (this.orderInNavbar !== undefined && this.orderInNavbar < 0) {
            throw new Error('Order in navbar must be a positive integer.');
        }
    }
}
