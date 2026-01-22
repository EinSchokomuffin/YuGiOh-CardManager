import { Module, forwardRef } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { YgoprodeckModule } from '../ygoprodeck/ygoprodeck.module';

@Module({
  imports: [forwardRef(() => YgoprodeckModule)],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardsModule {}
