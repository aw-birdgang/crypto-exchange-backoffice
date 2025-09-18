import { AdminUser } from '../entities/admin-user.entity';

export interface AdminUserRepositoryInterface {
  findById(id: string): Promise<AdminUser | null>;
  findByEmail(email: string): Promise<AdminUser | null>;
  findByUsername(username: string): Promise<AdminUser | null>;
  create(adminUser: Partial<AdminUser>): Promise<AdminUser>;
  update(id: string, adminUser: Partial<AdminUser>): Promise<AdminUser>;
  delete(id: string): Promise<void>;
  findAll(): Promise<AdminUser[]>;
  findAllWithPagination(page: number, limit: number): Promise<{ adminUsers: AdminUser[]; total: number }>;
  findByRole(role: string): Promise<AdminUser[]>;
  updateLastLogin(id: string): Promise<void>;
}
