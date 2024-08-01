import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateChannelDto } from './dto/create-channel.dto';

import { DatabaseService } from 'src/database/database.service';
import { MemberRole, Prisma } from '@prisma/client';
import { GeneralResponse } from 'src/schema/generalResponseSchema';

@Injectable()
export class ChannelsService {
  constructor(private databaseService: DatabaseService) {}
  async create(
    dto: CreateChannelDto,
    serverId: number,
    userId: number,
  ): Promise<GeneralResponse> {
    console.log('serverId', serverId);

    try {
      const server = await this.databaseService.server.update({
        where: {
          id: serverId,
          members: {
            some: {
              profileId: userId,
              role: {
                in: [MemberRole.ADMIN, MemberRole.MODERATOR],
              },
            },
          },
        },
        data: {
          channels: {
            create: {
              profileId: userId,
              name: dto.name,
              type: dto.type,
            },
          },
        },
        include: {
          members: {
            orderBy: {
              createdAt: 'asc',
            },
            include: {
              profile: true,
            },
          },
          channels: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });
      if (server) {
        return {
          data: {
            server: server,
          },
          message: 'Channel created successfully',
          success: true,
        };
      }
    } catch (error) {
      console.log('create channel error', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          // Record not found, invalid server id
          throw new NotFoundException('Server not found');
        }
      }
      console.error('Error updating Member:', error);
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
  async deleteChannel(
    serverId: number,
    channelId: number,
    userId: number,
  ): Promise<GeneralResponse> {
    try {
      const server = await this.databaseService.server.update({
        where: {
          id: serverId,
          members: {
            some: {
              profileId: userId,
              role: {
                in: [MemberRole.ADMIN, MemberRole.MODERATOR],
              },
            },
          },
        },
        data: {
          channels: {
            delete: {
              id: channelId,
              name: {
                not: 'general',
              },
            },
          },
        },
      });
      if (server) {
        return {
          data: '',
          message: 'Channel deleted successfully',
          success: true,
        };
      }
    } catch (error) {
      console.log('delete channel error', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          // Record not found, invalid server id
          throw new NotFoundException('Channel not found');
        }
      }
      console.error('Error deleting channel:', error);
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
  async editChannel(
    serverId: number,
    channelId: number,
    userId: number,
    dto: CreateChannelDto,
  ): Promise<GeneralResponse> {
    try {
      const server = await this.databaseService.server.update({
        where: {
          id: serverId,
          members: {
            some: {
              profileId: userId,
              role: {
                in: [MemberRole.ADMIN, MemberRole.MODERATOR],
              },
            },
          },
        },
        data: {
          channels: {
            update: {
              where: {
                id: channelId,
                name: {
                  not: 'general',
                },
              },
              data: {
                name: dto.name,
                type: dto.type,
              },
            },
          },
        },
        include: {
          members: {
            orderBy: {
              createdAt: 'asc',
            },
            include: {
              profile: true,
            },
          },
          channels: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });
      if (server) {
        return {
          data: {
            server: server,
          },
          message: 'Channel edited successfully',
          success: true,
        };
      }
    } catch (error) {
      console.log('edit channel error', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          // Record not found, invalid server id
          throw new NotFoundException('Channel not found');
        }
      }
      console.error('Error editing channel:', error);
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
  async getChannel(channelId: number): Promise<GeneralResponse> {
    try {
      const channel = await this.databaseService.channel.findUnique({
        where: {
          id: channelId,
        },
      });
      if (channel) {
        return {
          data: {
            channel: channel,
          },
          message: 'Channel Fetched successfully',
          success: true,
        };
      }
    } catch (error) {
      console.log('get channel error', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          // Record not found, invalid server id
          throw new NotFoundException('Channel not found');
        }
      }
      console.error('Error getting channel:', error);
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
