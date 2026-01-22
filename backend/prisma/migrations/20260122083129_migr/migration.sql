-- CreateEnum
CREATE TYPE "UserTier" AS ENUM ('FREE', 'PRO');

-- CreateEnum
CREATE TYPE "CardCondition" AS ENUM ('MINT', 'NEAR_MINT', 'EXCELLENT', 'GOOD', 'LIGHT_PLAYED', 'PLAYED', 'POOR');

-- CreateEnum
CREATE TYPE "CardEdition" AS ENUM ('FIRST_EDITION', 'UNLIMITED', 'LIMITED');

-- CreateEnum
CREATE TYPE "PortfolioType" AS ENUM ('COLLECTION', 'TRADES', 'BULK');

-- CreateEnum
CREATE TYPE "DeckZone" AS ENUM ('MAIN', 'EXTRA', 'SIDE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "tier" "UserTier" NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cards" (
    "id" TEXT NOT NULL,
    "konamiId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameDe" TEXT,
    "type" TEXT NOT NULL,
    "frameType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "race" TEXT,
    "atk" INTEGER,
    "def" INTEGER,
    "level" INTEGER,
    "attribute" TEXT,
    "archetype" TEXT,
    "imageUrl" TEXT NOT NULL,
    "imageUrlSmall" TEXT,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "printings" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "setCode" TEXT NOT NULL,
    "setName" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "rarityCode" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "priceUpdatedAt" TIMESTAMP(3),

    CONSTRAINT "printings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "printingId" TEXT NOT NULL,
    "condition" "CardCondition" NOT NULL DEFAULT 'NEAR_MINT',
    "language" TEXT NOT NULL DEFAULT 'EN',
    "edition" "CardEdition" NOT NULL DEFAULT 'UNLIMITED',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "purchasePrice" DOUBLE PRECISION,
    "storageLocation" TEXT,
    "portfolio" "PortfolioType" NOT NULL DEFAULT 'COLLECTION',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "want_list_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "printingId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "maxPrice" DOUBLE PRECISION,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "want_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "format" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "decks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deck_cards" (
    "id" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "printingId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "deckZone" "DeckZone" NOT NULL DEFAULT 'MAIN',

    CONSTRAINT "deck_cards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "cards_konamiId_key" ON "cards"("konamiId");

-- CreateIndex
CREATE INDEX "cards_name_idx" ON "cards"("name");

-- CreateIndex
CREATE INDEX "cards_konamiId_idx" ON "cards"("konamiId");

-- CreateIndex
CREATE INDEX "printings_setCode_idx" ON "printings"("setCode");

-- CreateIndex
CREATE UNIQUE INDEX "printings_cardId_setCode_key" ON "printings"("cardId", "setCode");

-- CreateIndex
CREATE INDEX "collection_items_userId_idx" ON "collection_items"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "collection_items_userId_printingId_condition_language_editi_key" ON "collection_items"("userId", "printingId", "condition", "language", "edition");

-- CreateIndex
CREATE UNIQUE INDEX "want_list_items_userId_printingId_key" ON "want_list_items"("userId", "printingId");

-- CreateIndex
CREATE INDEX "decks_userId_idx" ON "decks"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "deck_cards_deckId_printingId_deckZone_key" ON "deck_cards"("deckId", "printingId", "deckZone");

-- AddForeignKey
ALTER TABLE "printings" ADD CONSTRAINT "printings_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_printingId_fkey" FOREIGN KEY ("printingId") REFERENCES "printings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "want_list_items" ADD CONSTRAINT "want_list_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "want_list_items" ADD CONSTRAINT "want_list_items_printingId_fkey" FOREIGN KEY ("printingId") REFERENCES "printings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decks" ADD CONSTRAINT "decks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deck_cards" ADD CONSTRAINT "deck_cards_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deck_cards" ADD CONSTRAINT "deck_cards_printingId_fkey" FOREIGN KEY ("printingId") REFERENCES "printings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
