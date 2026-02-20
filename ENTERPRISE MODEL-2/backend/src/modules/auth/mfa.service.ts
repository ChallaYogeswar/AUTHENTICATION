import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class MfaService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private auditService: AuditService,
  ) {}

  async generateTOTPSecret(userId: string): Promise<{ secret: string; qrCodeUrl: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const secret = speakeasy.generateSecret({
      name: `Enterprise Auth (${user.email})`,
      issuer: 'Enterprise Auth',
    });

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    // Store the secret temporarily (in production, use encrypted storage)
    user.mfaSecret = secret.base32;
    await this.userRepository.save(user);

    await this.auditService.log({
      userId,
      eventType: 'mfa.secret_generated',
      eventCategory: 'security',
      action: 'create',
      resourceType: 'mfa',
      status: 'success',
      message: 'TOTP secret generated for user',
    });

    return { secret: secret.base32, qrCodeUrl };
  }

  async verifyTOTPCode(userId: string, code: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.mfaSecret) return false;

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: code,
      window: 2, // Allow 2 time windows (30 seconds each)
    });

    if (verified) {
      await this.auditService.log({
        userId,
        eventType: 'mfa.totp_verified',
        eventCategory: 'security',
        action: 'verify',
        resourceType: 'mfa',
        status: 'success',
        message: 'TOTP code verified successfully',
      });
    } else {
      await this.auditService.log({
        userId,
        eventType: 'mfa.totp_failed',
        eventCategory: 'security',
        action: 'verify',
        resourceType: 'mfa',
        status: 'failure',
        message: 'TOTP code verification failed',
      });
    }

    return verified;
  }

  async enableMFA(userId: string, code: string): Promise<boolean> {
    const isValid = await this.verifyTOTPCode(userId, code);
    if (!isValid) return false;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    user.mfaEnabled = true;
    await this.userRepository.save(user);

    await this.auditService.log({
      userId,
      eventType: 'mfa.enabled',
      eventCategory: 'security',
      action: 'update',
      resourceType: 'user',
      status: 'success',
      message: 'MFA enabled for user',
    });

    return true;
  }

  async disableMFA(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    user.mfaEnabled = false;
    user.mfaSecret = null;
    await this.userRepository.save(user);

    await this.auditService.log({
      userId,
      eventType: 'mfa.disabled',
      eventCategory: 'security',
      action: 'update',
      resourceType: 'user',
      status: 'success',
      message: 'MFA disabled for user',
    });
  }

  async generateBackupCodes(userId: string): Promise<string[]> {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(this.generateBackupCode());
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    user.backupCodes = codes;
    await this.userRepository.save(user);

    await this.auditService.log({
      userId,
      eventType: 'mfa.backup_codes_generated',
      eventCategory: 'security',
      action: 'create',
      resourceType: 'mfa',
      status: 'success',
      message: 'Backup codes generated for user',
    });

    return codes;
  }

  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.backupCodes) return false;

    const codeIndex = user.backupCodes.indexOf(code);
    if (codeIndex === -1) return false;

    // Remove the used code
    user.backupCodes.splice(codeIndex, 1);
    await this.userRepository.save(user);

    await this.auditService.log({
      userId,
      eventType: 'mfa.backup_code_used',
      eventCategory: 'security',
      action: 'update',
      resourceType: 'mfa',
      status: 'success',
      message: 'Backup code used for MFA verification',
    });

    return true;
  }

  private generateBackupCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }
}
