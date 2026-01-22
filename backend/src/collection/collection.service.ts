import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCollectionDto } from './dto/add-to-collection.dto';
import { GetCollectionDto } from './dto/get-collection.dto';
import { UpdateCollectionItemDto } from './dto/update-collection-item.dto';
import { Prisma, CardCondition, CardEdition, PortfolioType } from '@prisma/client';

@Injectable()
export class CollectionService {
  private readonly logger = new Logger(CollectionService.name);

  // Free tier limit
  private readonly FREE_TIER_LIMIT = 500;

  constructor(private prisma: PrismaService) {}

  /**
   * Add a card to the collection
   */
  async addToCollection(userId: string, dto: AddToCollectionDto) {
    // Check if printing exists
    const printing = await this.prisma.printing.findUnique({
      where: { id: dto.printingId },
      include: { card: true },
    });

    if (!printing) {
      throw new NotFoundException(`Printing with ID ${dto.printingId} not found`);
    }

    // Check user tier and collection limit
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.tier === 'FREE') {
      const collectionCount = await this.prisma.collectionItem.count({
        where: { userId },
      });

      if (collectionCount >= this.FREE_TIER_LIMIT) {
        throw new BadRequestException(
          `Free tier limit of ${this.FREE_TIER_LIMIT} collection items reached. Upgrade to Pro for unlimited storage.`,
        );
      }
    }

    const condition = (dto.condition || 'NEAR_MINT') as CardCondition;
    const edition = (dto.edition || 'UNLIMITED') as CardEdition;
    const language = dto.language || 'EN';
    const portfolio = (dto.portfolio || 'COLLECTION') as PortfolioType;

    // Check if this exact item already exists
    const existingItem = await this.prisma.collectionItem.findUnique({
      where: {
        userId_printingId_condition_language_edition: {
          userId,
          printingId: dto.printingId,
          condition,
          language,
          edition,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      return this.prisma.collectionItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + (dto.quantity || 1),
          purchasePrice: dto.purchasePrice ?? existingItem.purchasePrice,
          storageLocation: dto.storageLocation ?? existingItem.storageLocation,
        },
        include: {
          printing: {
            include: { card: true },
          },
        },
      });
    }

