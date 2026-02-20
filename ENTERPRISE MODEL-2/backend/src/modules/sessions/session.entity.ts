import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('sessions')
@Index(['userId'])
@Index(['refreshTokenHash'])
@Index(['deviceId'])
@Index(['userId', 'expiresAt', 'revoked'])
@Index(['expiresAt'])
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  userId: string;

  @Column({ nullable: true })
  accessTokenHash: string;

  @Column()
  refreshTokenHash: string;

  // Device info
  @Column({ nullable: true })
  deviceId: string;

  @Column({ nullable: true })
  deviceName: string;

  @Column({ nullable: true })
  deviceType: string; // mobile, desktop, tablet

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ type: 'simple-json', nullable: true })
  location: Record<string, any>; // { city, country, coords }

  // Security
  @Column({ default: false })
  trustedDevice: boolean;

  // Timing
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  lastActivityAt: Date;

  @Column()
  expiresAt: Date;

  // Control
  @Column({ default: false })
  revoked: boolean;

  @Column({ nullable: true })
  revokedAt: Date;

  @Column({ nullable: true })
  revokeReason: string;

  // Relations
  @ManyToOne(() => User, user => user.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
