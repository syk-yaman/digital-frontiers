import { IsEmail, IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserType } from './user.entity';

export class SignUpDto {
    @ApiProperty({ description: 'User email address', example: 'user@example.com' })
    @IsEmail()
    email!: string;

    @ApiProperty({ description: 'User first name', example: 'John' })
    @IsString()
    @IsNotEmpty()
    firstName!: string;

    @ApiProperty({ description: 'User last name', example: 'Doe' })
    @IsString()
    @IsNotEmpty()
    lastName!: string;

    @ApiProperty({ description: 'User company name', example: 'TechCorp' })
    @IsString()
    @IsNotEmpty()
    company!: string;

    @ApiProperty({ description: 'User password', example: 'password123' })
    @IsString()
    @IsNotEmpty()
    password!: string;

    @ApiProperty({ description: 'User type', enum: UserType, example: UserType.PUBLIC_SECTOR })
    @IsEnum(UserType)
    type!: UserType;
}

export class SignInDto {
    @ApiProperty({ description: 'User email address', example: 'user@example.com' })
    @IsEmail()
    email!: string;

    @ApiProperty({ description: 'User password', example: 'password123' })
    @IsString()
    @IsNotEmpty()
    password!: string;
}
