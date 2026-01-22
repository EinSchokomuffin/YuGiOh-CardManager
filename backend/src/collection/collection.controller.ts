import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiParam } from '@nestjs/swagger';
import { CollectionService } from './collection.service';
import { AddToCollectionDto } from './dto/add-to-collection.dto';
import { GetCollectionDto } from './dto/get-collection.dto';
import { UpdateCollectionItemDto } from './dto/update-collection-item.dto';

@ApiTags('Collection')
@Controller('collection')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  // Note: In production, userId would come from JWT authentication
  // For demo purposes, we use a header
  private getUserId(userId?: string): string {
    return userId || 'demo-user-id';
  }

  @Post('add')
  @ApiOperation({ summary: 'Add a card to collection' })
  @ApiHeader({ name: 'x-user-id', required: false, description: 'User ID (demo)' })
  async addToCollection(
    @Headers('x-user-id') userId: string,
    @Body() dto: AddToCollectionDto,
  ) {
    return this.collectionService.addToCollection(this.getUserId(userId), dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user collection with filters' })
  @ApiHeader({ name: 'x-user-id', required: false, description: 'User ID (demo)' })
  async getCollection(
    @Headers('x-user-id') userId: string,
    @Query() dto: GetCollectionDto,
  ) {
    return this.collectionService.getCollection(this.getUserId(userId), dto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get collection statistics and value' })
  @ApiHeader({ name: 'x-user-id', required: false, description: 'User ID (demo)' })
  async getCollectionStats(@Headers('x-user-id') userId: string) {
    return this.collectionService.getCollectionStats(this.getUserId(userId));
  }

  @Get('top-value')
  @ApiOperation({ summary: 'Get top value cards in collection' })
  @ApiHeader({ name: 'x-user-id', required: false, description: 'User ID (demo)' })
  async getTopValueCards(
    @Headers('x-user-id') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.collectionService.getTopValueCards(this.getUserId(userId), limit);
  }

  @Get('set-progress/:setCode')
  @ApiOperation({ summary: 'Get set completion progress' })
  @ApiHeader({ name: 'x-user-id', required: false, description: 'User ID (demo)' })
  @ApiParam({ name: 'setCode', description: 'Set code prefix (e.g., LOB)' })
  async getSetProgress(
    @Headers('x-user-id') userId: string,
    @Param('setCode') setCode: string,
  ) {
    return this.collectionService.getSetProgress(this.getUserId(userId), setCode);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export collection to JSON' })
  @ApiHeader({ name: 'x-user-id', required: false, description: 'User ID (demo)' })
  async exportCollection(@Headers('x-user-id') userId: string) {
    return this.collectionService.exportCollection(this.getUserId(userId));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single collection item' })
  @ApiHeader({ name: 'x-user-id', required: false, description: 'User ID (demo)' })
  @ApiParam({ name: 'id', description: 'Collection item ID' })
  async getCollectionItem(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ) {
    return this.collectionService.getCollectionItem(this.getUserId(userId), id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a collection item' })
  @ApiHeader({ name: 'x-user-id', required: false, description: 'User ID (demo)' })
  @ApiParam({ name: 'id', description: 'Collection item ID' })
  async updateCollectionItem(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCollectionItemDto,
  ) {
    return this.collectionService.updateCollectionItem(this.getUserId(userId), id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a card from collection' })
  @ApiHeader({ name: 'x-user-id', required: false, description: 'User ID (demo)' })
  @ApiParam({ name: 'id', description: 'Collection item ID' })
  async removeFromCollection(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ) {
    return this.collectionService.removeFromCollection(this.getUserId(userId), id);
  }
}
