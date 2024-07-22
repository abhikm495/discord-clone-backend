import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ServersModule } from './servers/servers.module';
import { AuthModule } from './auth/auth.module';
import { ChannelsModule } from './channels/channels.module';
import { MembersModule } from './members/members.module';

@Module({
  imports: [DatabaseModule, ServersModule, AuthModule, ChannelsModule, MembersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
