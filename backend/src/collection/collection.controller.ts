import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CollectionService } from './collection.service';
import { AddToCollectionDto } from './dto/add-to-collection.dto';
import { GetCollectionDto } from './dto/get-collection.dto';
import { UpdateCollectionItemDto } from './dto/update-collection-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest {
  user: {
    userId: string;
    email: string;
  };
}

@ApiTags('Collection')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('collection')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post('add')
  @ApiOperation({ summary: 'Add a card to collection' })
  async addToCollection(
    @Request() req: AuthenticatedRequest,
    @Body() dto: AddToCollectionDto,
  ) {
    return this.collectionService.addToCollection(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user collection with filters' })
  async getCollection(
    @Request() req: AuthenticatedRequest,
    @Query() dto: GetCollectionDto,
  ) {
    return this.collectionService.getCollection(req.user.userId, dto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get collection statistics and value' })
  async getCollectionStats(@Request() req: AuthenticatedRequest) {
    return this.collectionService.getCollectionStats(req.user.userId);
  }

  @Get('top-value')
  @ApiOperation({ summary: 'Get top value cards in collection' })
  async getTopValueCards(
    @Request() req: AuthenticatedRequest,
    @Query('limit') limit?: number,
  ) {
    return this.collectionService.getTopValueCards(req.user.userId, limit);
  }

  @Get('set-progress/:setCode')
  @ApiOperation({ summary: 'Get set completion progress' })
  @ApiParam({ name: 'setCode', description: 'Set code prefix (e.g., LOB)' })
  async getSetProgress(
    @Request() req: AuthenticatedRequest,
    @Param('setCode') setCode: string,
  ) {
    return this.collectionService.getSetProgress(req.user.userId, setCode);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export collection to JSON' })
  async exportCollection(@Request() req: AuthenticatedRequest) {
    return this.collectionService.exportCollection(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single collection item' })
  @ApiParam({ name: 'id', description: 'Collection item ID' })
  async getCollectionItem(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.collectionService.getCollectionItem(req.user.userId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a collection item' })
  @ApiParam({ name: 'id', description: 'Collection item ID' })
  async updateCollectionItem(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateCollectionItemDto,
  ) {
    return this.collectionService.updateCollectionItem(req.user.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a card from collection' })
  @ApiParam({ name: 'id', description: 'Collection item ID' })
  async removeFromCollection(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.collectionService.removeFromCollection(req.user.userId, id);
  }
}
