import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ServersService } from './servers.service';
import { CreateServerDto } from './dto/create-server.dto';

import { diskStorage } from 'multer';
import * as path from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser } from 'src/common/decorators';
import { AtGuard } from 'src/common/guards';
export const storage = {
  storage: diskStorage({
    destination: './files/serverImage',
    filename: (req, file, cb) => {
      const filename: string =
        path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
      const extension: string = path.parse(file.originalname).ext;
      cb(null, `${filename}${extension}`);
    },
  }),
};

@Controller('servers')
export class ServersController {
  constructor(private readonly serversService: ServersService) {}

  @UseGuards(AtGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file', storage))
  create(
    @Req() req: Request,
    @Body() dto: CreateServerDto,
    @UploadedFile() file: Express.Multer.File,
    @getCurrentUser('userId') userId: number,
  ) {
    if (!userId) {
      throw new BadRequestException('User not logged in or user not found');
    }

    if (!file) {
      throw new BadRequestException('Server image is required');
    }

    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;
    const filePath = `${baseUrl}/api/v1/servers/server-image/${file.filename}`;
    return this.serversService.create(dto, filePath, userId);
  }
  @Get('server-image/:imagename')
  getProfileImage(@Param('imagename') imagename: string, @Res() res) {
    return res.sendFile(
      path.join(process.cwd(), 'files/serverImage/' + imagename),
    );
  }

  @UseGuards(AtGuard)
  @Get('first')
  usersFirstServer(@getCurrentUser('userId') userId: number) {
    return this.serversService.getFirstServer(userId);
  }

  @UseGuards(AtGuard)
  @Get('server/:id')
  server(@getCurrentUser('userId') userId: number, @Param('id') id: string) {
    return this.serversService.getServer(+id, userId);
  }

  @UseGuards(AtGuard)
  @Get('user')
  userServers(@getCurrentUser('userId') userId: number) {
    return this.serversService.getUserServers(userId);
  }
}
