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
  async getServer(id: number): Promise<GeneralResponse> {
    const server = await this.databaseService.server.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        profileId: true,
        name: true,
        imageUrl: true,
        inviteCode: true,
        channels: {
          select: {
            id: true,
            profileId: true,
            serverId: true,
            name: true,
            type: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        members: {
          select: {
            id: true,
            profileId: true,
            serverId: true,
            role: true,
            profile: {
              select: {
                id: true,
                userId: true,
                name: true,
                imageUrl: true,
                email: true,
              },
            },
          },
          orderBy: {
            role: 'asc',
          },
        },
      },
    });
    if (!server) {
      return {
        success: false,
        message: 'server not found',
        data: {
          server,
        },
      };
    }
    return {
      success: true,
      message: 'server found',
      data: {
        server,
      },
    };
  }
  async getUserServers(userId: number): Promise<GeneralResponse> {
    const servers = await this.databaseService.server.findMany({
      where: {
        profileId: userId,
      },
    });
    if (!servers) {
      return {
        success: false,
        message: 'no servers found',
        data: {
          servers,
        },
      };
    }
    return {
      success: false,
      message: 'servers found',
      data: {
        servers,
      },
    };
  }
}
