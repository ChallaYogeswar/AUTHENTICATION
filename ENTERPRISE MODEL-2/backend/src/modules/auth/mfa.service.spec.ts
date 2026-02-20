import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MfaService } from './mfa.service';
import { User } from '../users/user.entity';
import { AuditService } from '../audit/audit.service';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

jest.mock('speakeasy');
jest.mock('qrcode');

describe('MfaService', () => {
  let service: MfaService;
  let userRepository: Repository<User>;
  let auditService: AuditService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MfaService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: AuditService,
          useValue: {
            log: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MfaService>(MfaService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    auditService = module.get<AuditService>(AuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateTOTPSecret', () => {
    it('should generate TOTP secret and QR code', async () => {
      const userId = '1';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        mfaSecret: null,
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser as any);

      (speakeasy.generateSecret as jest.Mock).mockReturnValue({
        base32: 'TESTSECRET123456',
        otpauth_url: 'otpauth://totp/Enterprise%20Auth%20(test%40example.com)',
      });

      (qrcode.toDataURL as jest.Mock).mockResolvedValue('data:image/png;base64,iVBORw0KGgoAAAANS...');

      const result = await service.generateTOTPSecret(userId);

      expect(result.secret).toBe('TESTSECRET123456');
      expect(result.qrCodeUrl).toBeDefined();
      expect(result.qrCodeUrl).toMatch(/^data:image\/png/);
    });

    it('should throw error if user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.generateTOTPSecret('1')).rejects.toThrow('User not found');
    });
  });

  describe('verifyTOTPCode', () => {
    it('should verify valid TOTP code', async () => {
      const userId = '1';
      const mockUser = {
        id: userId,
        mfaSecret: 'JBSWY3DPEHPK3PXP',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
      (speakeasy.totp.verify as jest.Mock).mockReturnValue(true);

      const result = await service.verifyTOTPCode(userId, '123456');

      expect(result).toBe(true);
      expect(speakeasy.totp.verify).toHaveBeenCalledWith({
        secret: 'JBSWY3DPEHPK3PXP',
        encoding: 'base32',
        token: '123456',
        window: 2,
      });
    });

    it('should return false for invalid code', async () => {
      const userId = '1';
      const mockUser = {
        id: userId,
        mfaSecret: 'JBSWY3DPEHPK3PXP',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
      (speakeasy.totp.verify as jest.Mock).mockReturnValue(false);

      const result = await service.verifyTOTPCode(userId, 'invalid');

      expect(result).toBe(false);
    });
  });

  describe('enableMFA', () => {
    it('should enable MFA for user', async () => {
      const userId = '1';
      const mockUser = {
        id: userId,
        mfaEnabled: false,
        mfaSecret: 'JBSWY3DPEHPK3PXP',
      };

      jest.spyOn(service, 'verifyTOTPCode').mockResolvedValue(true);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue({ ...mockUser, mfaEnabled: true } as any);

      const result = await service.enableMFA(userId, '123456');

      expect(result).toBe(true);
    });
  });

  describe('generateBackupCodes', () => {
    it('should generate backup codes', async () => {
      const userId = '1';
      const mockUser = {
        id: userId,
        backupCodes: null,
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser as any);

      const result = await service.generateBackupCodes(userId);

      expect(result).toHaveLength(10);
      expect(result.every((code) => typeof code === 'string')).toBe(true);
    });
  });
});
