import { Injectable } from '@nestjs/common';
import { CreateServerDto } from './dto/create-server.dto';
import { DatabaseService } from 'src/database/database.service';
import { v4 as uuidv4 } from 'uuid';
import { MemberRole } from '@prisma/client';
import { GeneralResponse } from 'src/schema/generalResponseSchema';
@Injectable()
export class ServersService {
  constructor(private databaseService: DatabaseService) {}
  async create(
    dto: CreateServerDto,
    filePath: string,
    userId: number,
  ): Promise<GeneralResponse> {
    const { name } = dto;
    await this.databaseService.server.create({
      data: {
        profileId: userId,
        name,
        imageUrl: filePath,
        inviteCode: uuidv4(),
        channels: {
          create: [{ name: 'general', profileId: userId }],
        },
        members: {
          create: [{ role: MemberRole.ADMIN, profileId: userId }],
        },
      },
    });
    return {
      success: true,
      message: 'Server created successfully',
      data: '',
    };
  }
  async getFirstServer(userId: number): Promise<GeneralResponse> {
    const server = await this.databaseService.server.findFirst({
      where: {
        profileId: userId,
      },
    });
    if (!server) {
      return {
        success: false,
        message: 'You are not part of any server',
        data: {
          serverId: 0,
        },
      };
    }
    return {
      success: true,
      message: 'first server found',
      data: {
        serverId: server.id,
      },
    };
  }
}
