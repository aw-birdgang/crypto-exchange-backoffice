import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity, AdminUserRole, Resource, Permission } from '@crypto-exchange/shared';
import { Role } from './role.entity';

@Entity('role_permissions')
export class RolePermission implements BaseEntity {
  @ApiProperty({
    description: '역할 권한 고유 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: '역할 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid'
  })
  @Column('uuid')
  roleId: string;

  @ApiProperty({
    description: '사용자 역할',
    enum: AdminUserRole,
    example: AdminUserRole.ADMIN
  })
  // Role과의 관계로 변경
  @ManyToOne(() => Role, role => role.permissions)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @ApiProperty({
    description: '리소스',
    enum: Resource,
    example: Resource.DASHBOARD
  })
  @Column({ type: 'enum', enum: Resource })
  resource: Resource;

  @ApiProperty({
    description: '권한 목록',
    enum: Permission,
    isArray: true,
    example: [Permission.CREATE, Permission.READ, Permission.UPDATE, Permission.DELETE]
  })
  @Column('json')
  permissions: Permission[];

  @ApiProperty({
    description: '생성일시',
    example: '2024-01-01T00:00:00.000Z',
    format: 'date-time'
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: '수정일시',
    example: '2024-01-01T00:00:00.000Z',
    format: 'date-time'
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
