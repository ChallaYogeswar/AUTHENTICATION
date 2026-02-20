import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MfaService } from './mfa.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('mfa')
@Controller('mfa')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MfaController {
  constructor(private readonly mfaService: MfaService) {}

  @Post('setup')
  @ApiOperation({ summary: 'Generate TOTP secret and QR code for MFA setup' })
  @ApiResponse({ status: 200, description: 'MFA setup data generated successfully' })
  async setup(@Request() req) {
    return this.mfaService.generateTOTPSecret(req.user.id);
  }

  @Post('enable')
  @ApiOperation({ summary: 'Enable MFA with verification code' })
  @ApiResponse({ status: 200, description: 'MFA enabled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid verification code' })
  async enable(@Request() req, @Body() body: { code: string }) {
    const success = await this.mfaService.enableMFA(req.user.id, body.code);
    if (!success) {
      throw new Error('Invalid verification code');
    }
    return { success: true, message: 'MFA enabled successfully' };
  }

  @Post('disable')
  @ApiOperation({ summary: 'Disable MFA' })
  @ApiResponse({ status: 200, description: 'MFA disabled successfully' })
  async disable(@Request() req) {
    await this.mfaService.disableMFA(req.user.id);
    return { success: true, message: 'MFA disabled successfully' };
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify MFA code' })
  @ApiResponse({ status: 200, description: 'Code verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid code' })
  async verify(@Request() req, @Body() body: { code: string }) {
    const valid = await this.mfaService.verifyTOTPCode(req.user.id, body.code);
    if (!valid) {
      throw new Error('Invalid MFA code');
    }
    return { success: true, message: 'MFA code verified' };
  }

  @Post('backup-codes')
  @ApiOperation({ summary: 'Generate backup codes' })
  @ApiResponse({ status: 200, description: 'Backup codes generated successfully' })
  async generateBackupCodes(@Request() req) {
    const codes = await this.mfaService.generateBackupCodes(req.user.id);
    return { success: true, backupCodes: codes };
  }

  @Post('verify-backup')
  @ApiOperation({ summary: 'Verify backup code' })
  @ApiResponse({ status: 200, description: 'Backup code verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid backup code' })
  async verifyBackupCode(@Request() req, @Body() body: { code: string }) {
    const valid = await this.mfaService.verifyBackupCode(req.user.id, body.code);
    if (!valid) {
      throw new Error('Invalid backup code');
    }
    return { success: true, message: 'Backup code verified' };
  }
}
