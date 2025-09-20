import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { Role as RoleType } from '@crypto-exchange/shared';
import { RolePermission } from './role-permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  isSystem: boolean;

  // RolePermission과의 관계 추가
  @OneToMany(() => RolePermission, rolePermission => rolePermission.role)
  permissions: RolePermission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // RoleType 인터페이스와 호환성을 위한 변환 메서드
  toRoleType(): RoleType {
    console.log('🔍 Role.toRoleType - Role:', this.name);
    console.log('🔍 Role.toRoleType - Permissions count:', this.permissions?.length || 0);
    
    // permissions가 없거나 빈 배열인 경우 처리
    if (!this.permissions || this.permissions.length === 0) {
      console.log('🔍 Role.toRoleType - No permissions found for role:', this.name);
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        isSystem: this.isSystem,
        permissions: [], // 빈 배열 반환
        createdAt: this.createdAt.toISOString(),
        updatedAt: this.updatedAt.toISOString(),
      };
    }
    
    console.log('🔍 Role.toRoleType - Permissions details:', this.permissions.map(p => ({
      id: p.id,
      role: p.role ? p.role.name : 'NULL_ROLE',
      resource: p.resource,
      permissions: p.permissions
    })));
    
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      isSystem: this.isSystem,
      permissions: this.permissions.map(p => ({
        id: p.id,
        role: p.role?.name as any || 'unknown', // 안전한 접근
        resource: p.resource,
        permissions: p.permissions,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })), // 실제 권한 데이터 사용 및 타입 변환
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
