import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Enter a valid email',
    required: true,
  })
  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @ApiProperty({
    description: 'Enter a valid password',
    required: true,
  })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
    {
      message:
        'Password must contain at least one uppercase, one lowercase and one special character',
    },
  )
  password!: string;

  @ApiProperty({
    description: 'Enter first name',
    required: true,
  })
  @IsNotEmpty({ message: 'First name is required' })
  @IsString()
  firstName!: string;

  @ApiProperty({
    description: 'Enter last name',
    required: true,
  })
  @IsNotEmpty({ message: 'Last name is required' })
  @IsString()
  lastName!: string;
}