    // Create new item
    return this.prisma.collectionItem.create({
      data: {
        userId,
        printingId: dto.printingId,
        condition,
        language,
        edition,
        quantity: dto.quantity || 1,
        purchasePrice: dto.purchasePrice,
        storageLocation: dto.storageLocation,
        portfolio,
      },
      include: {
        printing: {
          include: { card: true },
        },
      },
    });
  }

  /**
   * Get user's collection with filters
   */
  async getCollection(userId: string, dto: GetCollectionDto) {
    const where: Prisma.CollectionItemWhereInput = { userId };

    if (dto.portfolio) {
      where.portfolio = dto.portfolio as PortfolioType;
    }

    if (dto.condition) {
      where.condition = dto.condition as CardCondition;
    }

    if (dto.setCode) {
      where.printing = { setCode: { contains: dto.setCode, mode: 'insensitive' } };
    }

    if (dto.search) {
      where.printing = {
        ...where.printing,
        card: {
          OR: [
            { name: { contains: dto.search, mode: 'insensitive' } },
            { nameEn: { contains: dto.search, mode: 'insensitive' } },
          ],
        },
      };
    }

    const orderBy: Prisma.CollectionItemOrderByWithRelationInput = {};
    if (dto.sortBy === 'name') {
      orderBy.printing = { card: { name: dto.sortOrder || 'asc' } };
    } else if (dto.sortBy === 'price') {
      orderBy.printing = { price: dto.sortOrder || 'desc' };
    } else {
      orderBy.createdAt = dto.sortOrder || 'desc';
    }

    const [items, total] = await Promise.all([
      this.prisma.collectionItem.findMany({
        where,
        include: {
          printing: {
            include: { card: true },
          },
        },
        orderBy,
        take: dto.limit || 50,
        skip: dto.offset || 0,
      }),
      this.prisma.collectionItem.count({ where }),
    ]);

    return {
      data: items,
      total,
      limit: dto.limit || 50,
      offset: dto.offset || 0,
    };
  }

  /**
   * Get a single collection item
   */
  async getCollectionItem(userId: string, itemId: string) {
    const item = await this.prisma.collectionItem.findFirst({
      where: { id: itemId, userId },
      include: {
        printing: {
          include: { card: true },
        },
      },
    });

    if (!item) {
      throw new NotFoundException(`Collection item with ID ${itemId} not found`);
    }

    return item;
  }

  /**
   * Update a collection item
   */
  async updateCollectionItem(userId: string, itemId: string, dto: UpdateCollectionItemDto) {
    const item = await this.prisma.collectionItem.findFirst({
      where: { id: itemId, userId },
    });

    if (!item) {
      throw new NotFoundException(`Collection item with ID ${itemId} not found`);
    }

    // If quantity is 0, delete the item
    if (dto.quantity === 0) {
      await this.prisma.collectionItem.delete({ where: { id: itemId } });
      return { deleted: true, id: itemId };
    }

    return this.prisma.collectionItem.update({
      where: { id: itemId },
      data: {
        quantity: dto.quantity,
        condition: dto.condition as CardCondition,
        edition: dto.edition as CardEdition,
        purchasePrice: dto.purchasePrice,
        storageLocation: dto.storageLocation,
        portfolio: dto.portfolio as PortfolioType,
      },
      include: {
        printing: {
          include: { card: true },
        },
      },
    });
  }

  /**
   * Remove a card from collection
   */
  async removeFromCollection(userId: string, itemId: string) {
    const item = await this.prisma.collectionItem.findFirst({
      where: { id: itemId, userId },
    });

    if (!item) {
      throw new NotFoundException(`Collection item with ID ${itemId} not found`);
    }

    await this.prisma.collectionItem.delete({ where: { id: itemId } });
    return { deleted: true, id: itemId };
  }

  /**
   * Get collection value and statistics
   */
  async getCollectionStats(userId: string) {
    const items = await this.prisma.collectionItem.findMany({
      where: { userId },
      include: {
        printing: true,
      },
    });

    let totalValue = 0;
    let totalPurchaseValue = 0;
    let totalCards = 0;
    const portfolioBreakdown: Record<string, { count: number; value: number }> = {};

    for (const item of items) {
      const itemValue = (item.printing.price || 0) * item.quantity;
      const itemPurchaseValue = (item.purchasePrice || 0) * item.quantity;

      totalValue += itemValue;
      totalPurchaseValue += itemPurchaseValue;
      totalCards += item.quantity;

      if (!portfolioBreakdown[item.portfolio]) {
        portfolioBreakdown[item.portfolio] = { count: 0, value: 0 };
      }
      portfolioBreakdown[item.portfolio].count += item.quantity;
      portfolioBreakdown[item.portfolio].value += itemValue;
    }

    return {
      totalCards,
      totalUniqueCards: items.length,
      totalValue: Math.round(totalValue * 100) / 100,
      totalPurchaseValue: Math.round(totalPurchaseValue * 100) / 100,
      profitLoss: Math.round((totalValue - totalPurchaseValue) * 100) / 100,
      portfolioBreakdown,
    };
  }

  /**
   * Get top value cards in collection
   */
  async getTopValueCards(userId: string, limit = 10) {
    const items = await this.prisma.collectionItem.findMany({
      where: { userId },
      include: {
        printing: {
          include: { card: true },
        },
      },
      orderBy: {
        printing: { price: 'desc' },
      },
      take: limit,
    });

    return items.map((item) => ({
      ...item,
      totalValue: (item.printing.price || 0) * item.quantity,
    }));
  }

  /**
   * Get set completion progress
   */
  async getSetProgress(userId: string, setCode: string) {
    // Get all printings for the set
    const allPrintings = await this.prisma.printing.findMany({
      where: { setCode: { startsWith: setCode.split('-')[0] } },
      include: { card: true },
    });

    // Get user's collection items for this set
    const ownedItems = await this.prisma.collectionItem.findMany({
      where: {
        userId,
        printing: { setCode: { startsWith: setCode.split('-')[0] } },
      },
      include: { printing: true },
    });

    const ownedPrintingIds = new Set(ownedItems.map((item) => item.printingId));

    const owned = allPrintings.filter((p) => ownedPrintingIds.has(p.id));
    const missing = allPrintings.filter((p) => !ownedPrintingIds.has(p.id));

    return {
      setCode: setCode.split('-')[0],
      totalCards: allPrintings.length,
      ownedCards: owned.length,
      missingCards: missing.length,
      completionPercentage: Math.round((owned.length / allPrintings.length) * 100),
      missingList: missing.map((p) => ({
        id: p.id,
        setCode: p.setCode,
        cardName: p.card.name,
        rarity: p.rarity,
        price: p.price,
      })),
    };
  }

  /**
   * Export collection to JSON
   */
  async exportCollection(userId: string) {
    const items = await this.prisma.collectionItem.findMany({
      where: { userId },
      include: {
        printing: {
          include: { card: true },
        },
      },
    });

    return items.map((item) => ({
      cardName: item.printing.card.name,
      setCode: item.printing.setCode,
      setName: item.printing.setName,
      rarity: item.printing.rarity,
      condition: item.condition,
      language: item.language,
      edition: item.edition,
      quantity: item.quantity,
      purchasePrice: item.purchasePrice,
      currentPrice: item.printing.price,
      storageLocation: item.storageLocation,
      portfolio: item.portfolio,
    }));
  }
}
