import { IsNumber, Min, Max, IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CardCondition, CardEdition, PortfolioType } from './add-to-collection.dto';

export class UpdateCollectionItemDto {
  @ApiPropertyOptional({ description: 'New quantity' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(999)
  quantity?: number;

  @ApiPropertyOptional({ enum: CardCondition })
  @IsOptional()
  @IsEnum(CardCondition)
  condition?: CardCondition;

  @ApiPropertyOptional({ enum: CardEdition })
  @IsOptional()
  @IsEnum(CardEdition)
  edition?: CardEdition;

  @ApiPropertyOptional({ description: 'Purchase price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchasePrice?: number;

  @ApiPropertyOptional({ description: 'Storage location' })
  @IsOptional()
  @IsString()
  storageLocation?: string;

  @ApiPropertyOptional({ enum: PortfolioType })
  @IsOptional()
  @IsEnum(PortfolioType)
  portfolio?: PortfolioType;
}
