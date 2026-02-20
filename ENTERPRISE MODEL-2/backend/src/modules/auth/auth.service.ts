import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { User } from '../users/user.entity';
import { Session } from '../sessions/session.entity';
import { AuditLog } from '../audit/audit-log.entity';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { RegisterDto, RegisterResponseDto } from './dto/register.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    const { email, password, ...userData } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await argon2.hash(password);

    // Create user
    const user = this.userRepository.create({
      email,
      passwordHash,
      ...userData,
    });

    const savedUser = await this.userRepository.save(user);

    // Log registration
    await this.auditLogRepository.save({
      userId: savedUser.id,
      eventType: 'user.registered',
      eventCategory: 'auth',
      action: 'create',
      resourceType: 'user',
      resourceId: savedUser.id,
      status: 'success',
      message: 'User account created',
      ipAddress: 'system', // Will be set by interceptor
    });

    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
        emailVerified: savedUser.emailVerified,
      },
      message: 'User registered successfully',
    };
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { email, password, deviceId, deviceName, userAgent, ipAddress } = loginDto;

    // Find user
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['roles'],
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account is temporarily locked');
    }

    // Verify password
    const isPasswordValid = await argon2.verify(user.passwordHash, password);
    if (!isPasswordValid) {
      // Increment failed attempts
      await this.userRepository.update(user.id, {
        failedLoginAttempts: user.failedLoginAttempts + 1,
      });

      // Lock account if too many attempts
      if (user.failedLoginAttempts >= 5) {
        await this.userRepository.update(user.id, {
          lockedUntil: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        });
      }

      // Log failed login
      await this.auditLogRepository.save({
        userId: user.id,
        eventType: 'auth.login.failed',
        eventCategory: 'auth',
        action: 'login',
        status: 'failure',
        message: 'Invalid password',
        ipAddress,
        userAgent,
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts
    await this.userRepository.update(user.id, {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    });

    // Check if MFA is required
    if (user.twoFactorEnabled) {
      const mfaSession = randomBytes(32).toString('hex');
      // Store MFA session in Redis (simplified for now)
      return {
        accessToken: '',
        refreshToken: '',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          twoFactorEnabled: true,
        },
        requiresMfa: true,
        mfaSession,
      };
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    // Create session
    await this.sessionRepository.save({
      userId: user.id,
      accessTokenHash: await argon2.hash(accessToken),
      refreshTokenHash: await argon2.hash(refreshToken),
      deviceId,
      deviceName,
      userAgent,
      ipAddress,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Log successful login
    await this.auditLogRepository.save({
      userId: user.id,
      eventType: 'auth.login.success',
      eventCategory: 'auth',
      action: 'login',
      status: 'success',
      message: 'User logged in successfully',
      ipAddress,
      userAgent,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        twoFactorEnabled: false,
      },
    };
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles?.map(r => r.name) || [],
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }

  async logout(userId: string, refreshToken: string) {
    // Revoke session
    const session = await this.sessionRepository.findOne({
      where: { userId, refreshTokenHash: await argon2.hash(refreshToken) },
    });

    if (session) {
      await this.sessionRepository.update(session.id, { revoked: true });
    }

    // Log logout
    await this.auditLogRepository.save({
      userId,
      eventType: 'auth.logout',
      eventCategory: 'auth',
      action: 'logout',
      status: 'success',
      message: 'User logged out',
    });
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        relations: ['roles'],
      });

      if (!user) {
        throw new UnauthorizedException();
      }

      // Check if refresh token is valid in database
      const session = await this.sessionRepository.findOne({
        where: {
          userId: user.id,
          refreshTokenHash: await argon2.hash(refreshToken),
          revoked: false,
          expiresAt: new Date(),
        },
      });

      if (!session) {
        throw new UnauthorizedException();
      }

      const tokens = await this.generateTokens(user);
      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
