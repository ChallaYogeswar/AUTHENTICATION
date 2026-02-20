import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepository: Repository<AuditLog>,
  ) {}

  async logAction(
    userId: string,
    action: string,
    details: any,
    ipAddress: string,
    userAgent: string,
  ): Promise<void> {
    const auditLog = this.auditRepository.create({
      userId,
      action,
      details,
      ipAddress,
      userAgent,
    });

    await this.auditRepository.save(auditLog);
  }

  async getUserActivity(userId: string, limit = 50): Promise<AuditLog[]> {
    return this.auditRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
