import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Cards API (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    prismaService = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/cards (GET)', () => {
    it('should return paginated cards', async () => {
      const response = await request(app.getHttpServer())
        .get('/cards')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(response.body).toHaveProperty('totalPages');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter cards by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/cards?name=Dark%20Magician')
        .expect(200);

      expect(response.body.data.every((card: any) =>
        card.name.toLowerCase().includes('dark magician')
      )).toBe(true);
    });

    it('should filter cards by type', async () => {
      const response = await request(app.getHttpServer())
        .get('/cards?type=Spell')
        .expect(200);

      expect(response.body.data.every((card: any) =>
        card.type.toLowerCase().includes('spell')
      )).toBe(true);
    });

    it('should paginate results', async () => {
      const page1 = await request(app.getHttpServer())
        .get('/cards?page=1&limit=5')
        .expect(200);

      const page2 = await request(app.getHttpServer())
        .get('/cards?page=2&limit=5')
        .expect(200);

      expect(page1.body.page).toBe(1);
      expect(page2.body.page).toBe(2);
      expect(page1.body.data).not.toEqual(page2.body.data);
    });
  });

  describe('/cards/:id (GET)', () => {
    it('should return a specific card', async () => {
      // First, get a card from the list
      const listResponse = await request(app.getHttpServer())
        .get('/cards?limit=1')
        .expect(200);

      if (listResponse.body.data.length > 0) {
        const cardId = listResponse.body.data[0].id;

        const response = await request(app.getHttpServer())
          .get(`/cards/${cardId}`)
          .expect(200);

        expect(response.body).toHaveProperty('id', cardId);
        expect(response.body).toHaveProperty('name');
        expect(response.body).toHaveProperty('type');
      }
    });

    it('should return 404 for non-existent card', async () => {
      await request(app.getHttpServer())
        .get('/cards/non-existent-id')
        .expect(404);
    });
  });
});

describe('Collection API (e2e)', () => {
  let app: INestApplication;
  const testUserId = 'test-user-e2e';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/collection (GET)', () => {
    it('should return collection items', async () => {
      const response = await request(app.getHttpServer())
        .get('/collection')
        .set('x-user-id', testUserId)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by portfolio type', async () => {
      const response = await request(app.getHttpServer())
        .get('/collection?portfolioType=COLLECTION')
        .set('x-user-id', testUserId)
        .expect(200);

      expect(response.body.every((item: any) =>
        item.portfolioType === 'COLLECTION'
      )).toBe(true);
    });
  });

  describe('/collection/stats (GET)', () => {
    it('should return collection statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/collection/stats')
        .set('x-user-id', testUserId)
        .expect(200);

      expect(response.body).toHaveProperty('totalCards');
      expect(response.body).toHaveProperty('totalValue');
      expect(response.body).toHaveProperty('byPortfolio');
    });
  });

  describe('/collection (POST)', () => {
    it('should add item to collection', async () => {
      // First get a printing ID
      const cardsResponse = await request(app.getHttpServer())
        .get('/cards?limit=1')
        .expect(200);

      if (cardsResponse.body.data.length > 0 && cardsResponse.body.data[0].printings?.length > 0) {
        const printingId = cardsResponse.body.data[0].printings[0].id;

        const response = await request(app.getHttpServer())
          .post('/collection')
          .set('x-user-id', testUserId)
          .send({
            printingId,
            quantity: 1,
            condition: 'NEAR_MINT',
            edition: 'UNLIMITED',
            portfolioType: 'COLLECTION',
          })
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('quantity');
      }
    });

    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/collection')
        .set('x-user-id', testUserId)
        .send({})
        .expect(400);
    });
  });
});

describe('Decks API (e2e)', () => {
  let app: INestApplication;
  const testUserId = 'test-user-e2e';
  let createdDeckId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/decks (GET)', () => {
    it('should return user decks', async () => {
      const response = await request(app.getHttpServer())
        .get('/decks')
        .set('x-user-id', testUserId)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('/decks (POST)', () => {
    it('should create a new deck', async () => {
      const response = await request(app.getHttpServer())
        .post('/decks')
        .set('x-user-id', testUserId)
        .send({
          name: 'E2E Test Deck',
          description: 'Created during E2E testing',
          cards: [],
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('E2E Test Deck');
      createdDeckId = response.body.id;
    });

    it('should validate deck name is required', async () => {
      await request(app.getHttpServer())
        .post('/decks')
        .set('x-user-id', testUserId)
        .send({
          description: 'No name deck',
        })
        .expect(400);
    });
  });

  describe('/decks/:id (GET)', () => {
    it('should return a specific deck', async () => {
      if (createdDeckId) {
        const response = await request(app.getHttpServer())
          .get(`/decks/${createdDeckId}`)
          .set('x-user-id', testUserId)
          .expect(200);

        expect(response.body.id).toBe(createdDeckId);
      }
    });
  });

  describe('/decks/:id (DELETE)', () => {
    it('should delete a deck', async () => {
      if (createdDeckId) {
        await request(app.getHttpServer())
          .delete(`/decks/${createdDeckId}`)
          .set('x-user-id', testUserId)
          .expect(200);

        // Verify deletion
        await request(app.getHttpServer())
          .get(`/decks/${createdDeckId}`)
          .set('x-user-id', testUserId)
          .expect(404);
      }
    });
  });
});

describe('Health Check (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/health (GET)', () => {
    it('should return health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
    });
  });
});
