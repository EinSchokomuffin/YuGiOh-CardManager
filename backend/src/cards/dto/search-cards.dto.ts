import { IsOptional, IsString, IsNumber, Min, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SearchCardsDto {
  @ApiPropertyOptional({ description: 'Card name (partial match)' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Search language for card names', enum: ['DE', 'EN', 'FR', 'IT', 'PT'] })
  @IsOptional()
  @IsString()
  @IsIn(['DE', 'EN', 'FR', 'IT', 'PT'])
  language?: string;

  @ApiPropertyOptional({ description: 'Card type (e.g., "Effect Monster")' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Archetype name' })
  @IsOptional()
  @IsString()
  archetype?: string;

  @ApiPropertyOptional({ description: 'Card attribute (e.g., "DARK", "LIGHT")' })
  @IsOptional()
  @IsString()
  attribute?: string;

  @ApiPropertyOptional({ description: 'Number of results to return', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ description: 'Number of results to skip', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number;
}
