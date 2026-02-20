import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable, Index } from 'typeorm';
import { Role } from '../auth/role.entity';
import { Session } from '../sessions/session.entity';
import { AuditLog } from '../audit/audit-log.entity';

@Entity('users')
@Index(['email'])
@Index(['preferredUsername'])
@Index(['isActive', 'deletedAt'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column({ default: false })
  emailVerified: boolean;

  @Column()
  name: string;

  @Column({ unique: true, nullable: true })
  @Index()
  preferredUsername: string;

  @Column({ nullable: true })
  passwordHash: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ default: false })
  phoneVerified: boolean;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ default: 'en' })
  locale: string;

  @Column({ nullable: true })
  timezone: string;

  @Column({ type: 'simple-json', default: {} })
  metadata: Record<string, any>;

  // Security
  @Column({ default: false })
  twoFactorEnabled: boolean;

  @Column({ default: false })
  backupCodesGenerated: boolean;

  @Column({ nullable: true })
  mfaSecret: string;

  @Column({ default: false })
  mfaEnabled: boolean;

  @Column({ type: 'simple-json', nullable: true })
  backupCodes: string[];

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ nullable: true })
  lockedUntil: Date;

  // Tracking
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ nullable: true })
  lastPasswordChangeAt: Date;

  // Soft delete
  @Column({ nullable: true })
  deletedAt: Date;

  @Column({ default: true })
  isActive: boolean;

  // Relations
  @ManyToMany(() => Role, { cascade: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @OneToMany(() => Session, session => session.user)
  sessions: Session[];

  @OneToMany(() => AuditLog, auditLog => auditLog.user)
  auditLogs: AuditLog[];
}
