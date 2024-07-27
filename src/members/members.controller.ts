import {
  Controller,
  // Get,
  // Post,
  // Body,
  // Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Body,
  Patch,
} from '@nestjs/common';
import { MembersService } from './members.service';
// import { CreateMemberDto } from './dto/create-member.dto';
// import { UpdateMemberDto } from './dto/update-member.dto';
import { getCurrentUser } from 'src/common/decorators';
import { AtGuard } from 'src/common/guards';
import { UpdateMemberDto } from './dto/update-member.dto copy';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @UseGuards(AtGuard)
  @Patch(':memberId')
  updateMember(
    @Param('memberId') memberId: string,// hello there
    @Query('serverId') serverId: string,
    @getCurrentUser('userId') userId: number,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.membersService.updateMember(+memberId, +serverId, userId, dto);
  }
  @UseGuards(AtGuard)
  @Delete(':memberId')
  deleteMember(
    @Param('memberId') memberId: string,
    @Query('serverId') serverId: string,
    @getCurrentUser('userId') userId: number,
  ) {
    return this.membersService.deleteMember(+memberId, +serverId, userId);
  }
  @UseGuards(AtGuard)
  @Delete(':serverId')
  remove(
    @Param('serverId') serverId: string,
    @getCurrentUser('userId') userId: number,
  ) {
    return this.membersService.leaveServer(+serverId, userId);
  }
}
