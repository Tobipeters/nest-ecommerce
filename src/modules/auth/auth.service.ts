import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerData: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName } = registerData;

    // Check if the user exist first
    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exist');
    }

    try {
      const hashPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

      // Create user
      const user = await this.prismaService.user.create({
        data: { email, firstName, lastName, password: hashPassword },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          password: false,
        },
      });
      const tokens = await this.generateToken(user.id, user.email);

      await this.updateRefreshTToken(user.id, tokens.refreshToken);

      return { ...tokens, user };
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occured during registration',
      );
    }
  }

  async login(loginData: LoginDto): Promise<AuthResponseDto> {
    const { email, password: login_password } = loginData;

    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        password: true,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('User does not exist');
    }

    const isPasswordCorrect = await bcrypt.compare(
      login_password,
      existingUser.password,
    );

    // console.log({ isPasswordCorrect });

    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Email or password is invalid');
    }

    try {
      // if user get here it means, the email exist and password is correct, process to generate token
      const tokens = await this.generateToken(existingUser.id, email);

      await this.updateRefreshTToken(existingUser.id, tokens.refreshToken);

      const { password, ...user } = existingUser;

      return { ...tokens, user };
    } catch (err) {
      throw new InternalServerErrorException(
        'An error occured when trying to log in',
      );
    }
  }

  private async generateToken(userId: string, email: string) {
    const payload = {
      sub: userId,
      email,
    };
    const refreshId = randomBytes(16).toString('hex');
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      this.jwtService.signAsync({ ...payload, refreshId }, { expiresIn: '7d' }),
    ]);

    return { accessToken, refreshToken };
  }

  async updateRefreshTToken(userId: string, refreshToken: string | null) {
    await this.prismaService.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }

  async refreshToken(userId: string) {
    const user = await this.getUserById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokens = await this.generateToken(userId, user.email);
    await this.updateRefreshTToken(userId, tokens.refreshToken);

    return {
      ...tokens,
      user,
    };
  }

  async logout(userId: string) {
    const user = await this.getUserById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.updateRefreshTToken(userId, null);
  }

  async getUserById(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        email: true,
        password: false,
      },
    });

    return user;
  }
}
