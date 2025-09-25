import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { LogCategory, LogSeverity } from './audit-log.entity';

@Entity('log_categories')
export class LogCategoryEntity {
  @ApiProperty({
    description: '카테고리 고유 ID',
    example: 'cmfkr31v7000wcm9urdbekf4u'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: '카테고리 이름',
    example: 'authentication'
  })
  @Column({ unique: true })
  name: string;

  @ApiProperty({
    description: '카테고리 설명',
    example: '인증 관련 로그'
  })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({
    description: '기본 심각도',
    enum: LogSeverity,
    example: LogSeverity.MEDIUM
  })
  @Column({ type: 'enum', enum: LogSeverity })
  defaultSeverity: LogSeverity;

  @ApiProperty({
    description: '보존 기간 (일)',
    example: 365
  })
  @Column()
  retentionDays: number;

  @ApiProperty({
    description: '활성 상태',
    example: true
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: '생성일시'
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: '수정일시'
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
