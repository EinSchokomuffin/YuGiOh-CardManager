import { IsString, IsOptional, IsBoolean, IsArray, ValidateNested, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum DeckZone {
  MAIN = 'MAIN',
  EXTRA = 'EXTRA',
  SIDE = 'SIDE',
}

export class DeckCardDto {
  @ApiProperty({ description: 'Printing UUID' })
  @IsString()
  printingId: string;

  @ApiPropertyOptional({ description: 'Quantity', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3)
  quantity?: number;

  @ApiPropertyOptional({ enum: DeckZone, default: DeckZone.MAIN })
  @IsOptional()
  @IsEnum(DeckZone)
  zone?: DeckZone;
}

export class CreateDeckDto {
  @ApiProperty({ description: 'Deck name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Deck description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Format (e.g., TCG, OCG, Master Duel)' })
  @IsOptional()
  @IsString()
  format?: string;

  @ApiPropertyOptional({ description: 'Make deck public', default: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Initial cards in the deck', type: [DeckCardDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeckCardDto)
  cards?: DeckCardDto[];
}
