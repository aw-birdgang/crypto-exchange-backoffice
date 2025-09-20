import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../domain/entities/role.entity';
import { RoleRepositoryInterface } from '../../domain/repositories/role.repository.interface';

@Injectable()
export class RoleRepository implements RoleRepositoryInterface {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async findAll(): Promise<Role[]> {
    try {
      console.log('🔍 RoleRepository: Finding all roles...');
      
      // 먼저 테이블이 존재하는지 확인
      const count = await this.roleRepository.count();
      console.log('🔍 RoleRepository: Current role count:', count);
      
      // 역할이 없으면 기본 역할들을 생성
      if (count === 0) {
        console.log('🔍 RoleRepository: No roles found, creating default roles...');
        await this.createDefaultRoles();
      }
      
      const roles = await this.roleRepository.find({
        relations: ['permissions', 'permissions.role'], // 권한 관계와 권한의 역할 관계 포함
        order: { createdAt: 'ASC' },
      });
      console.log('✅ RoleRepository: Found roles:', roles.length);
      console.log('🔍 RoleRepository: Role details:', roles.map(r => ({ 
        id: r.id, 
        name: r.name, 
        description: r.description, 
        isSystem: r.isSystem,
        permissionsCount: r.permissions?.length || 0,
        permissions: r.permissions?.map(p => ({ 
          id: p.id,
          role: p.role ? p.role.name : 'NULL_ROLE',
          resource: p.resource, 
          permissions: p.permissions 
        })) || []
      })));
      return roles;
    } catch (error) {
      console.error('❌ RoleRepository: Error in findAll:', error);
      throw error;
    }
  }

  private async createDefaultRoles(): Promise<void> {
    const defaultRoles = [
      {
        name: 'super_admin',
        description: '최고 관리자 - 모든 권한을 가진 시스템 관리자',
        isSystem: true,
      },
      {
        name: 'admin',
        description: '관리자 - 시스템 관리 권한을 가진 관리자',
        isSystem: true,
      },
      {
        name: 'moderator',
        description: '모더레이터 - 콘텐츠 관리 권한을 가진 사용자',
        isSystem: false,
      },
      {
        name: 'support',
        description: '고객 지원 - 고객 지원 업무를 담당하는 사용자',
        isSystem: false,
      },
      {
        name: 'auditor',
        description: '감사자 - 시스템 감사 및 보안 검토를 담당하는 사용자',
        isSystem: false,
      },
    ];

    for (const roleData of defaultRoles) {
      const role = this.roleRepository.create(roleData);
      await this.roleRepository.save(role);
      console.log(`✅ Created role: ${roleData.name}`);
    }
  }

  async findById(id: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'], // 권한 관계 포함
    });
  }

  async findByName(name: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { name },
    });
  }

  async create(role: Partial<Role>): Promise<Role> {
    console.log('🔍 RoleRepository: Creating role with data:', JSON.stringify(role, null, 2));
    
    try {
      const newRole = this.roleRepository.create(role);
      console.log('🔍 RoleRepository: Created entity:', JSON.stringify(newRole, null, 2));
      
      const savedRole = await this.roleRepository.save(newRole);
      console.log('✅ RoleRepository: Saved role:', JSON.stringify(savedRole, null, 2));
      
      // 저장 후 즉시 조회하여 실제로 저장되었는지 확인
      const verifyRole = await this.roleRepository.findOne({
        where: { id: savedRole.id }
      });
      console.log('🔍 RoleRepository: Verification query result:', JSON.stringify(verifyRole, null, 2));
      
      return savedRole;
    } catch (error) {
      console.error('❌ RoleRepository: Error creating role:', error);
      throw error;
    }
  }

  async update(id: string, role: Partial<Role>): Promise<Role> {
    await this.roleRepository.update(id, role);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`Role with id ${id} not found`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.roleRepository.delete(id);
  }
}
