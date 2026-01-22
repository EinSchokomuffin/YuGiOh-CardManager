import { Controller, Post, Get, Body, UseGuards, Request, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, UpdatePreferencesDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Neuen Benutzer registrieren' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Benutzer anmelden' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Benutzerprofil abrufen' })
  async getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.userId);
  }

  @Patch('preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Benutzereinstellungen aktualisieren' })
  async updatePreferences(@Request() req: any, @Body() dto: UpdatePreferencesDto) {
    return this.authService.updatePreferences(req.user.userId, dto);
  }
}
