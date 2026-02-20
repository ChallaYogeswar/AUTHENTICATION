import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(event: {
    userId?: string;
    eventType: string;
    eventCategory?: string;
    action: string;
    resourceType?: string;
    resourceId?: string;
    status: string;
    severity?: string;
    message?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    requestId?: string;
  }): Promise<void> {
    const auditLog = this.auditLogRepository.create({
      ...event,
      createdAt: new Date(),
    });

    await this.auditLogRepository.save(auditLog);
  }

  async findAll(filters?: {
    userId?: string;
    eventType?: string;
    eventCategory?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<[AuditLog[], number]> {
    const query = this.auditLogRepository
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user')
      .orderBy('audit.createdAt', 'DESC');

    if (filters?.userId) {
      query.andWhere('audit.userId = :userId', { userId: filters.userId });
    }

    if (filters?.eventType) {
      query.andWhere('audit.eventType = :eventType', { eventType: filters.eventType });
    }

    if (filters?.eventCategory) {
      query.andWhere('audit.eventCategory = :eventCategory', { eventCategory: filters.eventCategory });
    }

    if (filters?.startDate) {
      query.andWhere('audit.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('audit.createdAt <= :endDate', { endDate: filters.endDate });
    }

    if (filters?.limit) {
      query.limit(filters.limit);
    }

    if (filters?.offset) {
      query.offset(filters.offset);
    }

    return query.getManyAndCount();
  }

  async getUserActivity(userId: string, limit = 50): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getSecurityEvents(limit = 100): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { eventCategory: 'security' },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async cleanupOldLogs(daysToKeep = 365): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    await this.auditLogRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .andWhere('expiresAt IS NULL OR expiresAt < NOW()')
      .execute();
  }
}
