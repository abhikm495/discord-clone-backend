import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateServerDto } from './dto/create-server.dto';
import { DatabaseService } from 'src/database/database.service';
import { v4 as uuidv4 } from 'uuid';
import { MemberRole, Prisma } from '@prisma/client';
import { GeneralResponse } from 'src/schema/generalResponseSchema';
import { UpdateMemberDto } from './dto/update-member.dto';

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
        members: {
          some: {
            profileId: userId,
          },
        },
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
  async getServer(id: number, userId: number): Promise<GeneralResponse> {
    try {
      const server = await this.databaseService.server.findUnique({
        where: {
          id,
          members: {
            some: {
              profileId: userId,
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

      if (!server) {
        throw new NotFoundException('Server not found');
      }
      return {
        success: true,
        message: 'Server found',
        data: {
          server: server,
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
      console.error('Error updating Member:', error);
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
  async getUserServers(userId: number): Promise<GeneralResponse> {
    const servers = await this.databaseService.server.findMany({
      where: {
        members: {
          some: {
            profileId: userId,
          },
        },
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
      success: true,
      message: 'servers found',
      data: {
        servers,
      },
    };
  }
  async updateInviteCode(
    serverId: number,
    userId: number,
  ): Promise<GeneralResponse> {
    const newInviteCode = uuidv4();
    const server = await this.databaseService.server.update({
      where: {
        id: serverId,
        profileId: userId,
      },
      data: {
        inviteCode: newInviteCode,
      },
    });
    if (!server) throw new NotFoundException('Invite code is invalid');
    if (server) {
      return {
        data: newInviteCode,
        message: 'New invite code generated',
        success: true,
      };
    }
  }
  async addMember(
    inviteCode: string,
    userId: number,
  ): Promise<GeneralResponse> {
    try {
      const exists = await this.databaseService.server.findUnique({
        where: {
          inviteCode,
          members: {
            some: {
              profileId: userId,
            },
          },
        },
      });
      if (exists) {
        return {
          data: exists.id.toString(),
          message: 'You are already a part of this server',
          success: true,
        };
      }
      const server = await this.databaseService.server.update({
        where: {
          inviteCode,
        },
        data: {
          members: {
            create: {
              profileId: userId,
            },
          },
        },
      });

      return {
        data: server.id.toString(),
        message: 'You are now a member of this server',
        success: true,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // Unique constraint violation, user is already a member
          return {
            data: null,
            message: 'You are already a part of this server',
            success: true,
          };
        } else if (error.code === 'P2025') {
          // Record not found, invalid invite code
          throw new NotFoundException('Invite code is invalid');
        }
      }
      console.error('Error in addMember:', error);
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
  async updateServer(
    dto: CreateServerDto,
    filePath: string,
    serverId: number,
  ): Promise<GeneralResponse> {
    try {
      await this.databaseService.server.update({
        where: {
          id: serverId,
        },
        data: {
          name: dto.name,
          imageUrl: filePath,
        },
      });
      return {
        data: '',
        message: 'Server updated successfuly',
        success: true,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          // Record not found, invalid invite code
          throw new NotFoundException('Server not found');
        }
      }
      console.error('Error updating server:', error);
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
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
}
