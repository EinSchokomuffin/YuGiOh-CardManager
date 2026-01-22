import { IsOptional, IsString, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CardCondition, PortfolioType } from './add-to-collection.dto';

export class GetCollectionDto {
  @ApiPropertyOptional({ enum: PortfolioType })
  @IsOptional()
  @IsEnum(PortfolioType)
  portfolio?: PortfolioType;

  @ApiPropertyOptional({ enum: CardCondition })
  @IsOptional()
  @IsEnum(CardCondition)
  condition?: CardCondition;

  @ApiPropertyOptional({ description: 'Card name search' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by set code' })
  @IsOptional()
  @IsString()
  setCode?: string;

  @ApiPropertyOptional({ description: 'Sort field', default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort order', default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({ description: 'Number of results to return', default: 50 })
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
