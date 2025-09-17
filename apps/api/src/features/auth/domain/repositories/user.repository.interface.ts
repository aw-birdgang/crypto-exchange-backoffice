import { User } from '../entities/user.entity';

export interface UserRepositoryInterface {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: Partial<User>): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
  findAll(): Promise<User[]>;
}
