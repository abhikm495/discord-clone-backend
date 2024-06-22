import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { MulterModule } from '@nestjs/platform-express';
import { ServersModule } from './servers/servers.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    MulterModule.register({ dest: './uploads' }),
    DatabaseModule,
    ServersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
