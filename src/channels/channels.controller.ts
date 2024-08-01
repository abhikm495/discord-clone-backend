import {
  Controller,
  Post,
  Body,
  // Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Patch,
  Get,
} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';
// import { UpdateChannelDto } from './dto/update-channel.dto';
import { AtGuard } from 'src/common/guards';
import { getCurrentUser } from 'src/common/decorators';

@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @UseGuards(AtGuard)
  @Post()
  create(
    @Body() dto: CreateChannelDto,
    @getCurrentUser('userId') userId: number,
    @Query('serverId') serverId: string,
  ) {
    return this.channelsService.create(dto, +serverId, userId);
  }

  @UseGuards(AtGuard)
  @Get(':channelId')
  getChannel(@Param('channelId') channelId: string) {
    return this.channelsService.getChannel(+channelId);
  }

  @UseGuards(AtGuard)
  @Patch(':channelId')
  update(
    @Param('channelId') channelId: string,
    @Query('serverId') serverId: string,
    @getCurrentUser('userId') userId: number,
    @Body() dto: CreateChannelDto,
  ) {
    return this.channelsService.editChannel(+serverId, +channelId, userId, dto);
  }
  @UseGuards(AtGuard)
  @Delete(':channelId')
  deleteChannel(
    @Param('channelId') channelId: string,
    @Query('serverId') serverId: string,
    @getCurrentUser('userId') userId: number,
  ) {
    return this.channelsService.deleteChannel(+serverId, +channelId, userId);
  }
}
