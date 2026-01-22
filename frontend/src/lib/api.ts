import axios, { AxiosInstance } from "axios";
import type {
  Card,
  Printing,
  CollectionItem,
  CollectionStats,
  Deck,
  DeckValidation,
  PaginatedResponse,
  SearchCardsParams,
  GetCollectionParams,
  AddToCollectionPayload,
  CreateDeckPayload,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

// Auth types
export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    tier: string;
  };
}

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add auth token to all requests
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers["Authorization"] = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  setToken(token: string | null) {
    this.token = token;
  }

  // Auth API
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await this.client.post("/auth/register", payload);
    return response.data;
  }

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await this.client.post("/auth/login", payload);
    return response.data;
  }

  async getProfile() {
    const response = await this.client.get("/auth/profile");
    return response.data;
  }

  // Health Check
  async healthCheck() {
    const response = await this.client.get("/health");
    return response.data;
  }

  // Cards API
  async searchCards(params: SearchCardsParams): Promise<PaginatedResponse<Card>> {
    const response = await this.client.get("/cards", { params });
    return response.data;
  }

  async getCardById(id: string): Promise<Card> {
    const response = await this.client.get(`/cards/${id}`);
    return response.data;
  }

  async getCardByKonamiId(konamiId: number): Promise<Card> {
    const response = await this.client.get(`/cards/konami/${konamiId}`);
    return response.data;
  }

  async getCardPrintings(cardId: string): Promise<Printing[]> {
    const response = await this.client.get(`/cards/${cardId}/printings`);
    return response.data;
  }

  async getPrintingBySetCode(setCode: string): Promise<Printing & { card: Card }> {
    const response = await this.client.get(`/cards/printing/${setCode}`);
    return response.data;
  }

  async getCardStats(): Promise<{ totalCards: number; totalPrintings: number; totalArchetypes: number }> {
    const response = await this.client.get("/cards/stats");
    return response.data;
  }

  // Collection API
  async getCollection(params?: GetCollectionParams): Promise<PaginatedResponse<CollectionItem>> {
    const response = await this.client.get("/collection", { params });
    return response.data;
  }

  async getCollectionItem(id: string): Promise<CollectionItem> {
    const response = await this.client.get(`/collection/${id}`);
    return response.data;
  }

  async addToCollection(payload: AddToCollectionPayload): Promise<CollectionItem> {
    const response = await this.client.post("/collection/add", payload);
    return response.data;
  }

  async updateCollectionItem(id: string, payload: Partial<AddToCollectionPayload>): Promise<CollectionItem> {
    const response = await this.client.put(`/collection/${id}`, payload);
    return response.data;
  }

  async removeFromCollection(id: string): Promise<{ deleted: boolean; id: string }> {
    const response = await this.client.delete(`/collection/${id}`);
    return response.data;
  }

  async getCollectionStats(): Promise<CollectionStats> {
    const response = await this.client.get("/collection/stats");
    return response.data;
  }

  async getTopValueCards(limit = 10): Promise<(CollectionItem & { totalValue: number })[]> {
    const response = await this.client.get("/collection/top-value", { params: { limit } });
    return response.data;
  }

  async getSetProgress(setCode: string): Promise<{
    setCode: string;
    totalCards: number;
    ownedCards: number;
    missingCards: number;
    completionPercentage: number;
    missingList: { id: string; setCode: string; cardName: string; rarity: string; price?: number }[];
  }> {
    const response = await this.client.get(`/collection/set-progress/${setCode}`);
    return response.data;
  }

  async exportCollection(): Promise<any[]> {
    const response = await this.client.get("/collection/export");
    return response.data;
  }

  // Decks API
  async getDecks(): Promise<Deck[]> {
    const response = await this.client.get("/decks");
    return response.data;
  }

  async getDeckById(id: string): Promise<Deck> {
    const response = await this.client.get(`/decks/${id}`);
    return response.data;
  }

  async createDeck(payload: CreateDeckPayload): Promise<Deck> {
    const response = await this.client.post("/decks", payload);
    return response.data;
  }

  async updateDeck(id: string, payload: Partial<CreateDeckPayload>): Promise<Deck> {
    const response = await this.client.put(`/decks/${id}`, payload);
    return response.data;
  }

  async deleteDeck(id: string): Promise<{ deleted: boolean; id: string }> {
    const response = await this.client.delete(`/decks/${id}`);
    return response.data;
  }

  async addCardToDeck(deckId: string, payload: { printingId: string; quantity?: number; zone?: string }): Promise<Deck> {
    const response = await this.client.post(`/decks/${deckId}/cards`, payload);
    return response.data;
  }

  async removeCardFromDeck(deckId: string, cardId: string): Promise<Deck> {
    const response = await this.client.delete(`/decks/${deckId}/cards/${cardId}`);
    return response.data;
  }

  async validateDeckOwnership(deckId: string): Promise<DeckValidation> {
    const response = await this.client.post(`/decks/${deckId}/validate-ownership`);
    return response.data;
  }

  // YGOPRODeck Sync
  async syncCards(): Promise<{ success: boolean; cardsCreated: number; cardsUpdated: number; totalCards: number }> {
    const response = await this.client.post("/ygoprodeck/sync/batch", null, { params: { batchSize: 500 } });
    return response.data;
  }

  async searchYgoprodeck(query: string): Promise<{ count: number; cards: any[] }> {
    const response = await this.client.get("/ygoprodeck/search", { params: { q: query } });
    return response.data;
  }

  async getArchetypes(): Promise<{ archetypes: string[] }> {
    const response = await this.client.get("/ygoprodeck/archetypes");
    return response.data;
  }

  async getCardSets(): Promise<{ sets: { set_name: string; set_code: string; num_of_cards: number }[] }> {
    const response = await this.client.get("/ygoprodeck/sets");
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
