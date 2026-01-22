import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface YGOCard {
  id: number;
  name: string;
  type: string;
  frameType: string;
  desc: string;
  race?: string;
  atk?: number;
  def?: number;
  level?: number;
  attribute?: string;
  archetype?: string;
  card_sets?: YGOCardSet[];
  card_images: YGOCardImage[];
  card_prices?: YGOCardPrice[];
}

export interface YGOCardSet {
  set_name: string;
  set_code: string;
  set_rarity: string;
  set_rarity_code: string;
  set_price?: string;
}

export interface YGOCardImage {
  id: number;
  image_url: string;
  image_url_small: string;
  image_url_cropped?: string;
}

export interface YGOCardPrice {
  cardmarket_price?: string;
  tcgplayer_price?: string;
  ebay_price?: string;
  amazon_price?: string;
  coolstuffinc_price?: string;
}

export interface YGOAPIResponse {
  data: YGOCard[];
}

@Injectable()
export class YgoprodeckService {
  private readonly logger = new Logger(YgoprodeckService.name);
  private readonly client: AxiosInstance;
  private readonly baseUrl = 'https://db.ygoprodeck.com/api/v7';

  constructor(private configService: ConfigService) {
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
    });
  }

  /**
   * Fetch all cards from YGOPRODeck API
   */
  async fetchAllCards(): Promise<YGOCard[]> {
    try {
      this.logger.log('Fetching all cards from YGOPRODeck API...');
      const response = await this.client.get<YGOAPIResponse>('/cardinfo.php');
      this.logger.log(`Fetched ${response.data.data.length} cards`);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to fetch cards from YGOPRODeck API', error);
      throw error;
    }
  }

  /**
   * Fetch a single card by name
   */
  async fetchCardByName(name: string): Promise<YGOCard | null> {
    try {
      const response = await this.client.get<YGOAPIResponse>('/cardinfo.php', {
        params: { name },
      });
      return response.data.data[0] || null;
    } catch (error) {
      this.logger.warn(`Card not found: ${name}`);
      return null;
    }
  }

  /**
   * Fetch cards by fuzzy name search
   */
  async searchCards(query: string): Promise<YGOCard[]> {
    try {
      const response = await this.client.get<YGOAPIResponse>('/cardinfo.php', {
        params: { fname: query },
      });
      return response.data.data;
    } catch (error) {
      this.logger.warn(`No cards found for query: ${query}`);
      return [];
    }
  }

  /**
   * Fetch card by Konami ID
   */
  async fetchCardByKonamiId(konamiId: number): Promise<YGOCard | null> {
    try {
      const response = await this.client.get<YGOAPIResponse>('/cardinfo.php', {
        params: { id: konamiId },
      });
      return response.data.data[0] || null;
    } catch (error) {
      this.logger.warn(`Card not found with Konami ID: ${konamiId}`);
      return null;
    }
  }

  /**
   * Fetch cards by archetype
   */
  async fetchCardsByArchetype(archetype: string): Promise<YGOCard[]> {
    try {
      const response = await this.client.get<YGOAPIResponse>('/cardinfo.php', {
        params: { archetype },
      });
      return response.data.data;
    } catch (error) {
      this.logger.warn(`No cards found for archetype: ${archetype}`);
      return [];
    }
  }

  /**
   * Fetch all archetypes
   */
  async fetchArchetypes(): Promise<string[]> {
    try {
      const response = await this.client.get('/archetypes.php');
      return response.data.map((item: { archetype_name: string }) => item.archetype_name);
    } catch (error) {
      this.logger.error('Failed to fetch archetypes', error);
      return [];
    }
  }

  /**
   * Fetch all card sets
   */
  async fetchCardSets(): Promise<{ set_name: string; set_code: string; num_of_cards: number }[]> {
    try {
      const response = await this.client.get('/cardsets.php');
      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch card sets', error);
      return [];
    }
  }
}
