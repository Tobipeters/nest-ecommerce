import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private readonly SALT_ROUNDS = 10;
  constructor(private prismaService: PrismaService) {}

  async getUserProfile(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        password: false,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async findAll() {
    // Check that the user calling this method has an ADMIN role
    return this.prismaService.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        password: false,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string): Promise<UserResponseDto> {
    // Check that the user calling this method has an ADMIN role

    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        password: false,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(userId: string, data: UpdateUserDto) {
    // Check that use exist
    const existingUser = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        password: false,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('No user found');
    }

    // Check if email change exist on the system
    if (data.email && data.email !== existingUser.email) {
      const emailTaken = await this.prismaService.user.findUnique({
        where: { email: data.email },
      });

      if (emailTaken) {
        throw new NotFoundException('Email already exist');
      }
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        password: false,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async updatePassword(userId: string, data: ChangePasswordDto) {
    // validate current password
    const existingUser = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        password: true,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    try {
      const isPasswordCorrect = await bcrypt.compare(
        data.currentPassword,
        existingUser.password,
      );

      if (!isPasswordCorrect) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      const isSamePassword = await bcrypt.compare(
        data.newPasword,
        existingUser.password,
      );

      if (!isSamePassword) {
        throw new NotFoundException(
          'New password must be different from the current password',
        );
      }

      // Update new password
      const hashPassword = await bcrypt.hash(data.newPasword, this.SALT_ROUNDS);

      const updatedPassword = await this.prismaService.user.update({
        where: { id: userId },
        data: {
          password: hashPassword,
        },
      });

      return { message: 'Password changed successfully' };
    } catch (err) {
      throw new InternalServerErrorException(
        'An error occured when trying to log in',
      );
    }
  }

  async remove(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prismaService.user.delete({
      where: { id: userId },
    });

    return {
      message: 'Account deleted successfully',
    };
  }
}
