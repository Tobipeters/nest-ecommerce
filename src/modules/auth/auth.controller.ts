import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenGuard } from '../../common/guards/refresh-token-guard';
import { GetUser } from 'src/common/decorators/get-user-decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiProperty, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: 201,
    description: 'User successfully register',
    type: AuthResponseDto,
  })
  async register(@Body() registerData: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerData);
  }

  @Post('login')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: 201,
    description: 'User logged in successfully',
    type: AuthResponseDto,
  })
  async login(@Body() loginData: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginData);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 201,
    description: 'User token refreshed successfully',
    type: AuthResponseDto,
  })
  async refresh(@GetUser('id') userId: string): Promise<AuthResponseDto> {
    return this.authService.refreshToken(userId);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth') 
  @ApiResponse({
    status: 201,
    description: 'User log out successfully',
  })
  async logout(@GetUser('id') userId: string): Promise<{ message: string }> {
    await this.authService.logout(userId);
    return { message: 'Successfully log out' };
  }
}
