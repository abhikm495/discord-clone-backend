import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpAuthDto } from './dto/signup-auth.dto';
import { SignInAuthDto } from './dto/signin-auth.dto';
import { DatabaseService } from 'src/database/database.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
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
      throw new UnauthorizedException('Password does not match');
    }
    const token = await this.signToken({ userId: user.userId, email });
    return {
      jwttoken: token.access_token,
      refreshtoken: token.refresh_token,
      user: {
        id: user.userId,
        name: user.name,
        email: user.email,
        image: user.imageUrl,
      },
    };
  }
  async signout(userId: number) {
    const updatedProfile = await this.databaseService.profile.updateMany({
      where: {
        userId,
        secret: {
          not: null,
        },
      },
      data: {
        secret: null,
      },
    });
    if (updatedProfile.count === 0) {
      return {
        success: false,
        message: 'No active session found for this user',
      };
    }
    return {
      success: true,
      message: 'Sign out successful',
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
    const secret = uuidv4();

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(args, {
        secret: secret,
        expiresIn: 60 * 60 * 60 * 60,
      }),
      this.jwtService.signAsync(args, {
        secret: secret,
        expiresIn: 60 * 60 * 24 * 7,
      }),
    ]);
    await this.updateSecretKey(args.userId, secret);
    return {
      access_token: at,
      refresh_token: rt,
    };
  }
  async refreshToken(userId: number) {
    const user = await this.databaseService.profile.findUnique({
      where: {
        userId,
      },
    });
    const token = await this.signToken({ userId, email: user.email });
    return {
      jwttoken: token.access_token,
      refreshtoken: token.refresh_token,
      user: {
        id: user.userId,
        name: user.name,
        email: user.email,
        image: user.imageUrl,
      },
    };
  }
  async updateSecretKey(userId: number, secret: string) {
    await this.databaseService.profile.update({
      where: {
        userId,
      },
      data: {
        secret,
      },
    });
  }
}
