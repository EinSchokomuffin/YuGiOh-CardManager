import { Test, TestingModule } from '@nestjs/testing';
import { CollectionService } from './collection.service';
import { PrismaService } from '../prisma/prisma.service';
import { CardCondition, CardEdition, PortfolioType } from './dto/add-to-collection.dto';

describe('CollectionService', () => {
  let service: CollectionService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    collectionItem: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
    printing: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectionService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CollectionService>(CollectionService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCollection', () => {
    it('should return collection items for a user', async () => {
      const mockItems = [
        {
          id: '1',
          userId: 'user1',
          printingId: 'print1',
          quantity: 3,
          condition: CardCondition.NEAR_MINT,
          edition: CardEdition.FIRST_EDITION,
          portfolioType: PortfolioType.COLLECTION,
          printing: {
            id: 'print1',
            setCode: 'LOB-EN005',
            card: { name: 'Dark Magician' },
          },
        },
      ];

      mockPrismaService.collectionItem.findMany.mockResolvedValue(mockItems);

      const result = await service.getCollection('user1', { portfolio: PortfolioType.COLLECTION });

      expect(result).toEqual(mockItems);
      expect(mockPrismaService.collectionItem.findMany).toHaveBeenCalled();
    });
  });

  describe('addToCollection', () => {
    it('should add a new item to collection', async () => {
      const newItem = {
        id: '1',
        userId: 'user1',
        printingId: 'print1',
        quantity: 2,
        condition: CardCondition.NEAR_MINT,
        edition: CardEdition.UNLIMITED,
        portfolioType: PortfolioType.COLLECTION,
      };

      mockPrismaService.collectionItem.findFirst.mockResolvedValue(null);
      mockPrismaService.collectionItem.create.mockResolvedValue(newItem);

      const result = await service.addToCollection('user1', {
        printingId: 'print1',
        quantity: 2,
        condition: CardCondition.NEAR_MINT,
        edition: CardEdition.UNLIMITED,
        portfolio: PortfolioType.COLLECTION,
      });

      expect(result).toEqual(newItem);
      expect(mockPrismaService.collectionItem.create).toHaveBeenCalled();
    });

    it('should update quantity if item already exists', async () => {
      const existingItem = {
        id: '1',
        userId: 'user1',
        printingId: 'print1',
        quantity: 2,
        condition: CardCondition.NEAR_MINT,
        edition: CardEdition.UNLIMITED,
        portfolioType: PortfolioType.COLLECTION,
      };

      const updatedItem = { ...existingItem, quantity: 5 };

      mockPrismaService.collectionItem.findFirst.mockResolvedValue(existingItem);
      mockPrismaService.collectionItem.update.mockResolvedValue(updatedItem);

      const result = await service.addToCollection('user1', {
        printingId: 'print1',
        quantity: 3,
        condition: CardCondition.NEAR_MINT,
        edition: CardEdition.UNLIMITED,
        portfolio: PortfolioType.COLLECTION,
      });

      expect(result.quantity).toBe(5);
      expect(mockPrismaService.collectionItem.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { quantity: 5 },
      });
    });
  });

  describe('removeFromCollection', () => {
    it('should decrease quantity', async () => {
      const existingItem = {
        id: '1',
        userId: 'user1',
        quantity: 5,
      };

      mockPrismaService.collectionItem.findFirst.mockResolvedValue(existingItem);
      mockPrismaService.collectionItem.update.mockResolvedValue({
        ...existingItem,
        quantity: 3,
      });

      await service.removeFromCollection('user1', '1');

      expect(mockPrismaService.collectionItem.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { quantity: 3 },
      });
    });

    it('should delete item if quantity becomes zero', async () => {
      const existingItem = {
        id: '1',
        userId: 'user1',
        quantity: 2,
      };

      mockPrismaService.collectionItem.findFirst.mockResolvedValue(existingItem);
      mockPrismaService.collectionItem.delete.mockResolvedValue(existingItem);

      await service.removeFromCollection('user1', '1');

      expect(mockPrismaService.collectionItem.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('getStats', () => {
    it('should return collection statistics', async () => {
      mockPrismaService.collectionItem.aggregate.mockResolvedValue({
        _sum: { quantity: 100 },
      });
      mockPrismaService.collectionItem.findMany.mockResolvedValue([
        {
          quantity: 10,
          printing: { price: 5.0 },
        },
        {
          quantity: 5,
          printing: { price: 10.0 },
        },
      ]);
      mockPrismaService.collectionItem.groupBy.mockResolvedValue([
        { portfolioType: PortfolioType.COLLECTION, _count: { id: 80 } },
        { portfolioType: PortfolioType.TRADES, _count: { id: 20 } },
      ]);

      const result = await service.getStats('user1');

      expect(result).toBeDefined();
    });
  });

  describe('getSetProgress', () => {
    it('should calculate set completion progress', async () => {
      mockPrismaService.printing.findMany.mockResolvedValue([
        { id: 'p1', setCode: 'LOB' },
        { id: 'p2', setCode: 'LOB' },
        { id: 'p3', setCode: 'LOB' },
        { id: 'p4', setCode: 'LOB' },
      ]);

      mockPrismaService.collectionItem.findMany.mockResolvedValue([
        { printingId: 'p1', quantity: 1 },
        { printingId: 'p2', quantity: 2 },
      ]);

      const result = await service.getSetProgress('user1', 'LOB');

      expect(result).toEqual({
        setCode: 'LOB',
        totalCards: 4,
        ownedCards: 2,
        completionPercentage: 50,
        missingCards: ['p3', 'p4'],
      });
    });
  });
});
