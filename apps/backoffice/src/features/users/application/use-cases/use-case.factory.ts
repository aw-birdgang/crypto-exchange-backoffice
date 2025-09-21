import { AdminUserService } from '../services/user.service';
import { 
  AdminUserManagementUseCaseImpl, 
  AdminUserValidationUseCaseImpl, 
  AdminUserAnalyticsUseCaseImpl 
} from './user-management.use-case';
import { 
  AdminUserManagementUseCase, 
  AdminUserValidationUseCase, 
  AdminUserAnalyticsUseCase 
} from '../../domain/use-cases/user-management.use-case.interface';

/**
 * Use Case Factory
 * 의존성 주입을 통해 Use Case 인스턴스를 생성
 */
export class UseCaseFactory {
  private static adminUserService: AdminUserService;
  private static adminUserManagementUseCase: AdminUserManagementUseCase;
  private static adminUserValidationUseCase: AdminUserValidationUseCase;
  private static adminUserAnalyticsUseCase: AdminUserAnalyticsUseCase;

  /**
   * AdminUserService 인스턴스 설정 (의존성 주입)
   */
  static setAdminUserService(adminUserService: AdminUserService): void {
    this.adminUserService = adminUserService;
  }

  /**
   * AdminUserManagementUseCase 인스턴스 반환 (싱글톤)
   */
  static getAdminUserManagementUseCase(): AdminUserManagementUseCase {
    if (!this.adminUserManagementUseCase) {
      if (!this.adminUserService) {
        throw new Error('AdminUserService must be set before creating AdminUserManagementUseCase');
      }
      this.adminUserManagementUseCase = new AdminUserManagementUseCaseImpl(this.adminUserService);
    }
    return this.adminUserManagementUseCase;
  }

  /**
   * AdminUserValidationUseCase 인스턴스 반환 (싱글톤)
   */
  static getAdminUserValidationUseCase(): AdminUserValidationUseCase {
    if (!this.adminUserValidationUseCase) {
      if (!this.adminUserService) {
        throw new Error('AdminUserService must be set before creating AdminUserValidationUseCase');
      }
      this.adminUserValidationUseCase = new AdminUserValidationUseCaseImpl(this.adminUserService);
    }
    return this.adminUserValidationUseCase;
  }

  /**
   * AdminUserAnalyticsUseCase 인스턴스 반환 (싱글톤)
   */
  static getAdminUserAnalyticsUseCase(): AdminUserAnalyticsUseCase {
    if (!this.adminUserAnalyticsUseCase) {
      if (!this.adminUserService) {
        throw new Error('AdminUserService must be set before creating AdminUserAnalyticsUseCase');
      }
      this.adminUserAnalyticsUseCase = new AdminUserAnalyticsUseCaseImpl(this.adminUserService);
    }
    return this.adminUserAnalyticsUseCase;
  }

  /**
   * 모든 Use Case 초기화
   */
  static initialize(adminUserService: AdminUserService): void {
    this.setAdminUserService(adminUserService);
    // Use Case 인스턴스들을 미리 생성
    this.getAdminUserManagementUseCase();
    this.getAdminUserValidationUseCase();
    this.getAdminUserAnalyticsUseCase();
  }

  /**
   * 모든 Use Case 리셋 (테스트용)
   */
  static reset(): void {
    this.adminUserService = undefined as any;
    this.adminUserManagementUseCase = undefined as any;
    this.adminUserValidationUseCase = undefined as any;
    this.adminUserAnalyticsUseCase = undefined as any;
  }
}
