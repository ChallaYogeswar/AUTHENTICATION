import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './session.entity';
import { AuditLog } from '../audit/audit-log.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async findAll(userId: string): Promise<Session[]> {
    return this.sessionRepository.find({
      where: { userId },
      order: { lastActivityAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Session> {
    return this.sessionRepository.findOne({
      where: { id, userId },
    });
  }

  async revokeSession(id: string, userId: string): Promise<void> {
    const session = await this.findOne(id, userId);
    if (session) {
      await this.sessionRepository.update(id, {
        revoked: true,
        revokedAt: new Date(),
        revokeReason: 'User requested revocation',
      });

      // Log the revocation
      await this.auditLogRepository.save({
        userId,
        eventType: 'session.revoked',
        eventCategory: 'security',
        action: 'update',
        resourceType: 'session',
        resourceId: id,
        status: 'success',
        message: 'Session revoked by user',
      });
    }
  }

  async revokeAllSessions(userId: string, exceptCurrent?: string): Promise<void> {
    const query = this.sessionRepository
      .createQueryBuilder()
      .update(Session)
      .set({
        revoked: true,
        revokedAt: new Date(),
        revokeReason: 'All sessions revoked',
      })
      .where('userId = :userId', { userId });

    if (exceptCurrent) {
      query.andWhere('id != :exceptCurrent', { exceptCurrent });
    }

    await query.execute();

    // Log the mass revocation
    await this.auditLogRepository.save({
      userId,
      eventType: 'session.all_revoked',
      eventCategory: 'security',
      action: 'update',
      resourceType: 'session',
      status: 'success',
      message: 'All user sessions revoked',
    });
  }

  async updateLastActivity(sessionId: string): Promise<void> {
    await this.sessionRepository.update(sessionId, {
      lastActivityAt: new Date(),
    });
  }

  async cleanupExpiredSessions(): Promise<void> {
    await this.sessionRepository
      .createQueryBuilder()
      .update(Session)
      .set({ revoked: true, revokeReason: 'Expired' })
      .where('expiresAt < NOW() AND revoked = FALSE')
      .execute();
  }
}
