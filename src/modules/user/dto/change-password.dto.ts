import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Old user password',
    example: 'Old@Password',
    required: true,
  })
  @IsString()
  @IsNotEmpty({
    message: 'Password must not be empty',
  })
  currentPassword!: string;

  @ApiProperty({
    description: 'New user password',
    example: 'New@Password',
    required: true,
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty({
    message: 'Password must not be empty',
  })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
    {
      message:
        'Password must contain at least one uppercase, one lowercase and one special character',
    },
  )
  newPasword!: string;
}
