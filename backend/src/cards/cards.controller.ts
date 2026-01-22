import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CardsService } from './cards.service';
import { SearchCardsDto } from './dto/search-cards.dto';

@ApiTags('Cards')
@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  @ApiOperation({ summary: 'Search cards with filters' })
  async searchCards(@Query() dto: SearchCardsDto) {
    return this.cardsService.searchCards(dto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get card database statistics' })
  async getStats() {
    return this.cardsService.getCardStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get card by ID' })
  @ApiParam({ name: 'id', description: 'Card UUID' })
  async getCardById(@Param('id') id: string) {
    return this.cardsService.getCardById(id);
  }

  @Get('konami/:konamiId')
  @ApiOperation({ summary: 'Get card by Konami ID' })
  @ApiParam({ name: 'konamiId', description: 'Konami card ID' })
  async getCardByKonamiId(@Param('konamiId') konamiId: string) {
    return this.cardsService.getCardByKonamiId(parseInt(konamiId, 10));
  }

  @Get(':id/printings')
  @ApiOperation({ summary: 'Get all printings for a card' })
  @ApiParam({ name: 'id', description: 'Card UUID' })
  async getCardPrintings(@Param('id') id: string) {
    return this.cardsService.getCardPrintings(id);
  }

  @Get('printing/:setCode')
  @ApiOperation({ summary: 'Get printing by set code' })
  @ApiParam({ name: 'setCode', description: 'Set code (e.g., LOB-EN001)' })
  async getPrintingBySetCode(@Param('setCode') setCode: string) {
    return this.cardsService.getPrintingBySetCode(setCode);
  }
}
