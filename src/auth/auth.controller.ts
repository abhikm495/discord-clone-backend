import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Param,
  Res,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { SignUpAuthDto } from './dto/signup-auth.dto';
import { SignInAuthDto } from './dto/signin-auth.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { SignOutAuthDto } from './dto/signout-auth.dto';
export const storage = {
  storage: diskStorage({
    destination: './files/profileImage',
    filename: (req, file, cb) => {
      const filename: string =
        path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
      const extension: string = path.parse(file.originalname).ext;
      cb(null, `${filename}${extension}`);
    },
  }),
};
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @UseInterceptors(FileInterceptor('file', storage))
  signup(
    @Req() req: Request,
    @Body() dto: SignUpAuthDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Profile image is required');
    }
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;
    const filePath = `${baseUrl}/auth/profile-image/${file.filename}`;
    return this.authService.signup(dto, filePath);
  }

  @Get('profile-image/:imagename')
  getProfileImage(@Param('imagename') imagename: string, @Res() res) {
    return res.sendFile(
      path.join(process.cwd(), 'files/profileImage/' + imagename),
    );
  }

  @Post('signin')
  signin(@Body() dto: SignInAuthDto) {
    return this.authService.signin(dto);
  }
  @Post('signout')
  signout(@Body() dto: SignOutAuthDto) {
    return this.authService.signout(dto);
  }
  // @Post('refresh')
  // refreshToken() {
  //   return this.authService.refreshToken();
  // }
}
