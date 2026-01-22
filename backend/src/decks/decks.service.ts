import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DecksService {
  constructor(private prisma: PrismaService) {}

  async createDeck(userId: string, data: any) {
    return this.prisma.deck.create({
      data: {
        ...data,
        userId,
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
  }

  async getDeck(deckId: string, userId: string) {
    return this.prisma.deck.findFirst({
      where: {
        id: deckId,
        userId,
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
  }

  async getUserDecks(userId: string) {
    return this.prisma.deck.findMany({
      where: { userId },
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
  }

  async updateDeck(deckId: string, userId: string, data: any) {
    return this.prisma.deck.updateMany({
      where: {
        id: deckId,
        userId,
      },
      data,
    });
  }

  async deleteDeck(deckId: string, userId: string) {
    return this.prisma.deck.deleteMany({
      where: {
        id: deckId,
        userId,
      },
    });
  }

  async validateOwnership(userId: string, deckId: string) {
    const deck = await this.prisma.deck.findFirst({
      where: {
        id: deckId,
        userId,
      },
    });
    return !!deck;
  }

  async getDeckStats(deckId: string) {
    const deck = await this.prisma.deck.findUnique({
      where: { id: deckId },
      include: {
        cards: true,
      },
    });

    if (!deck) {
      return null;
    }

    const totalCards = deck.cards.reduce((sum, card) => sum + card.quantity, 0);
    const uniqueCards = deck.cards.length;

    return {
      deckId,
      totalCards,
      uniqueCards,
      mainDeckCards: deck.cards.filter((c: any) => c.zone === 'MAIN').reduce((sum: number, c: any) => sum + c.quantity, 0),
      extraDeckCards: deck.cards.filter((c: any) => c.zone === 'EXTRA').reduce((sum: number, c: any) => sum + c.quantity, 0),
      sideDeckCards: deck.cards.filter((c: any) => c.zone === 'SIDE').reduce((sum: number, c: any) => sum + c.quantity, 0),
    };
  }}