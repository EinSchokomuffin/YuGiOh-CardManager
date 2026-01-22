// Card Types
export interface Card {
  id: string;
  konamiId: number;
  name: string;
  nameEn: string;
  nameDe?: string;
  type: string;
  frameType: string;
  description: string;
  race?: string;
  atk?: number;
  def?: number;
  level?: number;
  attribute?: string;
  archetype?: string;
  imageUrl: string;
  imageUrlSmall?: string;
  printings?: Printing[];
}

export interface Printing {
  id: string;
  cardId: string;
  setCode: string;
  setName: string;
  rarity: string;
  rarityCode: string;
  price?: number;
  priceUpdatedAt?: string;
  card?: Card;
}

// Collection Types
export type CardCondition =
  | "MINT"
  | "NEAR_MINT"
  | "EXCELLENT"
  | "GOOD"
  | "LIGHT_PLAYED"
  | "PLAYED"
  | "POOR";

export type CardEdition = "FIRST_EDITION" | "UNLIMITED" | "LIMITED";

export type PortfolioType = "COLLECTION" | "TRADES" | "BULK";

export interface CollectionItem {
  id: string;
  userId: string;
  printingId: string;
  condition: CardCondition;
  language: string;
  edition: CardEdition;
  quantity: number;
  purchasePrice?: number;
  storageLocation?: string;
  portfolio: PortfolioType;
  createdAt: string;
  updatedAt: string;
  printing: Printing & { card: Card };
}

export interface AddToCollectionPayload {
  printingId: string;
  condition?: CardCondition;
  language?: string;
  edition?: CardEdition;
  quantity?: number;
  purchasePrice?: number;
  storageLocation?: string;
  portfolio?: PortfolioType;
}

export interface CollectionStats {
  totalCards: number;
  totalUniqueCards: number;
  totalValue: number;
  totalPurchaseValue: number;
  profitLoss: number;
  portfolioBreakdown: Record<string, { count: number; value: number }>;
}

// Deck Types
export type DeckZone = "MAIN" | "EXTRA" | "SIDE";

export interface DeckCard {
  id: string;
  deckId: string;
  printingId: string;
  quantity: number;
  deckZone: DeckZone;
  printing: Printing & { card: Card };
}

export interface Deck {
  id: string;
  userId: string;
  name: string;
  description?: string;
  format?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  cards: DeckCard[];
}

export interface CreateDeckPayload {
  name: string;
  description?: string;
  format?: string;
  isPublic?: boolean;
  cards?: {
    printingId: string;
    quantity?: number;
    zone?: DeckZone;
  }[];
}

export interface DeckValidation {
  deckId: string;
  totalCards: number;
  ownedCards: number;
  missingCards: {
    cardName: string;
    setCode: string;
    needed: number;
    owned: number;
    estCost?: number;
  }[];
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface SearchCardsParams {
  name?: string;
  type?: string;
  archetype?: string;
  attribute?: string;
  limit?: number;
  offset?: number;
}

export interface GetCollectionParams {
  portfolio?: PortfolioType;
  condition?: CardCondition;
  search?: string;
  setCode?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

// User Types
export type UserTier = "FREE" | "PRO";

export interface User {
  id: string;
  email: string;
  username: string;
  tier: UserTier;
  createdAt: string;
}
