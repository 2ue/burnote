import { Module } from '@nestjs/common';
import { SharesModule } from './shares/shares.module';
import { AdminModule } from './admin/admin.module';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';

@Module({
  imports: [PrismaModule, SharesModule, AdminModule],
  controllers: [AppController],
})
export class AppModule {}
