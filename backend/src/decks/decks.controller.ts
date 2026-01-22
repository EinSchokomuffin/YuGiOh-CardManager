import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { DecksService } from './decks.service';

@Controller('decks')
export class DecksController {
  constructor(private decksService: DecksService) {}

  @Post()
  async create(@Body() data: any) {
    return this.decksService.createDeck(data.userId, data);
  }

  @Get(':id')
  async getDeck(@Param('id') id: string) {
    return this.decksService.getDeck(id, '');
  }

  @Get('user/:userId')
  async getUserDecks(@Param('userId') userId: string) {
    return this.decksService.getUserDecks(userId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.decksService.updateDeck(id, data.userId, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Body() data: any) {
    return this.decksService.deleteDeck(id, data.userId);
  }
}
