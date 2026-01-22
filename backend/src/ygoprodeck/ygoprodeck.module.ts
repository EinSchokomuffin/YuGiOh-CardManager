import { Module, forwardRef } from '@nestjs/common';
import { YgoprodeckService } from './ygoprodeck.service';
import { YgoprodeckController } from './ygoprodeck.controller';
import { CardsModule } from '../cards/cards.module';

@Module({
  imports: [forwardRef(() => CardsModule)],
  controllers: [YgoprodeckController],
  providers: [YgoprodeckService],
  exports: [YgoprodeckService],
})
export class YgoprodeckModule {}
