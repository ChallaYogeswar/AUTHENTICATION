import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './session.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>,
  ) {}

  async create(sessionData: Partial<Session>): Promise<Session> {
    const session = this.sessionsRepository.create(sessionData);
    return this.sessionsRepository.save(session);
  }

  async findByRefreshToken(refreshToken: string): Promise<Session | null> {
    return this.sessionsRepository.findOne({
      where: { refreshToken, isActive: true },
      relations: ['user'],
    });
  }

  async findByUserId(userId: string): Promise<Session[]> {
    return this.sessionsRepository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async deactivateSession(sessionId: string): Promise<void> {
    await this.sessionsRepository.update(sessionId, { isActive: false });
  }

  async deactivateUserSessions(userId: string): Promise<void> {
    await this.sessionsRepository.update(
      { userId },
      { isActive: false }
    );
  }
}
