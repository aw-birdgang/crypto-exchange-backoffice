import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AdminUserRole } from '@crypto-exchange/shared';

@Entity('admin_users')
export class AdminUser {
  @ApiProperty({
    description: '관리자 고유 ID',
    example: 'cmfkr31v7000wcm9urdbekf4u',
    format: 'string'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: '관리자 이메일 주소',
    example: 'superadmin@crypto-exchange.com',
    format: 'email'
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    description: '관리자 사용자명',
    example: 'superadmin'
  })
  @Column()
  username: string;

  @ApiProperty({
    description: '암호화된 비밀번호',
    example: '$2a$10$Wqz8OVz2Ke.YtRtO8HZlwu.cNvbf.ssUEgIkV4vs96VHANWvE/1k6',
    writeOnly: true
  })
  @Column()
  password: string;

  @ApiProperty({
    description: '관리자 이름',
    example: 'Super'
  })
  @Column()
  firstName: string;

  @ApiProperty({
    description: '관리자 성',
    example: 'Admin'
  })
  @Column()
  lastName: string;

  @ApiProperty({
    description: '관리자 역할',
    enum: AdminUserRole,
    example: AdminUserRole.SUPER_ADMIN
  })
  @Column({ type: 'enum', enum: AdminUserRole })
  adminRole: AdminUserRole;

  @ApiProperty({
    description: '권한 목록',
    example: ['users:read', 'users:create', 'users:update', 'users:delete'],
    isArray: true
  })
  @Column('json')
  permissions: string[];

  @ApiProperty({
    description: '관리자 활성 상태',
    example: true,
    default: true
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: '계정 상태',
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
    example: 'PENDING',
    default: 'PENDING'
  })
  @Column({ 
    type: 'enum', 
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
    default: 'PENDING'
  })
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

  @ApiProperty({
    description: '승인자 ID',
    example: 'cmfkr31v7000wcm9urdbekf4u',
    nullable: true
  })
  @Column({ nullable: true })
  approvedBy: string;

  @ApiProperty({
    description: '승인일시',
    example: '2025-09-15T09:14:56.270Z',
    format: 'date-time',
    nullable: true
  })
  @Column({ nullable: true })
  approvedAt: Date;

  @ApiProperty({
    description: '마지막 로그인 시간',
    example: '2025-09-15T09:14:56.270Z',
    format: 'date-time'
  })
  @Column({ nullable: true })
  lastLoginAt: Date;

  @ApiProperty({
    description: '생성일시',
    example: '2025-09-15T06:36:00.692Z',
    format: 'date-time'
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: '수정일시',
    example: '2025-09-15T09:14:56.270Z',
    format: 'date-time'
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    description: '생성자',
    example: 'system'
  })
  @Column({ nullable: true })
  createdBy: string;

  @ApiProperty({
    description: '수정자',
    example: 'superadmin@crypto-exchange.com'
  })
  @Column({ nullable: true })
  updatedBy: string;
}
