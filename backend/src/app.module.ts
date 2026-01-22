import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { CardsModule } from './cards/cards.module';
import { CollectionModule } from './collection/collection.module';
import { DecksModule } from './decks/decks.module';
import { YgoprodeckModule } from './ygoprodeck/ygoprodeck.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    HealthModule,
    CardsModule,
    CollectionModule,
    DecksModule,
    YgoprodeckModule,
  ],
})
export class AppModule {}
