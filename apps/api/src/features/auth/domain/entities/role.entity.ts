import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
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

  // RolePermission과의 관계는 직접적인 관계가 없으므로 제거
  // permissions: RolePermission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // RoleType 인터페이스와 호환성을 위한 변환 메서드
  toRoleType(): RoleType {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      isSystem: this.isSystem,
      permissions: [], // RolePermission은 별도로 관리되므로 빈 배열로 설정
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
