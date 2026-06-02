import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty()
  accessToken!: string;
  @ApiProperty()
  refreshToken!: string;
  @ApiProperty({
    example: {
      id: 'USR-123',
      firstName: 'John',
      lastName: 'doe',
      email: 'johndoe@example.com',
      role: 'USER',
    },
  })
  user!: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}
