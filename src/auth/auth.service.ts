import { BadRequestException, Injectable } from '@nestjs/common';
import { SignUpAuthDto } from './dto/signup-auth.dto';
import { SignInAuthDto } from './dto/signin-auth.dto';
import { DatabaseService } from 'src/database/database.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(private databaseService: DatabaseService) {}

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
    return { user };
  }
  async signin(dto: SignInAuthDto) {}
  async signout() {}

  async hashPassword(password: string) {
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(password, saltOrRounds);
    return hash;
  }
}
