import { IsString, IsEnum, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum CardCondition {
  MINT = 'MINT',
  NEAR_MINT = 'NEAR_MINT',
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  LIGHT_PLAYED = 'LIGHT_PLAYED',
  PLAYED = 'PLAYED',
  POOR = 'POOR',
}

export enum CardEdition {
  FIRST_EDITION = 'FIRST_EDITION',
  UNLIMITED = 'UNLIMITED',
  LIMITED = 'LIMITED',
}

export enum PortfolioType {
  COLLECTION = 'COLLECTION',
  TRADES = 'TRADES',
  BULK = 'BULK',
}

export class AddToCollectionDto {
  @ApiProperty({ description: 'Printing UUID' })
  @IsString()
  printingId: string;

  @ApiPropertyOptional({ enum: CardCondition, default: CardCondition.NEAR_MINT })
  @IsOptional()
  @IsEnum(CardCondition)
  condition?: CardCondition;

  @ApiPropertyOptional({ description: 'Language code (EN, DE, FR, etc.)', default: 'EN' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ enum: CardEdition, default: CardEdition.UNLIMITED })
  @IsOptional()
  @IsEnum(CardEdition)
  edition?: CardEdition;

  @ApiPropertyOptional({ description: 'Quantity', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(999)
  quantity?: number;

  @ApiPropertyOptional({ description: 'Purchase price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchasePrice?: number;

  @ApiPropertyOptional({ description: 'Storage location (e.g., "Binder A")' })
  @IsOptional()
  @IsString()
  storageLocation?: string;

  @ApiPropertyOptional({ enum: PortfolioType, default: PortfolioType.COLLECTION })
  @IsOptional()
  @IsEnum(PortfolioType)
  portfolio?: PortfolioType;
}
