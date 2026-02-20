import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { AuditLog } from '../audit/audit-log.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['roles'],
      select: ['id', 'email', 'name', 'emailVerified', 'createdAt', 'updatedAt', 'isActive'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'sessions', 'auditLogs'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['roles'],
    });
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findOne(id);

    // Log the update
    await this.auditLogRepository.save({
      userId: id,
      eventType: 'user.updated',
      eventCategory: 'user',
      action: 'update',
      resourceType: 'user',
      resourceId: id,
      status: 'success',
      message: 'User profile updated',
      metadata: updateData,
    });

    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);

    // Soft delete
    await this.userRepository.update(id, {
      deletedAt: new Date(),
      isActive: false,
    });

    // Log the deletion
    await this.auditLogRepository.save({
      userId: id,
      eventType: 'user.deleted',
      eventCategory: 'user',
      action: 'delete',
      resourceType: 'user',
      resourceId: id,
      status: 'success',
      message: 'User account deleted',
    });
  }

  async getUserProfile(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
      select: [
        'id', 'email', 'name', 'preferredUsername', 'avatarUrl',
        'locale', 'timezone', 'emailVerified', 'phoneVerified',
        'twoFactorEnabled', 'createdAt', 'lastLoginAt'
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
