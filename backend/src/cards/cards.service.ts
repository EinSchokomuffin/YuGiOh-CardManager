import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { YgoprodeckService, YGOCard } from '../ygoprodeck/ygoprodeck.service';
import { SearchCardsDto } from './dto/search-cards.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CardsService {
  private readonly logger = new Logger(CardsService.name);

  constructor(
    private prisma: PrismaService,
    private ygoprodeckService: YgoprodeckService,
  ) {}

  /**
   * Search cards with filters
   */
  async searchCards(dto: SearchCardsDto) {
    const where: Prisma.CardWhereInput = {};
    const language = dto.language || 'DE';

    if (dto.name) {
      // Search in the appropriate language field
      if (language === 'EN') {
        where.nameEn = { contains: dto.name, mode: 'insensitive' };
      } else if (language === 'DE') {
        where.OR = [
          { nameDe: { contains: dto.name, mode: 'insensitive' } },
          { name: { contains: dto.name, mode: 'insensitive' } },
        ];
      } else {
        // For other languages, search in all name fields
        where.OR = [
          { name: { contains: dto.name, mode: 'insensitive' } },
          { nameEn: { contains: dto.name, mode: 'insensitive' } },
          { nameDe: { contains: dto.name, mode: 'insensitive' } },
        ];
      }
    }

    if (dto.type) {
      where.type = { contains: dto.type, mode: 'insensitive' };
    }

    if (dto.archetype) {
      where.archetype = { contains: dto.archetype, mode: 'insensitive' };
    }

    if (dto.attribute) {
      where.attribute = dto.attribute;
    }

    // Determine sort order based on language
    let orderBy: Prisma.CardOrderByWithRelationInput;
    if (language === 'EN') {
      orderBy = { nameEn: 'asc' };
    } else if (language === 'DE') {
      orderBy = { name: 'asc' }; // name is typically German
    } else {
      orderBy = { name: 'asc' };
    }

    const [cards, total] = await Promise.all([
      this.prisma.card.findMany({
        where,
        include: {
          printings: true,
        },
        take: dto.limit || 20,
        skip: dto.offset || 0,
        orderBy,
      }),
      this.prisma.card.count({ where }),
    ]);

    return {
      data: cards,
      total,
      limit: dto.limit || 20,
      offset: dto.offset || 0,
    };
  }

  /**
   * Get card by ID with all printings
   */
  async getCardById(id: string) {
    const card = await this.prisma.card.findUnique({
      where: { id },
      include: {
        printings: true,
      },
    });

    if (!card) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }

    return card;
  }

  /**
   * Get card by Konami ID
   */
  async getCardByKonamiId(konamiId: number) {
    const card = await this.prisma.card.findUnique({
      where: { konamiId },
      include: {
        printings: true,
      },
    });

    if (!card) {
      throw new NotFoundException(`Card with Konami ID ${konamiId} not found`);
    }

    return card;
  }

  /**
   * Get printing by set code
   */
  async getPrintingBySetCode(setCode: string) {
    const printing = await this.prisma.printing.findFirst({
      where: { setCode },
      include: {
        card: true,
      },
    });

    if (!printing) {
      throw new NotFoundException(`Printing with set code ${setCode} not found`);
    }

    return printing;
  }

  /**
   * Sync all cards from YGOPRODeck API
   */
  async syncFromYgoprodeck() {
    this.logger.log('Starting full card sync from YGOPRODeck...');
    
    // Fetch both German and English cards
    const [ygoCardsDE, ygoCardsEN] = await Promise.all([
      this.ygoprodeckService.fetchAllCards(),
      this.ygoprodeckService.fetchAllCardsEnglish(),
    ]);

    // Create a map of English names by Konami ID
    const englishNamesMap = new Map<number, string>();
    for (const card of ygoCardsEN) {
      englishNamesMap.set(card.id, card.name);
    }

    let cardsCreated = 0;
    let cardsUpdated = 0;
    let printingsCreated = 0;

    for (const ygoCard of ygoCardsDE) {
      try {
        const englishName = englishNamesMap.get(ygoCard.id) || ygoCard.name;
        const result = await this.upsertCardFromYgo(ygoCard, englishName);
        if (result.created) cardsCreated++;
        else cardsUpdated++;
        printingsCreated += result.printingsCreated;
      } catch (error) {
        this.logger.error(`Failed to sync card: ${ygoCard.name}`, error);
      }
    }

    this.logger.log(`Sync complete: ${cardsCreated} created, ${cardsUpdated} updated, ${printingsCreated} printings`);

    return {
      success: true,
      cardsCreated,
      cardsUpdated,
      printingsCreated,
      totalCards: ygoCardsDE.length,
    };
  }

  /**
   * Sync cards in batches
   */
  async syncFromYgoprodeckBatch(batchSize: number) {
    this.logger.log(`Starting batch sync with batch size ${batchSize}...`);
    
    // Fetch both German and English cards
    const [ygoCardsDE, ygoCardsEN] = await Promise.all([
      this.ygoprodeckService.fetchAllCards(),
      this.ygoprodeckService.fetchAllCardsEnglish(),
    ]);

    // Create a map of English names by Konami ID
    const englishNamesMap = new Map<number, string>();
    for (const card of ygoCardsEN) {
      englishNamesMap.set(card.id, card.name);
    }

    let cardsCreated = 0;
    let cardsUpdated = 0;
    let printingsCreated = 0;

    for (let i = 0; i < ygoCardsDE.length; i += batchSize) {
      const batch = ygoCardsDE.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (ygoCard) => {
          try {
            const englishName = englishNamesMap.get(ygoCard.id) || ygoCard.name;
            const result = await this.upsertCardFromYgo(ygoCard, englishName);
            if (result.created) cardsCreated++;
            else cardsUpdated++;
            printingsCreated += result.printingsCreated;
          } catch (error) {
            this.logger.error(`Failed to sync card: ${ygoCard.name}`, error);
          }
        }),
      );

      this.logger.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(ygoCardsDE.length / batchSize)}`);
    }

    return {
      success: true,
      cardsCreated,
      cardsUpdated,
      printingsCreated,
      totalCards: ygoCardsDE.length,
    };
  }

  /**
   * Upsert a single card from YGOPRODeck data
   */
  private async upsertCardFromYgo(ygoCard: YGOCard, englishName?: string) {
    const existingCard = await this.prisma.card.findUnique({
      where: { konamiId: ygoCard.id },
    });

    const cardData = {
      konamiId: ygoCard.id,
      name: ygoCard.name, // German name from DE API
      nameEn: englishName || ygoCard.name, // English name
      nameDe: ygoCard.name, // German name
      type: ygoCard.type,
      frameType: ygoCard.frameType,
      description: ygoCard.desc,
      race: ygoCard.race,
      atk: ygoCard.atk,
      def: ygoCard.def,
      level: ygoCard.level,
      attribute: ygoCard.attribute,
      archetype: ygoCard.archetype,
      imageUrl: ygoCard.card_images[0]?.image_url || '',
      imageUrlSmall: ygoCard.card_images[0]?.image_url_small,
    };

    let card;
    let created = false;

    if (existingCard) {
      card = await this.prisma.card.update({
        where: { id: existingCard.id },
        data: cardData,
      });
    } else {
      card = await this.prisma.card.create({
        data: cardData,
      });
      created = true;
    }

    // Create/update printings
    let printingsCreated = 0;
    if (ygoCard.card_sets) {
      for (const set of ygoCard.card_sets) {
        const existingPrinting = await this.prisma.printing.findUnique({
          where: {
            cardId_setCode: {
              cardId: card.id,
              setCode: set.set_code,
            },
          },
        });

        if (!existingPrinting) {
          await this.prisma.printing.create({
            data: {
              cardId: card.id,
              setCode: set.set_code,
              setName: set.set_name,
              rarity: set.set_rarity,
              rarityCode: set.set_rarity_code,
              price: set.set_price ? parseFloat(set.set_price) : null,
              priceUpdatedAt: new Date(),
            },
          });
          printingsCreated++;
        } else {
          await this.prisma.printing.update({
            where: { id: existingPrinting.id },
            data: {
              price: set.set_price ? parseFloat(set.set_price) : null,
              priceUpdatedAt: new Date(),
            },
          });
        }
      }
    }

    return { created, printingsCreated };
  }

  /**
   * Get all printings for a card
   */
  async getCardPrintings(cardId: string) {
    return this.prisma.printing.findMany({
      where: { cardId },
      orderBy: { setCode: 'asc' },
    });
  }

  /**
   * Get card statistics
   */
  async getCardStats() {
    const [totalCards, totalPrintings, archetypes] = await Promise.all([
      this.prisma.card.count(),
      this.prisma.printing.count(),
      this.prisma.card.findMany({
        where: { archetype: { not: null } },
        distinct: ['archetype'],
        select: { archetype: true },
      }),
    ]);

    return {
      totalCards,
      totalPrintings,
      totalArchetypes: archetypes.length,
    };
  }
}
