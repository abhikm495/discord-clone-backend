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
  Patch,
  Query,
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
import { UpdateMemberDto } from './dto/update-member.dto';
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
  @UseGuards(AtGuard)
  @Patch(':serverId')
  @UseInterceptors(FileInterceptor('file', storage))
  updateServer(
    @Req() req: Request,
    @Body() dto: CreateServerDto,
    @UploadedFile() file: Express.Multer.File,
    @Param('serverId') serverId: string,
  ) {
    if (!file) {
      throw new BadRequestException('Server image is required');
    }
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;
    const filePath = `${baseUrl}/api/v1/servers/server-image/${file.filename}`;
    return this.serversService.updateServer(dto, filePath, +serverId);
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
  @UseGuards(AtGuard)
  @Patch(':serverId/invite-code')
  updateInviteCode(
    @Param('serverId') serverId: number,
    @getCurrentUser('userId') userId: number,
  ) {
    return this.serversService.updateInviteCode(+serverId, userId);
  }

  @UseGuards(AtGuard)
  @Patch('/invite/:inviteCode')
  addMember(
    @Param('inviteCode') inviteCode: string,
    @getCurrentUser('userId') userId: number,
  ) {
    return this.serversService.addMember(inviteCode, userId);
  }

  @UseGuards(AtGuard)
  @Patch('/members/:memberId')
  updateMember(
    @Param('memberId') memberId: string,
    @Query('serverId') serverId: string,
    @getCurrentUser('userId') userId: number,
    @Body() dto: UpdateMemberDto,
  ) {
    console.log('BE SERVER', serverId);

    return this.serversService.updateMember(+memberId, +serverId, userId, dto);
  }
}
