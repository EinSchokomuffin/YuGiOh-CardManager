import { Test, TestingModule } from '@nestjs/testing';
import { CardsService } from './cards.service';
import { PrismaService } from '../prisma/prisma.service';
import { YgoprodeckService } from '../ygoprodeck/ygoprodeck.service';

describe('CardsService', () => {
  let service: CardsService;
  let prismaService: PrismaService;
  let ygoprodeckService: YgoprodeckService;

  const mockPrismaService = {
    card: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      upsert: jest.fn(),
    },
    printing: {
      upsert: jest.fn(),
    },
  };

  const mockYgoprodeckService = {
    getAllCards: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: YgoprodeckService, useValue: mockYgoprodeckService },
      ],
    }).compile();

    service = module.get<CardsService>(CardsService);
    prismaService = module.get<PrismaService>(PrismaService);
    ygoprodeckService = module.get<YgoprodeckService>(YgoprodeckService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('search', () => {
    it('should return paginated cards', async () => {
      const mockCards = [
        {
          id: '1',
          ygoprodeckId: 46986414,
          name: 'Dark Magician',
          type: 'Normal Monster',
          frameType: 'normal',
          description: 'The ultimate wizard',
          atk: 2500,
          def: 2100,
          level: 7,
          race: 'Spellcaster',
          attribute: 'DARK',
          archetype: 'Dark Magician',
          imageUrl: 'https://example.com/dm.jpg',
          imageUrlSmall: 'https://example.com/dm_small.jpg',
          printings: [],
        },
      ];

      mockPrismaService.card.findMany.mockResolvedValue(mockCards);
      mockPrismaService.card.count.mockResolvedValue(1);

      const result = await service.search({
        name: 'Dark Magician',
        page: 1,
        limit: 20,
      });

      expect(result).toEqual({
        data: mockCards,
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      expect(mockPrismaService.card.findMany).toHaveBeenCalledWith({
        where: {
          name: { contains: 'Dark Magician', mode: 'insensitive' },
        },
        include: { printings: true },
        skip: 0,
        take: 20,
      });
    });

    it('should filter by type', async () => {
      mockPrismaService.card.findMany.mockResolvedValue([]);
      mockPrismaService.card.count.mockResolvedValue(0);

      await service.search({ type: 'Spell Card' });

      expect(mockPrismaService.card.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: { contains: 'Spell Card', mode: 'insensitive' },
          }),
        }),
      );
    });

    it('should filter by attribute', async () => {
      mockPrismaService.card.findMany.mockResolvedValue([]);
      mockPrismaService.card.count.mockResolvedValue(0);

      await service.search({ attribute: 'DARK' });

      expect(mockPrismaService.card.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            attribute: 'DARK',
          }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return a card by id', async () => {
      const mockCard = {
        id: '1',
        name: 'Blue-Eyes White Dragon',
        printings: [],
      };

      mockPrismaService.card.findUnique.mockResolvedValue(mockCard);

      const result = await service.findById('1');

      expect(result).toEqual(mockCard);
      expect(mockPrismaService.card.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { printings: true },
      });
    });

    it('should return null for non-existent card', async () => {
      mockPrismaService.card.findUnique.mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('syncFromYgoprodeck', () => {
    it('should import cards from YGOPRODeck API', async () => {
      const mockApiCards = [
        {
          id: 46986414,
          name: 'Dark Magician',
          type: 'Normal Monster',
          frameType: 'normal',
          desc: 'The ultimate wizard',
          atk: 2500,
          def: 2100,
          level: 7,
          race: 'Spellcaster',
          attribute: 'DARK',
          archetype: 'Dark Magician',
          card_images: [
            { image_url: 'https://example.com/dm.jpg', image_url_small: 'https://example.com/dm_small.jpg' },
          ],
          card_sets: [
            {
              set_name: 'Legend of Blue Eyes White Dragon',
              set_code: 'LOB-EN005',
              set_rarity: 'Ultra Rare',
              set_rarity_code: 'UR',
              set_price: '25.00',
            },
          ],
        },
      ];

      mockYgoprodeckService.getAllCards.mockResolvedValue(mockApiCards);
      mockPrismaService.card.upsert.mockResolvedValue({ id: '1' });
      mockPrismaService.printing.upsert.mockResolvedValue({ id: '1' });

      const result = await service.syncFromYgoprodeck();

      expect(result).toEqual({
        imported: 1,
        updated: 0,
        errors: 0,
      });

      expect(mockPrismaService.card.upsert).toHaveBeenCalled();
    });
  });
});
