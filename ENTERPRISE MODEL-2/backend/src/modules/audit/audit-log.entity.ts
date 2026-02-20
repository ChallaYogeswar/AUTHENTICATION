import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('audit_logs')
@Index(['userId', 'createdAt'])
@Index(['eventType', 'createdAt'])
@Index(['eventCategory', 'createdAt'])
@Index(['resourceType', 'resourceId'])
@Index(['createdAt'])
@Index(['expiresAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Who
  @Column('uuid', { nullable: true })
  @Index()
  userId: string;

  @Column({ default: 'user' })
  actorType: string; // user, system, admin, service

  // What
  @Column()
  @Index()
  eventType: string;

  @Column({ nullable: true })
  @Index()
  eventCategory: string; // auth, security, admin, data

  @Column()
  action: string; // create, read, update, delete

  @Column({ nullable: true })
  resourceType: string;

  @Column({ nullable: true })
  resourceId: string;

  // Details
  @Column({ nullable: true })
  status: string; // success, failure, pending

  @Column({ nullable: true })
  severity: string; // info, warning, error, critical

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'simple-json', default: {} })
  metadata: Record<string, any>;

  // Context
  @Column({ nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column('uuid', { nullable: true })
  sessionId: string;

  @Column({ nullable: true })
  requestId: string;

  // When
  @CreateDateColumn()
  @Index()
  createdAt: Date;

  // Retention
  @Column({ nullable: true })
  @Index()
  expiresAt: Date; // For auto-cleanup

  // Relations
  @ManyToOne(() => User, user => user.auditLogs, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
