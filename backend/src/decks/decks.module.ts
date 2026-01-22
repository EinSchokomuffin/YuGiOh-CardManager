import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DecksService } from './decks.service';
import { DecksController } from './decks.controller';

@Module({
  imports: [PrismaModule],
  providers: [DecksService],
  controllers: [DecksController],
  exports: [DecksService],
})
export class DecksModule {}
