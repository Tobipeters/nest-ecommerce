import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user-decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { UserResponseDto } from './dto/user-response.dto';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

// @ApiTags('users')
@UseGuards(JwtAuthGuard, RoleGuard)
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fetched User details',
    type: UserResponseDto,
  })
  async getUserProfile(
    @GetUser('id') userId: string,
  ): Promise<UserResponseDto> {
    return this.userService.getUserProfile(userId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Fetch all users on the system',
    type: [UserResponseDto],
  })
  async findAll(): Promise<UserResponseDto[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Get a user by ID',
    type: UserResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Update user',
    type: UserResponseDto,
  })
  @ApiBody({
    type: UpdateUserDto,
  })
  async updateProfile(
    @Param('id') userId: string,
    @Body() data: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(userId, data);
  }

  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 201,
    description: 'Change your password',
    type: ChangePasswordDto,
  })
  @ApiBody({
    type: ChangePasswordDto,
  })
  async updatePassword(
    @GetUser('id') userId: string,
    data: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.userService.updatePassword(userId, data);
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 201,
    description: 'User account deleted',
  })
  async deleteAccount(
    @GetUser('id') userId: string,
  ): Promise<{ message: string }> {
    return this.userService.remove(userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 201,
    description: 'User account deleted',
  })
  async deleteUserById(
    @Param('id') userId: string,
  ): Promise<{ message: string }> {
    return this.userService.remove(userId);
  }
}
