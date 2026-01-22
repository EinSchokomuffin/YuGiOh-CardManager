-- CreateEnum
CREATE TYPE "SearchLanguage" AS ENUM ('DE', 'EN', 'FR', 'IT', 'PT');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "searchLanguage" "SearchLanguage" NOT NULL DEFAULT 'DE';
