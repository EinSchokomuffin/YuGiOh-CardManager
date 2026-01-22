import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'duelist123' })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;
}

export class UpdatePreferencesDto {
  @ApiPropertyOptional({ example: 'DE', enum: ['DE', 'EN', 'FR', 'IT', 'PT'] })
  @IsOptional()
  @IsString()
  @IsIn(['DE', 'EN', 'FR', 'IT', 'PT'])
  searchLanguage?: string;
}

export class AuthResponse {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  user: {
    id: string;
    email: string;
    username: string;
    tier: string;
    searchLanguage: string;
  };
}
