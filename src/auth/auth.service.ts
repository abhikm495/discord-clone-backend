import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { SignUpAuthDto } from './dto/signup-auth.dto';
import { SignInAuthDto } from './dto/signin-auth.dto';
import { DatabaseService } from 'src/database/database.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AT_SECRET, RT_SECRET } from '../utils/constants';
import { SignOutAuthDto } from './dto/signout-auth.dto';
@Injectable()
export class AuthService {
  constructor(
    private databaseService: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: SignUpAuthDto, fileName: string) {
    const { name, email, password } = dto;
    const userAlreadyExists = await this.databaseService.profile.findUnique({
      where: {
        email,
      },
    });
    if (userAlreadyExists) {
      throw new BadRequestException('Email Already Exists');
    }
    const hashedPassword = await this.hashPassword(password);
    const user = await this.databaseService.profile.create({
      data: {
        name,
        email,
        hashedPassword,
        imageUrl: fileName,
      },
    });
    return {
      success: true,
      message: 'Sign up successful',
      data: {
        user: {
          userId: user.userId,
          name: user.name,
          email: user.email,
          image: user.imageUrl,
        },
      },
    };
  }
  async signin(dto: SignInAuthDto) {
    const { email, password } = dto;
    const user = await this.databaseService.profile.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      throw new BadRequestException('Email is not registered');
    }
    const isMatch = await this.comparePassword(password, user.hashedPassword);
    if (!isMatch) {
      throw new BadRequestException('Password does not match');
    }
    const token = await this.signToken({ userId: user.userId, email });
    await this.updateRtHash(user.userId, token.refresh_token);
    return {
      success: true,
      message: 'Login successful',
      data: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        access_token: token.access_token,
        refresh_token: token.refresh_token,
      },
    };
  }
  async signout(dto: SignOutAuthDto) {
    const { userId } = dto;
    await this.databaseService.profile.update({
      where: {
        userId,
      },
      data: {
        hashedRt: null,
      },
    });
    return {
      success: true,
      message: 'Sign out successful',
      data: {},
    };
  }

  async hashPassword(password: string) {
    const saltOrRounds = 10;
    return await bcrypt.hash(password, saltOrRounds);
  }
  async comparePassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }
  async signToken(args: { userId: number; email: string }) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(args, {
        secret: AT_SECRET,
        expiresIn: 60 * 15,
      }),
      this.jwtService.signAsync(args, {
        secret: RT_SECRET,
        expiresIn: 60 * 60 * 24 * 7,
      }),
    ]);
    return {
      access_token: at,
      refresh_token: rt,
    };
  }
  async refreshToken(userId: number, rt: string) {
    const user = await this.databaseService.profile.findUnique({
      where: {
        userId,
      },
    });
    if (!user) {
      throw new ForbiddenException('user not found ');
    }
    if (!user.hashedRt) {
      throw new ForbiddenException('refresh token is null ');
    }
    const rtMatches = bcrypt.compare(user.hashedRt, rt);
    if (!rtMatches) {
      throw new ForbiddenException('refresh token does not match ');
    }
    const token = await this.signToken({ userId, email: user.email });

    return { token };
  }
  async updateRtHash(userId: number, rt: string) {
    const hashedRt = await bcrypt.hash(rt, 10);
    await this.databaseService.profile.update({
      where: {
        userId,
      },
      data: {
        hashedRt,
      },
    });
  }
}
