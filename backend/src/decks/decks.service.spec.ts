import { Test, TestingModule } from '@nestjs/testing';
import { DecksService } from './decks.service';
import { PrismaService } from '../prisma/prisma.service';
import { DeckZone } from '@prisma/client';

describe('DecksService', () => {
  let service: DecksService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    deck: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    deckCard: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    collectionItem: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DecksService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DecksService>(DecksService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserDecks', () => {
    it('should return all decks for a user', async () => {
      const mockDecks = [
        {
          id: '1',
          userId: 'user1',
          name: 'Blue-Eyes Deck',
          description: 'My Blue-Eyes deck',
          cards: [],
        },
        {
          id: '2',
          userId: 'user1',
          name: 'Dark Magician Deck',
          description: 'Spellcaster deck',
          cards: [],
        },
      ];

      mockPrismaService.deck.findMany.mockResolvedValue(mockDecks);

      const result = await service.getUserDecks('user1');

      expect(result).toEqual(mockDecks);
      expect(mockPrismaService.deck.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        include: {
          cards: {
            include: {
              printing: {
                include: { card: true },
              },
            },
          },
        },
      });
    });
  });

  describe('createDeck', () => {
    it('should create a new deck with cards', async () => {
      const createDto = {
        name: 'New Deck',
        description: 'Test deck',
        cards: [
          { printingId: 'p1', quantity: 3, zone: DeckZone.MAIN },
          { printingId: 'p2', quantity: 2, zone: DeckZone.EXTRA },
        ],
      };

      const mockDeck = {
        id: '1',
        userId: 'user1',
        name: 'New Deck',
        description: 'Test deck',
        cards: [],
      };

      mockPrismaService.deck.create.mockResolvedValue(mockDeck);

      const result = await service.createDeck('user1', createDto);

      expect(result).toEqual(mockDeck);
      expect(mockPrismaService.deck.create).toHaveBeenCalledWith({
        data: {
          userId: 'user1',
          name: 'New Deck',
          description: 'Test deck',
          cards: {
            create: createDto.cards,
          },
        },
        include: {
          cards: {
            include: {
              printing: {
                include: { card: true },
              },
            },
          },
        },
      });
    });
  });

  describe('validateOwnership', () => {
    it('should return ownership status for deck cards', async () => {
      const mockDeck = {
        id: '1',
        userId: 'user1',
        cards: [
          { printingId: 'p1', quantity: 3 },
          { printingId: 'p2', quantity: 2 },
          { printingId: 'p3', quantity: 1 },
        ],
      };

      const mockCollection = [
        { printingId: 'p1', quantity: 3 },
        { printingId: 'p2', quantity: 1 },
      ];

      mockPrismaService.deck.findUnique.mockResolvedValue(mockDeck);
      mockPrismaService.collectionItem.findMany.mockResolvedValue(mockCollection);

      const result = await service.validateOwnership('user1', '1');

      expect(result).toEqual({
        deckId: '1',
        isComplete: false,
        ownedCards: [
          { printingId: 'p1', required: 3, owned: 3, complete: true },
          { printingId: 'p2', required: 2, owned: 1, complete: false },
          { printingId: 'p3', required: 1, owned: 0, complete: false },
        ],
        missingCards: [
          { printingId: 'p2', missing: 1 },
          { printingId: 'p3', missing: 1 },
        ],
      });
    });
  });

  describe('deleteDeck', () => {
    it('should delete a deck and its cards', async () => {
      mockPrismaService.deckCard.deleteMany.mockResolvedValue({ count: 5 });
      mockPrismaService.deck.delete.mockResolvedValue({ id: '1' });

      await service.deleteDeck('user1', '1');

      expect(mockPrismaService.deckCard.deleteMany).toHaveBeenCalledWith({
        where: { deckId: '1' },
      });
      expect(mockPrismaService.deck.delete).toHaveBeenCalledWith({
        where: { id: '1', userId: 'user1' },
      });
    });
  });

  describe('getDeckStats', () => {
    it('should calculate deck statistics', async () => {
      const mockDeck = {
        id: '1',
        cards: [
          {
            zone: DeckZone.MAIN,
            quantity: 3,
            printing: { card: { type: 'Normal Monster' } },
          },
          {
            zone: DeckZone.MAIN,
            quantity: 2,
            printing: { card: { type: 'Effect Monster' } },
          },
          {
            zone: DeckZone.MAIN,
            quantity: 3,
            printing: { card: { type: 'Spell Card' } },
          },
          {
            zone: DeckZone.EXTRA,
            quantity: 2,
            printing: { card: { type: 'Fusion Monster' } },
          },
          {
            zone: DeckZone.SIDE,
            quantity: 3,
            printing: { card: { type: 'Trap Card' } },
          },
        ],
      };

      mockPrismaService.deck.findUnique.mockResolvedValue(mockDeck);

      const result = await service.getDeckStats('1');

      expect(result).toEqual({
        mainDeckCount: 8,
        extraDeckCount: 2,
        sideDeckCount: 3,
        totalCards: 13,
        typeBreakdown: {
          'Normal Monster': 3,
          'Effect Monster': 2,
          'Spell Card': 3,
          'Fusion Monster': 2,
          'Trap Card': 3,
        },
      });
    });
  });
});
