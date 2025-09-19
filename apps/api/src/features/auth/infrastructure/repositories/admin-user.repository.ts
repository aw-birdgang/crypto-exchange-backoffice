import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUser } from '../../domain/entities/admin-user.entity';
import { AdminUserRepositoryInterface } from '../../domain/repositories/admin-user.repository.interface';

@Injectable()
export class AdminUserRepository implements AdminUserRepositoryInterface {
  constructor(
    @InjectRepository(AdminUser)
    private readonly adminUserRepository: Repository<AdminUser>,
  ) {}

  async findById(id: string): Promise<AdminUser | null> {
    return this.adminUserRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<AdminUser | null> {
    return this.adminUserRepository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<AdminUser | null> {
    return this.adminUserRepository.findOne({ where: { username } });
  }

  async create(adminUser: Partial<AdminUser>): Promise<AdminUser> {
    const newAdminUser = this.adminUserRepository.create(adminUser);
    return this.adminUserRepository.save(newAdminUser);
  }

  async update(id: string, adminUser: Partial<AdminUser>): Promise<AdminUser> {
    await this.adminUserRepository.update(id, adminUser);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`AdminUser with id ${id} not found`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.adminUserRepository.delete(id);
  }

  async findAll(): Promise<AdminUser[]> {
    return this.adminUserRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findAllWithPagination(page: number = 1, limit: number = 10): Promise<{ adminUsers: AdminUser[]; total: number }> {
    const [adminUsers, total] = await this.adminUserRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { adminUsers, total };
  }

  async findByRole(role: string): Promise<AdminUser[]> {
    return this.adminUserRepository.find({
      where: { adminRole: role as any },
      order: { createdAt: 'DESC' },
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.adminUserRepository.update(id, { lastLoginAt: new Date() });
  }
}
