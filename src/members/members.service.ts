import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
// import { CreateMemberDto } from './dto/create-member.dto';
// import { UpdateMemberDto } from './dto/update-member.dto';
import { DatabaseService } from 'src/database/database.service';
import { Prisma } from '@prisma/client';
import { GeneralResponse } from 'src/schema/generalResponseSchema';
import { UpdateMemberDto } from './dto/update-member.dto copy';

@Injectable()
export class MembersService {
  constructor(private databaseService: DatabaseService) {}
  async updateMember(
    memberId: number,
    serverId: number,
    userId: number,
    dto: UpdateMemberDto,
  ): Promise<GeneralResponse> {
    try {
      const server = await this.databaseService.server.update({
        where: {
          id: serverId,
        },
        data: {
          members: {
            update: {
              where: {
                id: memberId,
                profileId: {
                  not: userId,
                },
              },
              data: {
                role: dto.role,
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
          data: { server: server },
          message: 'Member`s role updated successfully',
          success: true,
        };
      }
    } catch (error) {
      console.log(error);

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
  async deleteMember(
    memberId: number,
    serverId: number,
    userId: number,
  ): Promise<GeneralResponse> {
    try {
      const server = await this.databaseService.server.update({
        where: {
          id: serverId,
        },
        data: {
          members: {
            deleteMany: {
              id: memberId,
              profileId: {
                not: userId,
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
          data: { server: server },
          message: 'Member kicked successfully',
          success: true,
        };
      }
    } catch (error) {
      console.log(error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          // Record not found, invalid server id
          throw new NotFoundException('Server not found');
        }
      }
      console.error('Error kicking Member:', error);
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
  async leaveServer(
    serverId: number,
    userId: number,
  ): Promise<GeneralResponse> {
    try {
      await this.databaseService.server.update({
        where: {
          id: serverId,
          profileId: {
            not: userId,
          },
          members: {
            some: {
              profileId: userId,
            },
          },
        },
        data: {
          members: {
            deleteMany: {
              profileId: userId,
            },
          },
        },
      });
      return {
        success: true,
        message: 'You have left the server',
        data: '',
      };
    } catch (error) {
      console.log(error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          // Record not found, invalid server id
          throw new NotFoundException('Server not found');
        }
      }
      console.error('Error kicking Member:', error);
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
  async getActiveMember(
    serverId: number,
    userId: number,
  ): Promise<GeneralResponse> {
    try {
      const member = await this.databaseService.member.findFirst({
        where: {
          serverId: serverId,
          profileId: userId,
        },
        include: {
          profile: true,
        },
      });
      return {
        success: true,
        message: 'Member found',
        data: {
          member: member,
        },
      };
    } catch (error) {
      console.log(error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          // Record not found, invalid server id
          throw new NotFoundException('Server not found');
        }
      }
      console.error('Error kicking Member:', error);
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
