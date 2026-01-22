import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { YgoprodeckService } from './ygoprodeck.service';
import { CardsService } from '../cards/cards.service';

@ApiTags('YGOPRODeck')
@Controller('ygoprodeck')
export class YgoprodeckController {
  constructor(
    private readonly ygoprodeckService: YgoprodeckService,
    private readonly cardsService: CardsService,
  ) {}

  @Get('search')
  @ApiOperation({ summary: 'Search cards on YGOPRODeck API' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  async searchCards(@Query('q') query: string) {
    const cards = await this.ygoprodeckService.searchCards(query);
    return {
      count: cards.length,
      cards: cards.slice(0, 20), // Limit to 20 results
    };
  }

  @Get('archetypes')
  @ApiOperation({ summary: 'Get all archetypes' })
  async getArchetypes() {
    const archetypes = await this.ygoprodeckService.fetchArchetypes();
    return { archetypes };
  }

  @Get('sets')
  @ApiOperation({ summary: 'Get all card sets' })
  async getCardSets() {
    const sets = await this.ygoprodeckService.fetchCardSets();
    return { sets };
  }

  @Post('sync')
  @ApiOperation({ summary: 'Sync all cards from YGOPRODeck to database' })
  async syncCards() {
    const result = await this.cardsService.syncFromYgoprodeck();
    return result;
  }

  @Post('sync/batch')
  @ApiOperation({ summary: 'Sync cards in batches (for large imports)' })
  @ApiQuery({ name: 'batchSize', required: false, description: 'Batch size (default: 500)' })
  async syncCardsBatch(@Query('batchSize') batchSize?: number) {
    const result = await this.cardsService.syncFromYgoprodeckBatch(batchSize || 500);
    return result;
  }
}
