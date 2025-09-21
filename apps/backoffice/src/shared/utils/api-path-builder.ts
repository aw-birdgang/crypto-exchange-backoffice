import { appConfig } from '../../config/app.config';
import { API_ROUTES } from '@crypto-exchange/shared';

/**
 * API 경로 빌더
 * 버전 관리와 경로 생성을 중앙화
 */
export class ApiPathBuilder {
  /**
   * 기본 API 경로 생성
   * @param route - API_ROUTES의 경로
   * @returns 완전한 API URL
   */
  static build(route: string): string {
    return `${appConfig.api.baseApiUrl}${route}`;
  }
  
  /**
   * 인증 관련 API 경로 생성
   */
  static auth(route: keyof typeof API_ROUTES.AUTH): string {
    return this.build(API_ROUTES.AUTH[route]);
  }
  
  /**
   * 관리자 관련 API 경로 생성
   */
  static admin(route: keyof typeof API_ROUTES.ADMIN): string {
    return this.build(API_ROUTES.ADMIN[route]);
  }
  
  /**
   * 권한 관련 API 경로 생성
   */
  static permissions(route: keyof typeof API_ROUTES.PERMISSIONS): string {
    return this.build(API_ROUTES.PERMISSIONS[route]);
  }
  
  /**
   * 동적 경로 생성 (파라미터 포함)
   * @param baseRoute - 기본 경로
   * @param params - URL 파라미터
   * @returns 파라미터가 적용된 완전한 API URL
   */
  static buildWithParams(baseRoute: string, params: Record<string, string | number>): string {
    const baseUrl = this.build(baseRoute);
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    
    return `${baseUrl}?${searchParams.toString()}`;
  }
  
  /**
   * 경로 변수 치환
   * @param route - 경로 템플릿 (예: '/users/:id')
   * @param variables - 치환할 변수들
   * @returns 변수가 치환된 경로
   */
  static buildWithVariables(route: string, variables: Record<string, string | number>): string {
    let result = route;
    
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(`:${key}`, String(value));
    });
    
    return this.build(result);
  }
  
  /**
   * 현재 API 설정 정보 반환
   */
  static getConfig() {
    return {
      baseUrl: appConfig.api.baseUrl,
      version: appConfig.api.version,
      baseApiUrl: appConfig.api.baseApiUrl,
      environment: appConfig.environment.mode,
    };
  }
}
