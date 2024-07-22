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

  findAll() {
    return `This action returns all channels`;
  }

  findOne(id: number) {
    return `This action returns a #${id} channel`;
  }

  remove(id: number) {
    return `This action removes a #${id} channel`;
  }
}
