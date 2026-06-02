import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'generated/prisma/enums';

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 'USER-1234',
  })
  id!: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  firstName!: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  lastName!: string;

  @ApiProperty({
    description: 'User email',
    example: 'johndoe@exampple.com',
  })
  email!: string;

  @ApiProperty({
    description: 'User rolee',
    example: 'USER',
  })
  role!: Role;
}
