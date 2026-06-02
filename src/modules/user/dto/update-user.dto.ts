import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: false,
  })
  @IsString()
  @Optional()
  firstName?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
  })
  @IsString()
  @Optional()
  lastName?: string;

  @ApiProperty({
    description: 'User email',
    example: 'johndoe@example.com',
    required: false,
  })
  @IsString()
  @Optional()
  @IsEmail()
  email?: string;
}
